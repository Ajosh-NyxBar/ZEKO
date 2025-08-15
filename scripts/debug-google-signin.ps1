# ZEKO Google Sign-In Debug Script (PowerShell)
# Script ini membantu debugging masalah Google Sign-In

Write-Host "🔍 ZEKO Google Sign-In Diagnostic Tool" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    # Check for required variables
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
Write-Host "📱 Platform-specific Information:" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 WEB:" -ForegroundColor Blue
Write-Host "  - Google Sign-In: ✅ Should work with Web Client ID" -ForegroundColor Green
Write-Host "  - Firebase Auth: ✅ Works normally" -ForegroundColor Green
Write-Host ""

Write-Host "📱 EXPO GO:" -ForegroundColor Blue
Write-Host "  - Google Sign-In: ⚠️  Limited support (requires specific setup)" -ForegroundColor Yellow
Write-Host "  - Firebase Auth: ✅ Email/password works" -ForegroundColor Green
Write-Host "  - Package Name: host.exp.exponent" -ForegroundColor Cyan
Write-Host "  - Bundle ID: host.exp.Exponent" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 DEVELOPMENT BUILD:" -ForegroundColor Blue
Write-Host "  - Google Sign-In: ✅ Full support" -ForegroundColor Green
Write-Host "  - Firebase Auth: ✅ All methods work" -ForegroundColor Green
Write-Host "  - Package Name: com.yourcompany.zeko" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Required Setup for Google Sign-In:" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Google Cloud Console:"
Write-Host "   - Web OAuth Client ID"
Write-Host "   - Android OAuth Client ID (for com.yourcompany.zeko AND host.exp.exponent)"
Write-Host "   - iOS OAuth Client ID"
Write-Host ""
Write-Host "2. SHA-1 Fingerprints:"
Write-Host "   - Development: Get from 'keytool -list -v -keystore ~/.android/debug.keystore'"
Write-Host "   - Expo Go: Get Expo's SHA-1 fingerprint"
Write-Host "   - Production: Your release keystore SHA-1"
Write-Host ""
Write-Host "3. Firebase Console:"
Write-Host "   - Enable Google Sign-In in Authentication > Sign-in method"
Write-Host "   - Add OAuth Client IDs to Firebase project"
Write-Host ""

Write-Host "🛠️  Troubleshooting Commands:" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""
Write-Host "# Get development SHA-1 (if Java/Android SDK installed):" -ForegroundColor Gray
Write-Host "keytool -list -v -keystore `$env:USERPROFILE\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android" -ForegroundColor White
Write-Host ""
Write-Host "# Create development build:" -ForegroundColor Gray
Write-Host "npx eas build --profile development --platform android" -ForegroundColor White
Write-Host ""
Write-Host "# Install development build:" -ForegroundColor Gray
Write-Host "npx eas install --id <build-id>" -ForegroundColor White
Write-Host ""

Write-Host "💡 Quick Fix for Expo Go:" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Use Email/Password authentication for testing"
Write-Host "2. Create development build for Google Sign-In testing"
Write-Host "3. Add host.exp.exponent package to Google Console with Expo's SHA-1"
Write-Host ""

Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "- Google Cloud Console: https://console.cloud.google.com/"
Write-Host "- Firebase Console: https://console.firebase.google.com/"
Write-Host "- Expo Development Builds: https://docs.expo.dev/development/build/"
Write-Host "- Google Sign-In Setup: https://docs.expo.dev/guides/google-authentication/"

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
