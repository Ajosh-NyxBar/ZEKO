#!/bin/bash

# ZEKO Google Sign-In Debug Script
# Script ini membantu debugging masalah Google Sign-In

echo "🔍 ZEKO Google Sign-In Diagnostic Tool"
echo "======================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check for required variables
    if grep -q "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID" .env; then
        echo "✅ GOOGLE_WEB_CLIENT_ID configured"
    else
        echo "❌ GOOGLE_WEB_CLIENT_ID missing in .env"
    fi
    
    if grep -q "EXPO_PUBLIC_FIREBASE_PROJECT_ID" .env; then
        echo "✅ FIREBASE_PROJECT_ID configured"
    else
        echo "❌ FIREBASE_PROJECT_ID missing in .env"
    fi
else
    echo "❌ .env file not found. Copy from .env.example"
fi

echo ""
echo "📱 Platform-specific Information:"
echo "================================="
echo ""

echo "🌐 WEB:"
echo "  - Google Sign-In: ✅ Should work with Web Client ID"
echo "  - Firebase Auth: ✅ Works normally"
echo ""

echo "📱 EXPO GO:"
echo "  - Google Sign-In: ⚠️  Limited support (requires specific setup)"
echo "  - Firebase Auth: ✅ Email/password works"
echo "  - Package Name: host.exp.exponent"
echo "  - Bundle ID: host.exp.Exponent"
echo ""

echo "🚀 DEVELOPMENT BUILD:"
echo "  - Google Sign-In: ✅ Full support"
echo "  - Firebase Auth: ✅ All methods work"
echo "  - Package Name: com.yourcompany.zeko"
echo ""

echo "📋 Required Setup for Google Sign-In:"
echo "====================================="
echo ""
echo "1. Google Cloud Console:"
echo "   - Web OAuth Client ID"
echo "   - Android OAuth Client ID (for com.yourcompany.zeko AND host.exp.exponent)"
echo "   - iOS OAuth Client ID"
echo ""
echo "2. SHA-1 Fingerprints:"
echo "   - Development: Get from 'keytool -list -v -keystore ~/.android/debug.keystore'"
echo "   - Expo Go: Get Expo's SHA-1 fingerprint"
echo "   - Production: Your release keystore SHA-1"
echo ""
echo "3. Firebase Console:"
echo "   - Enable Google Sign-In in Authentication > Sign-in method"
echo "   - Add OAuth Client IDs to Firebase project"
echo ""

echo "🛠️  Troubleshooting Commands:"
echo "============================="
echo ""
echo "# Get development SHA-1:"
echo "keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android"
echo ""
echo "# Create development build:"
echo "npx eas build --profile development --platform android"
echo ""
echo "# Install development build:"
echo "npx eas install --id <build-id>"
echo ""

echo "💡 Quick Fix for Expo Go:"
echo "=========================="
echo ""
echo "1. Use Email/Password authentication for testing"
echo "2. Create development build for Google Sign-In testing"
echo "3. Add host.exp.exponent package to Google Console with Expo's SHA-1"
echo ""

echo "🔗 Useful Links:"
echo "================"
echo "- Google Cloud Console: https://console.cloud.google.com/"
echo "- Firebase Console: https://console.firebase.google.com/"
echo "- Expo Development Builds: https://docs.expo.dev/development/build/"
echo "- Google Sign-In Setup: https://docs.expo.dev/guides/google-authentication/"
