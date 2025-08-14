# Firebase Authentication Setup Guide

## 🔥 Panduan Setup Firebase Authentication dengan Google Sign-In

### 1. Setup Firebase Project

1. **Buka [Firebase Console](https://console.firebase.google.com/)**

2. **Buat Project Baru atau Gunakan yang Ada**
   - Klik "Create a project" atau pilih project yang sudah ada
   - Ikuti langkah-langkah setup project

3. **Enable Authentication**
   - Di sidebar, pilih "Authentication"
   - Klik tab "Sign-in method"
   - Enable "Email/Password" dan "Google"

### 2. Setup Google Sign-In

1. **Enable Google Provider**
   - Di Authentication > Sign-in method
   - Klik "Google"
   - Toggle "Enable"
   - Isi Project support email

2. **Download Configuration Files**

   **Untuk Android:**
   - Di Project Settings > General
   - Scroll ke bawah ke "Your apps"
   - Klik "Add app" > Android
   - Isi package name: `com.yourcompany.zeko` (sesuaikan dengan package.json name)
   - Download `google-services.json`
   - Letakkan file di `android/app/google-services.json`

   **Untuk iOS:**
   - Klik "Add app" > iOS
   - Isi iOS bundle ID: `com.yourcompany.zeko`
   - Download `GoogleService-Info.plist`
   - Letakkan file di `ios/zeko/GoogleService-Info.plist`

### 3. Update Firebase Configuration

1. **Update `config/firebase.ts`**
   - Buka Firebase Console > Project Settings > General
   - Scroll ke "Your apps" > Web app
   - Copy configuration dan paste ke `config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // dari Firebase Console
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com", 
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

2. **Update Google Web Client ID**
   - Di Firebase Console > Authentication > Sign-in method > Google
   - Copy "Web client ID"
   - Update `hooks/useAuth.ts` di bagian `GoogleSignin.configure()`:

```typescript
GoogleSignin.configure({
  webClientId: 'your-web-client-id-here.apps.googleusercontent.com',
});
```

### 4. Platform-Specific Setup

#### Android Setup

1. **Update `android/app/build.gradle`**
```gradle
apply plugin: 'com.google.gms.google-services' // Add this line
```

2. **Update `android/build.gradle`**
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.3.15' // Add this line
  }
}
```

3. **Update `android/app/src/main/AndroidManifest.xml`**
```xml
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:roundIcon="@mipmap/ic_launcher_round"
  android:allowBackup="false"
  android:theme="@style/AppTheme">
  
  <!-- Add Google Play Services version -->
  <meta-data
    android:name="com.google.android.gms.version"
    android:value="@integer/google_play_services_version" />
    
  <!-- Your existing activity declarations -->
</application>
```

#### iOS Setup

1. **Update `ios/zeko/Info.plist`**
   - Tambahkan URL scheme dari `GoogleService-Info.plist`
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.yourcompany.zeko</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

2. **Update `ios/Podfile`**
```ruby
# Add this line
pod 'GoogleSignIn'
```

3. **Run Pod Install**
```bash
cd ios && pod install
```

### 5. Testing

1. **Build dan Test di Device**
```bash
# For Android
npm run android

# For iOS  
npm run ios
```

2. **Test Fitur**
   - Email/Password Login
   - Google Sign-In
   - Logout

### 6. Firebase Security Rules

Untuk production, update Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Troubleshooting

**Error: "Module not found: firebase"**
- Pastikan sudah install: `npm install firebase @react-native-google-signin/google-signin`

**Error: "Google Sign-In failed"**
- Pastikan Web Client ID sudah benar
- Pastikan SHA-1 fingerprint sudah ditambahkan (Android)
- Pastikan bundle ID sudah benar (iOS)

**Error: "Play Services not available"**
- Test di real device, bukan emulator
- Pastikan Google Play Services terinstall

**Android SHA-1 Fingerprint**
```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore (untuk production)
keytool -list -v -keystore path/to/your-release-key.keystore -alias your-alias-name
```

### 8. Additional Features

Untuk menambah fitur lain:

1. **Forgot Password**
```typescript
import { sendPasswordResetEmail } from 'firebase/auth';

const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};
```

2. **Email Verification**
```typescript
import { sendEmailVerification } from 'firebase/auth';

const verifyEmail = async (user: User) => {
  await sendEmailVerification(user);
};
```

3. **Update Profile**
```typescript
import { updateProfile } from 'firebase/auth';

const updateUserProfile = async (user: User, displayName: string) => {
  await updateProfile(user, { displayName });
};
```

### 9. File Structure

```
ZEKO/
├── config/
│   └── firebase.ts          # Firebase configuration
├── hooks/
│   └── useAuth.ts          # Authentication hook
├── components/
│   ├── LoginScreen.tsx     # Updated login screen
│   └── AuthStatus.tsx      # User status component
└── app/
    └── (tabs)/
        └── index.tsx       # Main app with auth logic
```

### 10. Production Checklist

- [ ] Firebase project di production mode
- [ ] API keys dan secrets di environment variables
- [ ] Security rules sudah proper
- [ ] Error handling sudah comprehensive
- [ ] Loading states sudah ditangani
- [ ] Offline handling (optional)
- [ ] Analytics tracking (optional)

## 🎉 Selesai!

Sekarang aplikasi Anda sudah terintegrasi dengan Firebase Authentication dan Google Sign-In. User bisa:

1. ✅ Register dengan email/password
2. ✅ Login dengan email/password  
3. ✅ Login dengan Google
4. ✅ Logout
5. ✅ Melihat status authentication

Untuk development selanjutnya, Anda bisa menambahkan fitur seperti:
- Forgot password
- Email verification
- User profile management
- Social login lainnya (Facebook, Apple, dll)
