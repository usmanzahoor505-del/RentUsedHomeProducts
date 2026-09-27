@echo off
title RentUsedHomeProduct - Backend Server
echo ===================================================
echo   Starting RentUsedHomeProduct Backend Server
echo ===================================================
echo.

:: Setup port forwarding for connected Android phone
echo [1/3] Setting up ADB port forwarding (if device is connected)...
adb reverse tcp:5257 tcp:5257 2>nul
adb reverse tcp:5255 tcp:5255 2>nul
adb reverse tcp:8081 tcp:8081 2>nul
echo Done.
echo.

:: Detect Local IP Address
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set "LOCAL_IP=%%a"
)

echo [2/3] Local Machine IP: %LOCAL_IP%
echo       Backend will listen on: http://0.0.0.0:5257
echo       Swagger UI URL:         http://localhost:5257/swagger
echo       Phone API URL:          http://%LOCAL_IP%:5257/api
echo.

:: Run backend
echo [3/3] Launching .NET Backend...
cd /d "%~dp0RentUsedHomeProduct-Backend\RentUsedHomeProduct-Backend"
dotnet run --urls "http://0.0.0.0:5257"

pause
