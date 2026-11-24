@echo off
cd /d "%~dp0"
where python >nul 2>nul || (echo Python is not installed. Install it from python.org and tick "Add to PATH". & pause & exit /b 1)
python -m pip install -r requirements.txt
where ffmpeg >nul 2>nul || echo NOTE: ffmpeg not found - videos need it. Run: winget install ffmpeg
if not exist "C:\Program Files\Google\Chrome\Application\chrome.exe" echo NOTE: install Google Chrome - video rendering uses it.
start "" http://localhost:8000/admin
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
python -m uvicorn app:app --port 8000
pause
