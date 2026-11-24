#!/usr/bin/env bash
# Pull the latest code and restart. Run as root on the server: sudo bash /opt/shaadi/deploy/update.sh
set -euo pipefail
cd /opt/shaadi
git pull --ff-only
venv/bin/pip install -q -r requirements.txt
chown -R shaadi:shaadi /opt/shaadi
systemctl restart shaadi
sleep 2; curl -fsS http://127.0.0.1:8000/healthz && echo " updated"
