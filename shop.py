"""Store + admin API for Shaadi Card (catalogue, packs, orders, enquiries, settings)."""
import hashlib, hmac, base64, json, os, re, secrets, shutil, time, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import quote
from fastapi import APIRouter, HTTPException, Request, Response, UploadFile, File, Form
from fastapi.responses import FileResponse
import db

router = APIRouter()
CFG: dict = {}          # filled by configure()
_login_attempts: dict[str, list] = {}

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,40}$")
PACK_KEYS = ["opening", "wedding", "haldi", "mehndi", "sangeet", "engagement", "reception", "closing"]
KINDS = ["video", "website", "card"]
TRADITIONS = ["hindu", "muslim", "sikh", "christian"]
IMG = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
VID = {"video/mp4": ".mp4", "video/webm": ".webm"}
SCENE_EXT = re.compile(r"^[a-z0-9_-]{1,30}\.(jpg|png|webp|mp4|webm)$")


def configure(**kw):
    CFG.update(kw)
    db.init()
    pw = os.environ.get("ADMIN_PASSWORD", "").strip()
    pwfile = CFG["data"] / "admin_password.txt"
    if not pw:
        if not pwfile.exists():
            pwfile.write_text(secrets.token_urlsafe(9))
            print(f"\n*** Admin password generated and saved in {pwfile}: {pwfile.read_text()} ***\n", flush=True)
        pw = pwfile.read_text().strip()
    CFG["admin_pw"] = pw
    CFG["packs"].mkdir(exist_ok=True)
    (CFG["uploads"] / "media").mkdir(exist_ok=True)
    seed()


# ---------------- helpers ----------------
def clip(v, n=300):
    return v.strip()[:n] if isinstance(v, str) else ""


def num(v, lo=0, hi=1_000_000, default=0):
    try:
        return max(lo, min(hi, int(float(v))))
    except Exception:
        return default


def public_url(request: Request) -> str:
    return (os.environ.get("PUBLIC_URL") or str(request.base_url)).rstrip("/")


def wa_number() -> str:
    s = db.settings()
    return re.sub(r"\D", "", s.get("whatsapp") or os.environ.get("OWNER_WHATSAPP", ""))


def item_public(r: dict) -> dict:
    r = dict(r)
    r["images"] = json.loads(r.get("images") or "[]")
    r["languages"] = [x.strip() for x in (r.get("languages") or "").split(",") if x.strip()]
    return r


def secure_cookie(request: Request) -> bool:
    return request.headers.get("x-forwarded-proto", request.url.scheme) == "https"


def require_admin(request: Request):
    tok = request.cookies.get("adm", "")
    row = db.q("SELECT 1 FROM admin_sessions WHERE token=? AND expires>?", (tok, db.now()), one=True) if tok else None
    if not row:
        raise HTTPException(401, "Admin login required")


def save_upload(file: UploadFile, kinds: dict, limit: int, subdir: Path, prefix="") -> str:
    ext = kinds.get(file.content_type)
    if not ext:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")
    subdir.mkdir(parents=True, exist_ok=True)
    name = prefix + secrets.token_hex(8) + ext
    path = subdir / name
    size = 0
    with open(path, "wb") as out:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            if size > limit:
                out.close(); path.unlink(missing_ok=True)
                raise HTTPException(400, f"File too large (max {limit // 1024 // 1024} MB)")
            out.write(chunk)
    return name


# ---------------- seed ----------------
def seed():
    if db.q("SELECT 1 FROM items LIMIT 1"):
        return
    P = "/packs/gemini1/"
    demo = [
        ("ganesha-shubh-vivah", "Ganesha Shubh Vivah", "hindu", "English, Hindi", "Traditional", 549, 749, "Best Seller", "t1", "gemini1", P + "opening.jpg"),
        ("haldi-mehndi-sangeet", "Haldi · Mehndi · Sangeet", "hindu", "English, Hindi", "Festive", 449, 649, "Multi-event", "t5", "gemini1", P + "haldi.jpg"),
        ("royal-palace-wedding", "Royal Palace Wedding", "hindu", "English", "Royal", 349, 549, "", "t12", "gemini1", P + "wedding.jpg"),
        ("sangeet-night", "Sangeet Night", "hindu", "English", "Modern", 399, 599, "New", "t8", "gemini1", P + "sangeet.jpg"),
        ("nikah-mubarak", "Nikah Mubarak", "muslim", "English, Urdu", "Elegant", 449, 649, "", "t3", "gemini1", P + "reception.jpg"),
        ("anand-karaj", "Anand Karaj", "sikh", "English, Punjabi", "Traditional", 399, 599, "", "t5", "gemini1", P + "wedding.jpg"),
        ("church-wedding", "Church Wedding", "christian", "English", "Elegant", 399, 599, "", "t9", "gemini1", P + "closing.jpg"),
        ("wedding-website", "Wedding Website", "hindu", "English, Hindi", "Website", 849, 1199, "Premium", "t2", "", P + "closing.jpg"),
    ]
    for i, (slug, title, trad, lang, style, price, mrp, badge, theme, pack, thumb) in enumerate(demo):
        kind = "website" if "website" in slug else "video"
        db.run("INSERT INTO items(slug,title,kind,tradition,languages,style,price,mrp,badge,theme,vpack,thumb,description,sort,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
               (slug, title, kind, trad, lang, style, price, mrp, badge, theme, pack, thumb,
                "Demo template. Replace the thumbnail and preview video from the admin panel.", i, db.now()))
    db.run("INSERT INTO items(slug,title,kind,tradition,languages,style,price,mrp,badge,theme,thumb,description,moq,material,sort,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
           ("luxury-box-invitation", "Luxury Boxed Invitation Card", "card", "hindu", "English, Hindi", "Luxury", 0, 0, "Physical", "t2", P + "wedding.jpg",
            "Handcrafted boxed wedding cards with a free video invitation. Price on enquiry.", 100, "Velvet box · gold foil", 99, db.now()))


# ---------------- public ----------------
@router.get("/api/meta")
def meta():
    s = db.settings()
    pub = {k: s.get(k, "") for k in ("site_name", "announcement", "currency", "upi_id")}
    pub["whatsapp"] = wa_number()
    pub["razorpay"] = bool(os.environ.get("RAZORPAY_KEY_ID"))
    rows = db.q("SELECT tradition,languages,style,kind FROM items WHERE active=1")
    langs = sorted({l.strip() for r in rows for l in (r["languages"] or "").split(",") if l.strip()})
    return {"settings": pub, "traditions": sorted({r["tradition"] for r in rows}), "languages": langs,
            "styles": sorted({r["style"] for r in rows if r["style"]}), "kinds": sorted({r["kind"] for r in rows})}


@router.get("/api/items")
def items(kind: str = "", tradition: str = "", language: str = "", style: str = "", q: str = "", sort: str = "popular"):
    sql, args = "SELECT * FROM items WHERE active=1", []
    if kind in KINDS:
        sql += " AND kind=?"; args.append(kind)
    if tradition in TRADITIONS:
        sql += " AND tradition=?"; args.append(tradition)
    if language:
        sql += " AND (',' || REPLACE(languages,' ','') || ',') LIKE ?"; args.append(f"%,{language.replace(' ', '')},%")
    if style:
        sql += " AND style=?"; args.append(style)
    if q:
        sql += " AND (title LIKE ? OR description LIKE ?)"; args += [f"%{q[:40]}%"] * 2
    order = {"price_asc": "price ASC", "price_desc": "price DESC", "new": "created_at DESC"}.get(sort, "sort ASC, sales DESC")
    return [item_public(r) for r in db.q(sql + f" ORDER BY {order}", args)]


@router.get("/api/items/{slug}")
def item(slug: str):
    r = db.q("SELECT * FROM items WHERE slug=? AND active=1", (slug,), one=True)
    if not r:
        raise HTTPException(404, "Template not found")
    return item_public(r)


@router.post("/api/items/{slug}/like")
def like(slug: str):
    db.run("UPDATE items SET likes=likes+1 WHERE slug=?", (slug,))
    return {"ok": True}


@router.get("/packs/{pack}/{file}")
def pack_file(pack: str, file: str):
    if not SLUG_RE.match(pack) or not SCENE_EXT.match(file) and file != "pack.json":
        raise HTTPException(404)
    p = CFG["packs"] / pack / file
    if not p.is_file():
        raise HTTPException(404)
    return FileResponse(p)


@router.post("/api/enquiry")
async def enquiry(request: Request):
    b = await request.json()
    name, phone = clip(b.get("name"), 80), re.sub(r"[^0-9+]", "", clip(b.get("phone"), 20))
    if not name or len(phone) < 8:
        raise HTTPException(400, "Name and a valid phone number are required")
    it = db.q("SELECT id,title FROM items WHERE slug=?", (clip(b.get("item"), 60),), one=True)
    iid = clip(b.get("invite"), 60)
    db.run("INSERT INTO enquiries(item_id,invite_id,name,phone,city,qty,note,created_at) VALUES(?,?,?,?,?,?,?,?)",
           (it["id"] if it else None, iid, name, phone, clip(b.get("city"), 60), re.sub(r"\D", "", clip(b.get("qty"), 6)), clip(b.get("note"), 300), db.now()))
    msg = f"Enquiry: {it['title'] if it else 'Shaadi Card'}\nName: {name}\nPhone: {phone}\nCity: {clip(b.get('city'), 60)}\nQty: {clip(b.get('qty'), 6)}\n{clip(b.get('note'), 300)}"
    return {"ok": True, "wa": f"https://wa.me/{wa_number()}?text={quote(msg)}"}


# ---------------- orders / payments ----------------
def invite_item(iid: str):
    d = CFG["load"](iid)
    return d, (db.q("SELECT * FROM items WHERE slug=?", (d.get("item", ""),), one=True) if d.get("item") else None)


def is_paid(iid: str) -> bool:
    d, it = invite_item(iid)
    if not it:
        return db.settings().get("free_without_item") == "1"
    if it["price"] <= 0:
        return True
    return bool(db.q("SELECT 1 FROM orders WHERE invite_id=? AND item_id=? AND status='paid'", (iid, it["id"]), one=True))


@router.get("/api/invites/{iid}/access")
def access(iid: str):
    d, it = invite_item(iid)
    return {"paid": is_paid(iid), "price": it["price"] if it else None, "item": it["title"] if it else None}


def rzp(path: str, payload=None):
    kid, sec = os.environ.get("RAZORPAY_KEY_ID", ""), os.environ.get("RAZORPAY_KEY_SECRET", "")
    req = urllib.request.Request("https://api.razorpay.com/v1/" + path, data=json.dumps(payload).encode() if payload else None,
                                 headers={"Content-Type": "application/json", "Authorization": "Basic " + base64.b64encode(f"{kid}:{sec}".encode()).decode()})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=15).read())
    except urllib.error.HTTPError as e:
        raise HTTPException(502, "Payment gateway error: " + e.read().decode()[:200])


@router.post("/api/orders")
async def create_order(request: Request):
    b = await request.json()
    iid = clip(b.get("invite"), 60)
    d, it = invite_item(iid)
    if not it:
        raise HTTPException(400, "This invitation has no template attached")
    name, phone = clip(b.get("name"), 80), re.sub(r"[^0-9+]", "", clip(b.get("phone"), 20))
    if not name or len(phone) < 8:
        raise HTTPException(400, "Name and a valid phone number are required")
    prev = db.q("SELECT id FROM orders WHERE invite_id=? AND item_id=? AND status='paid'", (iid, it["id"]), one=True)
    if prev:
        return {"mode": "paid"}
    oid = db.run("INSERT INTO orders(user_id,item_id,invite_id,amount,status,created_at) VALUES(0,?,?,?,'created',?)", (it["id"], iid, it["price"], db.now()))
    db.run("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)", (f"order_{oid}_contact", json.dumps({"name": name, "phone": phone})))
    base = public_url(request)
    if os.environ.get("RAZORPAY_KEY_ID") and os.environ.get("RAZORPAY_KEY_SECRET"):
        o = rzp("orders", {"amount": it["price"] * 100, "currency": "INR", "receipt": f"o{oid}"})
        db.run("UPDATE orders SET gateway_order_id=? WHERE id=?", (o["id"], oid))
        return {"mode": "razorpay", "order": oid, "key": os.environ["RAZORPAY_KEY_ID"], "gateway_order": o["id"], "amount": it["price"] * 100, "title": it["title"], "name": name, "phone": phone}
    s = db.settings()
    upi = s.get("upi_id", "")
    msg = f"Hi, I paid Rs.{it['price']} for {it['title']}.\nOrder #{oid}\nName: {name}\nPhone: {phone}\nInvite: {base}/i/{iid}"
    return {"mode": "manual", "order": oid, "amount": it["price"], "upi": upi,
            "upi_link": f"upi://pay?pa={quote(upi)}&pn={quote(s.get('site_name', 'Shaadi Card'))}&am={it['price']}&cu=INR&tn={quote('Order ' + str(oid))}" if upi else "",
            "wa": f"https://wa.me/{wa_number()}?text={quote(msg)}"}


@router.post("/api/orders/verify")
async def verify_order(request: Request):
    b = await request.json()
    oid, pid, sig = num(b.get("order")), clip(b.get("payment_id"), 60), clip(b.get("signature"), 200)
    o = db.q("SELECT * FROM orders WHERE id=?", (oid,), one=True)
    if not o or not o["gateway_order_id"]:
        raise HTTPException(404, "Order not found")
    expect = hmac.new(os.environ.get("RAZORPAY_KEY_SECRET", "").encode(), f"{o['gateway_order_id']}|{pid}".encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expect, sig):
        raise HTTPException(400, "Payment signature mismatch")
    db.run("UPDATE orders SET status='paid', payment_id=? WHERE id=?", (pid, oid))
    db.run("UPDATE items SET sales=sales+1 WHERE id=?", (o["item_id"],))
    return {"ok": True}


# ---------------- admin ----------------
@router.post("/api/admin/login")
async def admin_login(request: Request, response: Response):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "?").split(",")[0].strip()
    tries = [t for t in _login_attempts.get(ip, []) if t > time.time() - 600]
    if len(tries) >= 6:
        raise HTTPException(429, "Too many attempts. Try again in 10 minutes.")
    b = await request.json()
    if not hmac.compare_digest(str(b.get("password", "")).encode(), CFG["admin_pw"].encode()):
        _login_attempts[ip] = tries + [time.time()]
        raise HTTPException(401, "Wrong password")
    tok = secrets.token_urlsafe(32)
    db.run("INSERT INTO admin_sessions(token,expires) VALUES(?,?)", (tok, db.now() + 7 * 86400))
    db.run("DELETE FROM admin_sessions WHERE expires<?", (db.now(),))
    response.set_cookie("adm", tok, max_age=7 * 86400, httponly=True, samesite="lax", secure=secure_cookie(request))
    return {"ok": True}


@router.post("/api/admin/logout")
def admin_logout(request: Request, response: Response):
    db.run("DELETE FROM admin_sessions WHERE token=?", (request.cookies.get("adm", ""),))
    response.delete_cookie("adm")
    return {"ok": True}


@router.get("/api/admin/me")
def admin_me(request: Request):
    require_admin(request)
    return {"ok": True}


@router.get("/api/admin/stats")
def stats(request: Request):
    require_admin(request)
    one = lambda s: list(db.q(s, one=True).values())[0]
    return {"items": one("SELECT COUNT(*) FROM items"), "orders": one("SELECT COUNT(*) FROM orders WHERE status='paid'"),
            "pending": one("SELECT COUNT(*) FROM orders WHERE status='created'"),
            "revenue": one("SELECT COALESCE(SUM(amount),0) FROM orders WHERE status='paid'"),
            "enquiries": one("SELECT COUNT(*) FROM enquiries WHERE status='new'"),
            "invites": len(list(CFG["data"].glob("*-*.json")))}


def item_fields(b: dict, creating=False) -> dict:
    out = {"title": clip(b.get("title"), 80), "kind": b.get("kind") if b.get("kind") in KINDS else "video",
           "occasion": clip(b.get("occasion"), 30) or "wedding", "tradition": b.get("tradition") if b.get("tradition") in TRADITIONS else "hindu",
           "languages": clip(b.get("languages"), 120) or "English", "style": clip(b.get("style"), 30),
           "price": num(b.get("price"), 0, 100000), "mrp": num(b.get("mrp"), 0, 100000), "badge": clip(b.get("badge"), 24),
           "theme": b.get("theme") if re.match(r"^t\d{1,3}$", str(b.get("theme"))) and 1 <= int(str(b["theme"])[1:]) <= 100 else "t1",
           "vpack": clip(b.get("vpack"), 40) if SLUG_RE.match(clip(b.get("vpack"), 40) or "-") else "",
           "preview_video": clip(b.get("preview_video"), 200), "thumb": clip(b.get("thumb"), 200),
           "images": json.dumps([clip(x, 200) for x in (b.get("images") or [])[:8] if isinstance(x, str)]),
           "description": clip(b.get("description"), 1500), "moq": num(b.get("moq"), 0, 100000), "material": clip(b.get("material"), 120),
           "active": 1 if b.get("active", True) else 0, "sort": num(b.get("sort"), 0, 9999, 100)}
    for k in ("preview_video", "thumb"):
        if out[k] and not re.match(r"^(/uploads/media/[a-f0-9]{16}\.(jpg|png|webp|mp4|webm)|/packs/[a-z0-9-]+/[a-z0-9_-]+\.(jpg|png|webp|mp4|webm))$", out[k]):
            out[k] = ""
    if not out["title"]:
        raise HTTPException(400, "Title is required")
    if creating:
        slug = clip(b.get("slug"), 41).lower() or re.sub(r"[^a-z0-9]+", "-", out["title"].lower()).strip("-")[:40]
        if not SLUG_RE.match(slug):
            raise HTTPException(400, "Slug must be lowercase letters, numbers and dashes")
        out["slug"] = slug
    return out


@router.get("/api/admin/items")
def admin_items(request: Request):
    require_admin(request)
    return [item_public(r) for r in db.q("SELECT * FROM items ORDER BY sort ASC, id DESC")]


@router.post("/api/admin/items")
async def admin_item_create(request: Request):
    require_admin(request)
    f = item_fields(await request.json(), creating=True)
    if db.q("SELECT 1 FROM items WHERE slug=?", (f["slug"],), one=True):
        f["slug"] += "-" + secrets.token_hex(2)
    f["created_at"] = db.now()
    iid = db.run(f"INSERT INTO items({','.join(f)}) VALUES({','.join('?' * len(f))})", list(f.values()))
    return {"id": iid, "slug": f["slug"]}


@router.put("/api/admin/items/{iid}")
async def admin_item_update(iid: int, request: Request):
    require_admin(request)
    f = item_fields(await request.json())
    db.run(f"UPDATE items SET {','.join(k + '=?' for k in f)} WHERE id=?", list(f.values()) + [iid])
    return {"ok": True}


@router.delete("/api/admin/items/{iid}")
def admin_item_delete(iid: int, request: Request):
    require_admin(request)
    db.run("DELETE FROM items WHERE id=?", (iid,))
    return {"ok": True}


@router.post("/api/admin/upload")
def admin_upload(request: Request, file: UploadFile = File(...)):
    require_admin(request)
    kinds = {**IMG, **VID}
    name = save_upload(file, kinds, 200 * 1024 * 1024 if file.content_type in VID else 15 * 1024 * 1024, CFG["uploads"] / "media")
    return {"url": f"/uploads/media/{name}"}


def read_pack(pid: str) -> dict:
    p = CFG["packs"] / pid / "pack.json"
    try:
        return {"id": pid, **json.loads(p.read_text())}
    except Exception:
        return {"id": pid, "name": pid, "scenes": {}}


@router.get("/api/admin/packs")
def admin_packs(request: Request):
    require_admin(request)
    return {"keys": PACK_KEYS, "packs": [read_pack(p.parent.name) for p in sorted(CFG["packs"].glob("*/pack.json"))]}


@router.post("/api/admin/packs")
async def admin_pack_create(request: Request):
    require_admin(request)
    b = await request.json()
    pid = clip(b.get("id"), 40).lower()
    if not SLUG_RE.match(pid):
        raise HTTPException(400, "Pack id: lowercase letters, numbers and dashes")
    d = CFG["packs"] / pid
    if (d / "pack.json").exists():
        raise HTTPException(400, "Pack already exists")
    d.mkdir(parents=True, exist_ok=True)
    (d / "pack.json").write_text(json.dumps({"name": clip(b.get("name"), 60) or pid, "scenes": {}}, indent=1))
    return read_pack(pid)


@router.post("/api/admin/packs/{pid}/scene")
def admin_pack_scene(pid: str, request: Request, key: str = Form(...), file: UploadFile = File(...)):
    require_admin(request)
    if not SLUG_RE.match(pid) or key not in PACK_KEYS or not (CFG["packs"] / pid / "pack.json").exists():
        raise HTTPException(404, "Pack or scene key not found")
    ext = ({**IMG, **VID}).get(file.content_type)
    if not ext:
        raise HTTPException(400, "Use JPG/PNG/WebP image or MP4/WebM video")
    d = CFG["packs"] / pid
    for old in d.glob(f"{key}.*"):
        if old.name != "pack.json":
            old.unlink()
    tmp = save_upload(file, {**IMG, **VID}, 200 * 1024 * 1024 if file.content_type in VID else 15 * 1024 * 1024, d, "tmp")
    final = f"{key}{ext}"
    os.replace(d / tmp, d / final)
    pj = json.loads((d / "pack.json").read_text())
    pj.setdefault("scenes", {})[key] = final
    (d / "pack.json").write_text(json.dumps(pj, indent=1))
    return read_pack(pid)


@router.delete("/api/admin/packs/{pid}/scene/{key}")
def admin_pack_scene_delete(pid: str, key: str, request: Request):
    require_admin(request)
    if not SLUG_RE.match(pid) or key not in PACK_KEYS:
        raise HTTPException(404)
    d = CFG["packs"] / pid
    pj = json.loads((d / "pack.json").read_text())
    f = pj.get("scenes", {}).pop(key, None)
    if f and SCENE_EXT.match(f):
        (d / f).unlink(missing_ok=True)
    (d / "pack.json").write_text(json.dumps(pj, indent=1))
    return read_pack(pid)


@router.delete("/api/admin/packs/{pid}")
def admin_pack_delete(pid: str, request: Request):
    require_admin(request)
    if not SLUG_RE.match(pid):
        raise HTTPException(404)
    if db.q("SELECT 1 FROM items WHERE vpack=?", (pid,), one=True):
        raise HTTPException(400, "Pack is used by a template. Change or delete the template first.")
    shutil.rmtree(CFG["packs"] / pid, ignore_errors=True)
    return {"ok": True}


@router.get("/api/admin/orders")
def admin_orders(request: Request):
    require_admin(request)
    rows = db.q("SELECT o.*, i.title FROM orders o LEFT JOIN items i ON i.id=o.item_id ORDER BY o.id DESC LIMIT 300")
    for r in rows:
        c = db.q("SELECT value FROM settings WHERE key=?", (f"order_{r['id']}_contact",), one=True)
        r.update(json.loads(c["value"]) if c else {"name": "", "phone": ""})
    return rows


@router.post("/api/admin/orders/{oid}/status")
async def admin_order_status(oid: int, request: Request):
    require_admin(request)
    st = (await request.json()).get("status")
    if st not in ("paid", "created", "refunded"):
        raise HTTPException(400, "bad status")
    o = db.q("SELECT * FROM orders WHERE id=?", (oid,), one=True)
    if not o:
        raise HTTPException(404)
    if st == "paid" and o["status"] != "paid":
        db.run("UPDATE items SET sales=sales+1 WHERE id=?", (o["item_id"],))
    db.run("UPDATE orders SET status=? WHERE id=?", (st, oid))
    return {"ok": True}


@router.get("/api/admin/enquiries")
def admin_enquiries(request: Request):
    require_admin(request)
    return db.q("SELECT e.*, i.title FROM enquiries e LEFT JOIN items i ON i.id=e.item_id ORDER BY e.id DESC LIMIT 300")


@router.post("/api/admin/enquiries/{eid}/status")
async def admin_enq_status(eid: int, request: Request):
    require_admin(request)
    st = (await request.json()).get("status")
    if st not in ("new", "contacted", "done"):
        raise HTTPException(400, "bad status")
    db.run("UPDATE enquiries SET status=? WHERE id=?", (st, eid))
    return {"ok": True}


SETTING_KEYS = ["site_name", "whatsapp", "support_email", "announcement", "upi_id", "free_without_item"]


@router.get("/api/admin/settings")
def admin_settings(request: Request):
    require_admin(request)
    s = db.settings()
    return {k: s.get(k, "") for k in SETTING_KEYS} | {"razorpay_configured": bool(os.environ.get("RAZORPAY_KEY_ID"))}


@router.put("/api/admin/settings")
async def admin_settings_put(request: Request):
    require_admin(request)
    b = await request.json()
    for k in SETTING_KEYS:
        if k in b:
            db.run("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)", (k, clip(str(b[k]), 200)))
    return {"ok": True}
