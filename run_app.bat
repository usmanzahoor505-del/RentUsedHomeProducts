@echo off
title RentUsedHomeProduct - Install & Run App on Phone
echo ===================================================
echo   Installing & Running RentUsedHomeProduct App
echo ===================================================
echo.

:: 1. Check connected Android device
echo [1/4] Checking connected devices...
adb devices
echo.

:: 2. Port reverse so phone connects to backend on PC
echo [2/4] Setting up ADB port forwarding (Reverse Port 5257)...
adb reverse tcp:5257 tcp:5257
adb reverse tcp:5255 tcp:5255
adb reverse tcp:8081 tcp:8081
echo Port forwarding active.
echo.

:: 3. Install latest debug APK
echo [3/4] Installing updated app onto connected phone...
adb install -r "%~dp0RentUsedHomeProductFrontend\android\app\build\outputs\apk\debug\app-debug.apk"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Warning: Direct APK install failed. Starting React Native run-android instead...
    cd /d "%~dp0RentUsedHomeProductFrontend"
    npx react-native run-android
    goto end
)

:: 4. Launch app on phone
echo [4/4] Launching app on phone screen...
adb shell am start -n com.rentusedhomeproductfrontend/.MainActivity
echo.
echo ===================================================
echo   App launched successfully on your phone!
echo ===================================================

:end
pause
