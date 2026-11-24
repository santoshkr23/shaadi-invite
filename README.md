# Shaadi Card

Wedding video-invitation store for Indian weddings (a MyInvitations-style shop).
Customers pick a design, answer a few questions, pay, and download a vertical 1080×1920 video plus a shareable invite link and QR code.
You manage everything from **/admin**: templates, prices, video packs (Gemini images or Kling/Runway clips), orders, enquiries and settings.

## How you add a new design
1. Make 8 scene images (or short animated clips) in Gemini / Kling: `opening, wedding, haldi, mehndi, sangeet, engagement, reception, closing` (vertical 9:16, no text).
2. **Admin → Video packs → New pack**, upload each scene (image or MP4).
3. **Admin → Templates → New template**: pick the pack, upload a thumbnail and a sample preview video, set the price.
4. It appears on the home page immediately. Customer names, dates, parents, events, photos and music are added on top automatically.

## Run locally (Windows): double-click `run.bat`, then open http://localhost:8000 and http://localhost:8000/admin
The admin password is printed on first start and saved in `data/admin_password.txt` (or set `ADMIN_PASSWORD`).
Requirements: Python 3.10+, Google Chrome, ffmpeg on PATH.

## Deploy on Hostinger KVM 2 (Ubuntu 22.04/24.04)
1. Point your domain's **A record** (and `www`) to the VPS IP.
2. SSH in as root and run: `curl -fsSL https://raw.githubusercontent.com/santoshkr23/shaadi-invite/main/deploy/setup.sh | bash -s -- yourdomain.com`
3. Edit `/opt/shaadi/.env` (admin password, WhatsApp number, optional Razorpay keys), then `systemctl restart shaadi`.
4. Update later with: `sudo bash /opt/shaadi/deploy/update.sh`

See `DEPLOY.md` for details, backups and troubleshooting.

## Payments
- **Manual UPI (default)**: set your UPI ID in Admin → Settings. Customer pays, sends proof on WhatsApp, you press *Mark paid* in Admin → Orders, and their video unlocks.
- **Razorpay**: set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Payments are verified by signature and unlock the video automatically.

## Config (`.env`)
`PUBLIC_URL`, `ADMIN_PASSWORD`, `OWNER_WHATSAPP`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `PORT`, `VIDEO_WORKERS`, `CHROME_PATH`.

## Stack
FastAPI + SQLite (`data/shaadi.db`) · static HTML/JS (no build step) · Playwright (Chrome) records the video page, ffmpeg adds music · segno for QR codes.
