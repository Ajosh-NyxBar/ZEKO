Write-Host "ZEKO Google Sign-In Diagnostic Tool" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID") {
        Write-Host "✅ GOOGLE_WEB_CLIENT_ID configured" -ForegroundColor Green
    } else {
        Write-Host "❌ GOOGLE_WEB_CLIENT_ID missing in .env" -ForegroundColor Red
    }
    
    if ($envContent -match "EXPO_PUBLIC_FIREBASE_PROJECT_ID") {
        Write-Host "✅ FIREBASE_PROJECT_ID configured" -ForegroundColor Green
    } else {
        Write-Host "❌ FIREBASE_PROJECT_ID missing in .env" -ForegroundColor Red
    }
} else {
    Write-Host "❌ .env file not found. Copy from .env.example" -ForegroundColor Red
}

Write-Host ""
Write-Host "PLATFORM STATUS:" -ForegroundColor Yellow
Write-Host "WEB: Google Sign-In should work with Web Client ID" -ForegroundColor Green
Write-Host "EXPO GO: Limited Google Sign-In support" -ForegroundColor Yellow  
Write-Host "DEV BUILD: Full Google Sign-In support" -ForegroundColor Green
Write-Host ""

Write-Host "QUICK FIXES:" -ForegroundColor Magenta
Write-Host "1. Use Email/Password for testing in Expo Go"
Write-Host "2. Create development build for Google Sign-In"
Write-Host "3. Configure proper SHA-1 in Google Console"
Write-Host ""

Write-Host "USEFUL COMMANDS:" -ForegroundColor Cyan
Write-Host "npx eas build --profile development --platform android"
Write-Host "keytool -list -v -keystore ~/.android/debug.keystore"
Write-Host ""
