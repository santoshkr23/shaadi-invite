# Deploying Shaadi Card on Hostinger KVM 2

KVM 2 (2 vCPU, 8 GB RAM) is enough for this site. Video rendering takes about 1–2 minutes per video and runs one at a time (`VIDEO_WORKERS=1`).

## 0. Test first on the IP address (no domain, no HTTPS)
Run `curl -fsSL https://raw.githubusercontent.com/santoshkr23/shaadi-invite/main/deploy/setup.sh | bash -s -- YOUR.VPS.IP` and open `http://YOUR.VPS.IP` and `http://YOUR.VPS.IP/admin`. Everything works except HTTPS. Later re-run the same command with your domain to switch on HTTPS.

## 1. Order of work
1. In hPanel, create the VPS with the **Ubuntu 24.04 (plain OS)** template. Note its IP.
2. At your domain registrar (or Hostinger DNS) add an **A record** `@` → VPS IP and `www` → VPS IP. Wait until `ping yourdomain.com` shows the VPS IP.
3. `ssh root@VPS_IP`, then run the one-line command from the README. It installs Chrome, ffmpeg, nginx, the app (systemd service), firewall, HTTPS (Let's Encrypt) and a daily backup.
4. Open `https://yourdomain.com/admin`. Password: `grep ADMIN_PASSWORD /opt/shaadi/.env`.
5. Admin → Settings: WhatsApp number and UPI ID. Admin → Video packs / Templates: add your designs.

## 2. Day-to-day
- Logs: `journalctl -u shaadi -f`
- Restart: `systemctl restart shaadi`
- Update code: `sudo bash /opt/shaadi/deploy/update.sh`
- Backups: `/var/backups/shaadi/*.tgz` daily (14 days). Copy one off the server regularly (it contains the database, uploads and packs).
- Data lives in `/opt/shaadi/{data,uploads,videos,packs}`; `git pull` never touches them.

## 3. Troubleshooting
- **Video fails**: `journalctl -u shaadi -n 50`; check `google-chrome --version` and `ffmpeg -version`.
- **Big upload fails**: nginx limit is 220 MB (`client_max_body_size` in `/etc/nginx/sites-available/shaadi`).
- **Cookie/login loop**: make sure you use https and `PUBLIC_URL` matches your domain.
- **Out of disk**: delete old files in `/opt/shaadi/videos` (they are re-created on demand for paid invites).

## 4. Before taking real money
- Change the admin password; keep `.env` private (`chmod 600`).
- Decide refunds and a privacy policy/terms page; customers enter names, phone numbers and photos.
- Test one full order yourself on the live domain (create, pay by UPI, mark paid, download video).
