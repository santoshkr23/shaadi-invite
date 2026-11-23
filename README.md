# Shaadi Card – wedding invitation maker

Chat your wedding details → pick from **100 Indian designs** (20 palettes × 5 styles, Ganesha / Om / Lotus covers) →
get a **shareable link** → download an **MP4 video invite with music**.

## Run (Windows: just double-click run.bat)
```bash
pip install -r requirements.txt
python -m playwright install chromium   # or have Google Chrome installed
sudo apt install ffmpeg
uvicorn app:app --host 0.0.0.0 --port 8000
```
Open http://localhost:8000

## How it works
- `static/index.html` – guided chat builder + template picker + share screen
- `static/invite.html` – the animated invite (book cover, pull-to-reveal date scroll, countdown, swipeable functions, map, RSVP on WhatsApp)
- `static/templates.js` – the 100 templates
- `app.py` – FastAPI: stores invites as JSON, serves `/i/<id>`, records the MP4 (Playwright screen-recording + ffmpeg, mixes `static/music.mp3`)
- `static/music.mp3` – original instrumental synthesised for this project (no licence issues)

Security: all user text is whitelisted/length-limited server-side and escaped on render.
Next steps: login + payments, more templates, regional languages, Hindi/Bengali text.
