"""Wedding invitation maker: chat -> invite -> share link -> MP4 download."""
import json, os, re, secrets, subprocess, tempfile, threading, shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

BASE = Path(__file__).parent
DATA, UPLOADS, VIDEOS, STATIC = (BASE / d for d in ("data", "uploads", "videos", "static"))
for d in (DATA, UPLOADS, VIDEOS):
    d.mkdir(exist_ok=True)

THEME_RE = re.compile(r"^t(\d{1,3})$")
IMG_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_UPLOAD = 6 * 1024 * 1024
ID_RE = re.compile(r"^[a-z0-9-]{3,60}$")

app = FastAPI(title="Shaadi Invite")
jobs: dict[str, dict] = {}  # video jobs: id -> {status, error}


def clip(v, n=300):
    return v.strip()[:n] if isinstance(v, str) else ""


def clean(d: dict) -> dict:
    """Whitelist + length-limit everything the user sends (it is rendered on a public page)."""
    person = lambda p: {k: clip((p or {}).get(k), 80) for k in ("name", "father", "mother")}
    out = {
        "groom": person(d.get("groom")),
        "bride": person(d.get("bride")),
        "date": clip(d.get("date"), 10),        # YYYY-MM-DD
        "time": clip(d.get("time"), 5) or "19:00",  # HH:MM
        "venue": clip(d.get("venue"), 120),
        "address": clip(d.get("address"), 250),
        "maps": clip(d.get("maps"), 500),
        "story": clip(d.get("story"), 600),
        "closing": clip(d.get("closing"), 150),
        "rsvp": re.sub(r"[^0-9]", "", clip(d.get("rsvp"), 20)),
        "photo": clip(d.get("photo"), 200),
        "theme": d.get("theme") if THEME_RE.match(str(d.get("theme"))) and 1 <= int(d["theme"][1:]) <= 100 else "t1",
        "functions": [],
    }
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", out["date"]):
        raise HTTPException(400, "date must be YYYY-MM-DD")
    if not re.match(r"^\d{2}:\d{2}$", out["time"]):
        out["time"] = "19:00"
    if out["maps"] and not out["maps"].startswith(("http://", "https://")):
        out["maps"] = ""
    if out["photo"] and not re.match(r"^/uploads/[a-f0-9]{16}\.(jpg|png|webp)$", out["photo"]):
        out["photo"] = ""
    for f in (d.get("functions") or [])[:10]:
        out["functions"].append({k: clip((f or {}).get(k), 120) for k in ("name", "date", "time", "place", "dress")})
    if not out["groom"]["name"] or not out["bride"]["name"]:
        raise HTTPException(400, "groom and bride names are required")
    return out


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    ext = IMG_TYPES.get(file.content_type)
    if not ext:
        raise HTTPException(400, "Only JPG, PNG or WebP images")
    body = await file.read(MAX_UPLOAD + 1)
    if len(body) > MAX_UPLOAD:
        raise HTTPException(400, "Image too large (max 6 MB)")
    name = secrets.token_hex(8) + ext
    (UPLOADS / name).write_bytes(body)
    return {"url": f"/uploads/{name}"}


@app.post("/api/invites")
async def create(request: Request):
    data = clean(await request.json())
    slug = re.sub(r"[^a-z0-9]+", "-", f"{data['groom']['name']}-{data['bride']['name']}".lower()).strip("-")[:40] or "invite"
    iid = f"{slug}-{secrets.token_hex(2)}"
    (DATA / f"{iid}.json").write_text(json.dumps(data, ensure_ascii=False))
    return {"id": iid, "url": f"/i/{iid}"}


def load(iid: str) -> dict:
    if not ID_RE.match(iid) or not (DATA / f"{iid}.json").exists():
        raise HTTPException(404, "Invite not found")
    return json.loads((DATA / f"{iid}.json").read_text())


@app.get("/api/invites/{iid}")
def get_invite(iid: str):
    return load(iid)


@app.get("/i/{iid}")
def page(iid: str):
    load(iid)
    return FileResponse(STATIC / "invite.html")


# ---------- video ----------
def make_video(iid: str, base_url: str):
    from playwright.sync_api import sync_playwright
    out = VIDEOS / f"{iid}.mp4"
    tmp = Path(tempfile.mkdtemp())
    try:
        with sync_playwright() as p:
            kw = {"executable_path": shutil.which("google-chrome") or shutil.which("chromium")} if (shutil.which("google-chrome") or shutil.which("chromium")) else {}
            b = p.chromium.launch(args=["--no-sandbox"], **kw)
            ctx = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1,
                                record_video_dir=str(tmp), record_video_size={"width": 390, "height": 844})
            pg = ctx.new_page()
            pg.goto(f"{base_url}/i/{iid}?record=1", wait_until="load")
            pg.wait_for_timeout(800)
            pg.evaluate("runTour()")
            pg.wait_for_timeout(1200)
            ctx.close(); b.close()
        webm = next(tmp.glob("*.webm"))
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                              "-of", "csv=p=0", str(webm)]).decode().strip())
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(webm), "-stream_loop", "-1", "-i", str(STATIC / "music.mp3"),
                        "-t", f"{dur:.2f}", "-map", "0:v", "-map", "1:a",
                        "-vf", "scale=720:-2:flags=lanczos", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                        "-pix_fmt", "yuv420p", "-af", f"afade=t=out:st={max(0, dur - 2):.2f}:d=2",
                        "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(out) + ".part.mp4"], check=True)
        os.replace(str(out) + ".part.mp4", out)
        jobs[iid] = {"status": "done"}
    except Exception as e:  # noqa
        jobs[iid] = {"status": "error", "error": str(e)[:300]}
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


@app.post("/api/invites/{iid}/video")
def start_video(iid: str, request: Request):
    load(iid)
    if (VIDEOS / f"{iid}.mp4").exists():
        return {"status": "done"}
    if jobs.get(iid, {}).get("status") != "working":
        jobs[iid] = {"status": "working"}
        base = f"http://127.0.0.1:{request.url.port or 80}"
        threading.Thread(target=make_video, args=(iid, base), daemon=True).start()
    return {"status": "working"}


@app.get("/api/invites/{iid}/video")
def video_status(iid: str):
    load(iid)
    if (VIDEOS / f"{iid}.mp4").exists():
        return {"status": "done", "url": f"/api/invites/{iid}/video/file"}
    return jobs.get(iid, {"status": "none"})


@app.get("/api/invites/{iid}/video/file")
def video_file(iid: str):
    load(iid)
    f = VIDEOS / f"{iid}.mp4"
    if not f.exists():
        raise HTTPException(404)
    return FileResponse(f, media_type="video/mp4", filename=f"{iid}.mp4")


app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")
app.mount("/", StaticFiles(directory=STATIC, html=True), name="static")
