# 🔥 Setup Firebase Web Client ID untuk Google Sign-In

## Langkah-langkah untuk mendapatkan Web Client ID:

### 1. Buka Firebase Console
- Pergi ke [Firebase Console](https://console.firebase.google.com)
- Pilih project `zeko-70d2a`

### 2. Setup Authentication
- Di sidebar kiri, klik **Authentication**
- Klik tab **Sign-in method**
- Klik **Google** provider
- Klik **Enable**
- Isi project support email

### 3. Setup Web App (jika belum ada)
- Klik ikon gear (⚙️) di sebelah "Project Overview"
- Pilih **Project settings**
- Scroll ke bawah ke bagian **Your apps**
- Jika belum ada Web app, klik **Add app** > **Web**
- Isi nickname: `zeko-web`
- **JANGAN** centang "Firebase Hosting"
- Klik **Register app**

### 4. Dapatkan Web Client ID
- Di halaman yang sama (Project settings > Your apps)
- Cari di bagian **SDK setup and configuration**
- Copy semua konfigurasi, contoh:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAZTGGnurGzrfmCXD3uANOhQvxNGnVxvOw",
  authDomain: "zeko-70d2a.firebaseapp.com",
  projectId: "zeko-70d2a",
  storageBucket: "zeko-70d2a.appspot.com",
  messagingSenderId: "101500911706594743924",
  appId: "1:101500911706594743924:web:abcdef123456789"
};
```

### 5. Dapatkan Google Web Client ID
- Masih di Firebase Console
- Klik **Authentication** > **Sign-in method**
- Klik **Google**
- Copy **Web client ID** (yang panjang dengan format: `xxxxx-xxxxxx.apps.googleusercontent.com`)

### 6. Update file .env
Update file `.env` dengan nilai yang benar:

```bash
# Firebase Configuration (dari langkah 4)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAZTGGnurGzrfmCXD3uANOhQvxNGnVxvOw
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=zeko-70d2a.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=zeko-70d2a
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=zeko-70d2a.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=101500911706594743924
EXPO_PUBLIC_FIREBASE_APP_ID=1:101500911706594743924:web:abcdef123456789

# Google Sign-In (dari langkah 5)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=101500911706594743924-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

## ⚠️ Penting!
1. **Web Client ID** berbeda dengan **Client ID** di file JSON Admin SDK
2. Pastikan menggunakan **Web Client ID** dari Authentication > Sign-in method > Google
3. Format Web Client ID: `xxxx-xxxx.apps.googleusercontent.com`

## 🚀 Setelah Update .env
1. Restart development server: `npm start`
2. Test authentication features
3. Untuk Google Sign-In, butuh build development untuk test di device fisik

## 📱 Testing Google Sign-In
```bash
# Untuk Android
npx expo run:android

# Untuk iOS  
npx expo run:ios
```

Google Sign-In tidak akan bekerja di Expo Go atau web preview, harus menggunakan development build pada device fisik.
