#!/usr/bin/env bash
# Safe to run on a server that already hosts other sites: it never removes other nginx sites,
# never changes the firewall policy, and picks its own free local port.
#   curl -fsSL https://raw.githubusercontent.com/santoshkr23/shaadi-invite/main/deploy/setup.sh | sudo bash -s -- <domain-or-server-IP>
# Env overrides: TEST_PORT=8080 (public port used in IP test mode)
set -euo pipefail
DOMAIN="${1:-}"; [ -n "$DOMAIN" ] || { echo "Usage: setup.sh yourdomain.com   (or the server IP for a test without HTTPS)"; exit 1; }
if [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then IPMODE=1; SCHEME=http; else IPMODE=0; SCHEME=https; fi
APP=/opt/shaadi; REPO=https://github.com/santoshkr23/shaadi-invite.git; TEST_PORT="${TEST_PORT:-8090}"
used() { ss -ltnH "sport = :$1" 2>/dev/null | grep -q .; }

echo "== Already listening on this server =="; ss -ltnH | awk '{print $4}' | sed 's/.*://' | sort -un | tr '\n' ' '; echo

# Does another web server (Caddy, Apache, Traefik/Docker...) own port 80? Then do not install or start nginx.
if used 80 && ! pgrep -x nginx >/dev/null; then NGINX=0; echo "!! Port 80 belongs to another web server (not nginx), so nginx will not be installed."; else NGINX=1; fi
# IP test mode: use a public port nothing else listens on (re-runs may keep the port our own site already uses)
if [ "$IPMODE" = 1 ]; then
  OWN=$(grep -oP 'listen \K[0-9]+' /etc/nginx/sites-available/shaadi 2>/dev/null | head -1 || true)
  if [ -n "$OWN" ] && [ "$OWN" = "$TEST_PORT" ]; then :; else
    while used "$TEST_PORT" || grep -rqsE "listen +(\[::\]:)?$TEST_PORT\b" /etc/nginx/sites-enabled /etc/nginx/conf.d; do TEST_PORT=$((TEST_PORT+1)); done
  fi
  echo "Test port: $TEST_PORT"
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y python3 python3-venv python3-pip git ffmpeg wget ca-certificates fonts-noto fonts-noto-core fonts-noto-color-emoji fonts-lohit-deva
[ "$NGINX" = 1 ] && apt-get install -y nginx certbot python3-certbot-nginx

# Google Chrome (needed: it plays H.264 clips from Kling/Runway; Playwright's own Chromium cannot)
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

# private local port for the app: first free one from 8010 up (other sites keep theirs)
if [ -f "$APP/.env" ] && grep -q '^PORT=' "$APP/.env"; then APPPORT=$(grep '^PORT=' "$APP/.env" | cut -d= -f2)
else APPPORT=8010; while used "$APPPORT"; do APPPORT=$((APPPORT+1)); done; fi
if [ ! -f "$APP/.env" ]; then
  cp "$APP/.env.example" "$APP/.env"
  PUB="$SCHEME://$DOMAIN"; [ "$IPMODE" = 1 ] && [ "$NGINX" = 1 ] && PUB="http://$DOMAIN:$TEST_PORT"
  sed -i "s|https://yourdomain.com|$PUB|" "$APP/.env"
  sed -i "s|change-this-long-password|$(head -c 18 /dev/urandom | base64 | tr -dc A-Za-z0-9 | head -c 16)|" "$APP/.env"
fi
sed -i "s|^PORT=.*|PORT=$APPPORT|" "$APP/.env"
chown -R shaadi:shaadi "$APP"; chmod 600 "$APP/.env"

cp "$APP/deploy/shaadi.service" /etc/systemd/system/shaadi.service
systemctl daemon-reload; systemctl enable --now shaadi; systemctl restart shaadi

if [ "$NGINX" = 1 ]; then
  if [ "$IPMODE" = 1 ]; then LISTEN="$TEST_PORT"; SN="_"; else LISTEN="80"; SN="$DOMAIN www.$DOMAIN"; fi
  sed -e "s|listen LISTEN;|listen $LISTEN;|" -e "s|server_name SERVERNAME;|server_name $SN;|" -e "s|APPPORT|$APPPORT|g" "$APP/deploy/nginx.conf" > /etc/nginx/sites-available/shaadi
  ln -sf /etc/nginx/sites-available/shaadi /etc/nginx/sites-enabled/shaadi      # other sites are left untouched
  nginx -t && systemctl reload nginx
  # only open a firewall port if ufw is already active; never enable it or change its policy
  if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
    if [ "$IPMODE" = 1 ]; then ufw allow "$TEST_PORT"/tcp >/dev/null; else ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; fi
  fi
fi

# daily backup of database, uploads and packs (keeps 14 days)
cat > /etc/cron.daily/shaadi-backup <<'CRON'
#!/bin/sh
mkdir -p /var/backups/shaadi
tar czf /var/backups/shaadi/shaadi-$(date +%F).tgz -C /opt/shaadi data uploads packs .env 2>/dev/null
find /var/backups/shaadi -name '*.tgz' -mtime +14 -delete
CRON
chmod +x /etc/cron.daily/shaadi-backup

echo; echo "App is running on 127.0.0.1:$APPPORT   (admin password: grep ADMIN_PASSWORD $APP/.env)"
if [ "$NGINX" = 0 ]; then
  echo "Add a route in your existing web server: $DOMAIN -> http://127.0.0.1:$APPPORT  (details in DEPLOY.md). Keep uploads of 200 MB allowed."
elif [ "$IPMODE" = 1 ]; then
  echo "TEST MODE: open http://$DOMAIN:$TEST_PORT  and  http://$DOMAIN:$TEST_PORT/admin"
  echo "If it does not load, open TCP port $TEST_PORT in the Hostinger VPS firewall (hPanel > VPS > Security > Firewall)."
else
  if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect; then echo "HTTPS enabled."
  else echo "!! Certbot failed. Point the domain's A records (@ and www) to this server, then run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"; fi
  echo "Open https://$DOMAIN  and  https://$DOMAIN/admin"
fi
