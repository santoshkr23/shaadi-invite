@echo off
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Install it from python.org and tick "Add to PATH". & pause & exit /b 1)
python -m pip install -r requirements.txt
python -m playwright install chromium
where ffmpeg >nul 2>nul || echo NOTE: ffmpeg not found - video download needs it. Run: winget install ffmpeg
start "" http://localhost:8000
python -m uvicorn app:app --port 8000
pause
