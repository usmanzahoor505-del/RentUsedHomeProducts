@echo off
title RentUsedHomeProduct - Backend Server
echo ===================================================
echo   RentUsedHomeProduct - Backend Server Launcher
echo ===================================================
echo.

:: 1. Free any stale process locking the executable
echo [1/4] Closing any previously running backend instances to release file lock...
taskkill /F /IM "RentUsedHomeProduct-Backend.exe" >nul 2>&1
timeout /t 1 /nobreak >nul
echo Done.
echo.

:: 2. Setup port forwarding for connected Android phone
echo [2/4] Setting up ADB port forwarding (if device is connected)...
adb reverse tcp:5257 tcp:5257 >nul 2>&1
adb reverse tcp:5255 tcp:5255 >nul 2>&1
adb reverse tcp:8081 tcp:8081 >nul 2>&1
echo Done.
echo.

:: 3. Detect Local IP Address
echo [3/4] Detecting Local Network IP...
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set "LOCAL_IP=%%a"
)
echo       Local IP:               %LOCAL_IP%
echo       Backend Listening on:   http://0.0.0.0:5257
echo       Swagger UI URL:         http://localhost:5257/swagger
echo       Phone API URL:          http://%LOCAL_IP%:5257/api
echo.

:: 4. Run backend
echo [4/4] Launching .NET 8 Backend...
cd /d "%~dp0RentUsedHomeProduct-Backend\RentUsedHomeProduct-Backend"
dotnet run --urls "http://0.0.0.0:5257"

pause
