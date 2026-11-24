#!/usr/bin/env bash
# One-time setup for Ubuntu 22.04/24.04 on a Hostinger KVM 2 VPS. Run as root:
#   curl -fsSL https://raw.githubusercontent.com/santoshkr23/shaadi-invite/main/deploy/setup.sh | sudo bash -s -- yourdomain.com
set -euo pipefail
DOMAIN="${1:-}"; [ -n "$DOMAIN" ] || { echo "Usage: setup.sh yourdomain.com   (or the server IP for a test without HTTPS)"; exit 1; }
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then IPMODE=1; SCHEME=http; else IPMODE=0; SCHEME=https; fi
APP=/opt/shaadi; REPO=https://github.com/santoshkr23/shaadi-invite.git

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y python3 python3-venv python3-pip git nginx ffmpeg certbot python3-certbot-nginx ufw wget ca-certificates fonts-noto fonts-noto-core fonts-noto-color-emoji fonts-lohit-deva

# Google Chrome (needed: it plays H.264 clips from Kling/Runway; Playwright's own Chromium can't)
if ! command -v google-chrome >/dev/null; then
  wget -q -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
  apt-get install -y /tmp/chrome.deb
fi

id shaadi >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin shaadi
if [ -d "$APP/.git" ]; then git -C "$APP" pull --ff-only; else git clone "$REPO" "$APP"; fi
mkdir -p "$APP"/{data,uploads,videos,packs}
python3 -m venv "$APP/venv"
"$APP/venv/bin/pip" install -q --upgrade pip
"$APP/venv/bin/pip" install -q -r "$APP/requirements.txt"

if [ ! -f "$APP/.env" ]; then
  cp "$APP/.env.example" "$APP/.env"
  sed -i "s|https://yourdomain.com|$SCHEME://$DOMAIN|" "$APP/.env"
  sed -i "s|change-this-long-password|$(head -c 18 /dev/urandom | base64 | tr -dc A-Za-z0-9 | head -c 16)|" "$APP/.env"
  echo ">>> Admin password saved in $APP/.env (ADMIN_PASSWORD). Edit it, plus OWNER_WHATSAPP."
fi
chown -R shaadi:shaadi "$APP"; chmod 600 "$APP/.env"

cp "$APP/deploy/shaadi.service" /etc/systemd/system/shaadi.service
if [ "$IPMODE" = 1 ]; then SN="_"; else SN="$DOMAIN www.$DOMAIN"; fi
sed "s/server_name DOMAIN www.DOMAIN;/server_name $SN;/" "$APP/deploy/nginx.conf" > /etc/nginx/sites-available/shaadi
ln -sf /etc/nginx/sites-available/shaadi /etc/nginx/sites-enabled/shaadi
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl daemon-reload; systemctl enable --now shaadi; systemctl reload nginx

ufw allow OpenSSH >/dev/null; ufw allow 'Nginx Full' >/dev/null; ufw --force enable >/dev/null

# daily backup of the database, uploads and packs (keeps 14 days)
cat > /etc/cron.daily/shaadi-backup <<'CRON'
#!/bin/sh
mkdir -p /var/backups/shaadi
tar czf /var/backups/shaadi/shaadi-$(date +%F).tgz -C /opt/shaadi data uploads packs .env 2>/dev/null
find /var/backups/shaadi -name '*.tgz' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/shaadi-backup
if [ "$IPMODE" = 1 ]; then
  echo; echo "IP test mode (no HTTPS). Open http://$DOMAIN  ·  Admin: http://$DOMAIN/admin"
  echo "When you have a domain, re-run this script with the domain to enable HTTPS."
  exit 0
fi
# HTTPS (DNS A record for the domain must already point to this server)
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect; then
  echo "HTTPS enabled."
else
  echo "!! Certbot failed. Point the domain's A record to this server's IP, then run:"
  echo "   certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi
echo; echo "Done. Open https://$DOMAIN  ·  Admin: https://$DOMAIN/admin"
