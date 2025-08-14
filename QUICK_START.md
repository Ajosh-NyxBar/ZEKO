# 🚀 Quick Start - Firebase Auth dengan Google Sign-In

## Langkah Cepat untuk Testing

### 1. Install Dependencies (sudah selesai)
```bash
npm install firebase @react-native-google-signin/google-signin
```

### 2. Setup Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru atau gunakan yang ada
3. Enable Authentication > Email/Password dan Google
4. Copy konfigurasi dari Project Settings

### 3. Update Konfigurasi

**File: `config/firebase.ts`**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSy...", // Dari Firebase Console
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id", 
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

**File: `hooks/useAuth.ts`** (line 27)
```typescript
GoogleSignin.configure({
  webClientId: 'your-web-client-id.apps.googleusercontent.com', // Dari Firebase Console
});
```

### 4. Test Development

Untuk development cepat, bisa gunakan Expo Go:

```bash
npm start
```

Scan QR code dengan Expo Go app.

**Note:** Google Sign-In tidak berfungsi di Expo Go. Untuk test Google Sign-In, harus build development build:

```bash
# Build development 
npx expo install --fix
npx expo run:android
# atau
npx expo run:ios
```

### 5. Fitur yang Sudah Tersedia

✅ **Email/Password Authentication**
- Register akun baru
- Login dengan email/password
- Validasi form

✅ **Google Sign-In Integration**
- Login dengan Google account
- Automatic user profile sync

✅ **Authentication State Management**
- Auto-login jika user sudah login
- Logout functionality
- Loading states

✅ **UI Components**
- LoginScreen dengan design menarik
- AuthStatus untuk menampilkan user info
- Responsive design

### 6. File yang Diubah/Ditambah

```
ZEKO/
├── config/
│   └── firebase.ts              # ✨ BARU - Firebase config
├── hooks/
│   └── useAuth.ts              # ✨ BARU - Auth hook
├── components/
│   ├── LoginScreen.tsx         # ✏️ UPDATED - Firebase integration
│   └── AuthStatus.tsx          # ✨ BARU - User status component
├── app/
│   └── (tabs)/index.tsx        # ✏️ UPDATED - Auth flow
├── .env.example                # ✨ BARU - Environment variables template
├── app.json                    # ✏️ UPDATED - Google Sign-In plugin
└── FIREBASE_SETUP.md           # ✨ BARU - Detailed setup guide
```

### 7. Testing Checklist

- [ ] Firebase project dibuat dan configured
- [ ] Email/Password login berfungsi
- [ ] Register user baru berfungsi  
- [ ] Loading states tampil dengan benar
- [ ] Error handling menampilkan pesan yang tepat
- [ ] Google Sign-In berfungsi (perlu development build)
- [ ] Logout berfungsi
- [ ] User state persistent setelah refresh

### 8. Next Steps

Setelah basic auth berfungsi, bisa tambahkan:

1. **Forgot Password**
2. **Email Verification** 
3. **User Profile Management**
4. **Social Login lainnya**
5. **Firestore Database Integration**

### 9. Troubleshooting Cepat

**❌ "Module not found: firebase"**
- Run: `npm install`

**❌ "Google Sign-In not working"**
- Pastikan tidak menggunakan Expo Go
- Build development build: `npx expo run:android`

**❌ "Invalid API Key"**
- Check Firebase config di `config/firebase.ts`
- Pastikan API key benar dari Firebase Console

**❌ "Auth domain not authorized"**
- Pastikan domain sudah diset di Firebase Console
- Check Firebase > Authentication > Settings > Authorized domains

### 🎯 Target
Dalam 15 menit Anda sudah bisa test email/password authentication. Untuk Google Sign-In butuh setup tambahan ~30 menit.
