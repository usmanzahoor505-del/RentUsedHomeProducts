@echo off
title RentUsedHomeProduct - Change API IP & Update Phone
echo ==========================================================
echo   RentUsedHomeProduct - Change API IP ^& Update Phone
echo ==========================================================
echo.

:: 1. Detect active IPv4
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set "DETECTED_IP=%%a"
)

echo Detected current Wi-Fi IP: %DETECTED_IP%
echo.
set /p USER_IP="Enter your new IP (or press Enter to use %DETECTED_IP%): "
if "%USER_IP%"=="" set "USER_IP=%DETECTED_IP%"

echo.
echo [1/4] Updating RentUsedHomeProductFrontend\src\utils\api.js with IP: %USER_IP%...

powershell -NoProfile -Command ^
    "$path = 'RentUsedHomeProductFrontend\src\utils\api.js';" ^
    "$content = Get-Content $path -Raw;" ^
    "$content = $content -replace 'http://[0-9\.]+:5257', ('http://' + '%USER_IP%' + ':5257');" ^
    "$content = $content -replace 'http://[0-9\.]+:5255', ('http://' + '%USER_IP%' + ':5257');" ^
    "Set-Content -Path $path -Value $content -NoNewline;"

echo Done updating api.js!
echo.

echo [2/4] Compiling React Native offline bundle (takes ~1 minute)...
cd /d "%~dp0RentUsedHomeProductFrontend"
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
if %ERRORLEVEL% NEQ 0 (
    echo Error during bundling!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Compiling Android APK...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Error during Gradle build!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Installing updated APK onto connected phone...
adb reverse tcp:5257 tcp:5257 2>nul
adb reverse tcp:5255 tcp:5255 2>nul
adb install -r "%~dp0RentUsedHomeProductFrontend\android\app\build\outputs\apk\debug\app-debug.apk"
adb shell am start -n com.rentusedhomeproductfrontend/.MainActivity

echo.
echo ==========================================================
echo   SUCCESS! The app is now updated with IP %USER_IP%
echo ==========================================================
pause
