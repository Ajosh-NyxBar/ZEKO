# Google Sign-In Setup untuk Expo Go dan Development Build

## 🚨 Mengapa Google Sign-In Tidak Berfungsi di Expo Go?

### Perbedaan Web vs Mobile:
- **Web**: Menggunakan `signInWithPopup` dari Firebase Auth (langsung ke browser)
- **Mobile**: Membutuhkan native Google Sign-In SDK + konfigurasi tambahan

## 📋 Setup Lengkap Google Sign-In

### 1. **Google Cloud Console Setup**

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project Firebase Anda
3. Pergi ke **APIs & Services** > **Credentials**
4. Buat **OAuth 2.0 Client IDs** untuk:
   - **Web application** (untuk web)
   - **Android** (untuk Android)
   - **iOS** (untuk iOS)

### 2. **Android Configuration**

#### A. Dapatkan SHA-1 Fingerprint
```bash
# Untuk development (Expo Go)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Untuk production
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

#### B. Tambahkan SHA-1 ke Google Console
1. Di Google Console > Credentials > Android OAuth client
2. Tambahkan SHA-1 fingerprint
3. Set package name: `host.exp.exponent` (untuk Expo Go)

### 3. **iOS Configuration**

#### A. Bundle Identifier
- Development: `host.exp.Exponent`
- Production: Bundle ID dari app.json

#### B. URL Scheme
- Salin iOS Client ID dari Google Console
- Format: `com.googleusercontent.apps.YOUR_IOS_CLIENT_ID`

### 4. **Environment Variables**

Pastikan file `.env` berisi:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id_here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id_here.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id_here.apps.googleusercontent.com
```

### 5. **Update app.json**

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.zeko",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.yourcompany.zeko",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

## 🔧 Testing Options

### Option 1: Development Build (Recommended)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build development version
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Option 2: Expo Go (Limited)
- Hanya berfungsi jika menggunakan package name yang tepat
- Android: `host.exp.exponent`
- Bundle identifier harus sesuai

## 🐛 Common Issues & Solutions

### Issue 1: "Sign in with Google temporarily disabled"
**Solution**: Pastikan SHA-1 fingerprint benar untuk environment yang digunakan

### Issue 2: "Network request failed"
**Solution**: Periksa internet connection dan firewall

### Issue 3: "Google Sign In is not available"
**Solution**: Install development build atau gunakan device fisik

### Issue 4: "Invalid client ID"
**Solution**: Pastikan Web Client ID benar di environment variables

## 📱 Quick Fix untuk Testing

Untuk testing cepat di Expo Go:

1. **Update package name di app.json:**
```json
"android": {
  "package": "host.exp.exponent"
}
```

2. **Dapatkan Expo Go SHA-1:**
```bash
# Expo Go debug SHA-1 (umum)
SHA1: A8:30:FB:0D:4C:34:84:B4:10:8A:F3:B8:E6:C4:96:59:DE:F8:94:96
```

3. **Tambahkan SHA-1 ini ke Google Console**

4. **Test dengan development build untuk hasil terbaik**

## 🎯 Recommended Flow

1. Gunakan **email/password** untuk testing di Expo Go
2. Setup **development build** untuk Google Sign-In
3. Deploy ke **production** dengan proper certificates
