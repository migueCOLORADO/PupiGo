@echo off
cd /d "%~dp0"
set PYTHONUTF8=1
".venv\Scripts\python.exe" manage.py runserver 127.0.0.1:8000 --noreload
pause
