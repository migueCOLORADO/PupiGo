@echo off
cd /d "%~dp0"
set PYTHONUTF8=1
if not exist ".venv\Scripts\python.exe" (
    py -3 -m venv .venv
    if errorlevel 1 goto fallo
)
".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 goto fallo
".venv\Scripts\python.exe" manage.py migrate
if errorlevel 1 goto fallo
".venv\Scripts\python.exe" manage.py restore_taller3
if errorlevel 1 goto fallo
echo Datos restaurados. Configura tu clave con Configurar clave.cmd y abre Iniciar taller.cmd.
pause
exit /b 0
:fallo
echo Se detuvo la preparacion. Revisa el mensaje anterior. Se necesita Python 3.12 o superior.
pause
exit /b 1
