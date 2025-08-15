# 🚀 ZEKO API Quick Start Guide

## 📦 Import ke Postman

### Langkah 1: Import Collection
1. Buka Postman
2. Klik **Import** di kiri atas
3. Drag & drop file `postman_collection.json` atau klik **Choose Files**
4. Klik **Import**

### Langkah 2: Import Environment
1. Di Postman, klik ⚙️ **Settings** (gear icon)
2. Pilih **Manage Environments**
3. Klik **Import**
4. Pilih file `postman_environment.json`
5. Klik **Import**

### Langkah 3: Set Environment
1. Di dropdown environment (kanan atas), pilih **"ZEKO Development Environment"**
2. Pastikan `base_url` diset ke `http://localhost:8000`

## 🏃‍♂️ Quick Test

### 1. Start Backend Server
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test Health Check
- Pilih folder **"🏥 Health & Status"**
- Run **"Root Health Check"**
- Status: `200 OK`
- Response: `{"message": "ZEKO Speech Training API"}`

### 3. Test Text-to-Speech
- Pilih folder **"🎤 Speech Processing"**
- Run **"Text to Speech (TTS)"**
- Akan menghasilkan audio URL dan base64 data

## 🎯 Test Scenarios

### Scenario A: Basic TTS
```json
{
  "text": "Halo anak-anak, mari belajar bersama!",
  "language_code": "id-ID",
  "voice_name": "id-ID-Standard-A",
  "speed": 0.9
}
```

### Scenario B: Practice Words
- URL: `/api/speech/practice-words?difficulty=easy&category=family&count=5&age=6`
- Expected: Array of family words for 6-year-old

### Scenario C: STT with Audio
1. Record audio file (mama.mp3)
2. Upload via form-data
3. Set target_word: "mama"
4. Get pronunciation score

## 🔧 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `base_url` | `http://localhost:8000` | API server URL |
| `user_id` | `test-user-123` | Test user ID |
| `language_code` | `id-ID` | Indonesian language |
| `default_voice` | `id-ID-Standard-A` | Female voice |
| `child_age` | `6` | Target age for content |

## 📝 Audio File Requirements

### Supported Formats
- ✅ MP3 (.mp3)
- ✅ WAV (.wav)
- ✅ M4A (.m4a)
- ✅ OGG (.ogg)
- ✅ FLAC (.flac)

### File Specifications
- **Max Size:** 10MB
- **Sample Rate:** 16kHz recommended
- **Channels:** Mono preferred
- **Duration:** 1-30 seconds optimal

## 🧪 Testing Tips

### 1. Create Test Audio Files
```bash
# Using online TTS or record simple words:
# mama.mp3, papa.mp3, buku.mp3, etc.
```

### 2. Test Order
1. ✅ Health checks first
2. ✅ TTS with simple text
3. ✅ Get practice words
4. ✅ STT with recorded audio
5. ✅ Pronunciation analysis

### 3. Error Testing
- Upload .txt file instead of audio
- Send empty request body
- Use invalid difficulty levels

## 🔍 Response Validation

### Success Response Structure
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2025-08-15T10:30:00Z"
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "error_code": "ERROR_TYPE",
  "timestamp": "2025-08-15T10:30:00Z"
}
```

## 🎮 Character Integration

### Imron & Siti Responses
API responses include character-specific encouragement:

```json
{
  "encouragement": "Wah, hebat sekali! Imron bangga dengan kamu! 🌟",
  "character_response": "Siti bilang: 'Coba lagi ya, pasti bisa!' 🤗"
}
```

## 🚨 Troubleshooting

### Common Issues

**1. Server Not Running**
```
Error: connect ECONNREFUSED ::1:8000
```
✅ Solution: Start backend server dengan uvicorn

**2. File Upload Failed**
```
"Audio file validation failed"
```
✅ Solution: Check file format dan size (max 10MB)

**3. Google Cloud Error**
```
"Google Cloud credentials not found"
```
✅ Solution: Set GOOGLE_APPLICATION_CREDENTIALS (optional untuk testing)

### Debug Steps
1. Check server logs
2. Verify file paths
3. Test with curl first
4. Check environment variables

## 📚 Advanced Usage

### Custom Test Scripts
Postman Tests sudah include validasi dasar. Untuk advanced testing:

```javascript
// Custom test in Postman
pm.test("Audio URL is valid", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.audio_url).to.match(/^http.*\.mp3$/);
});

pm.test("Pronunciation score is reasonable", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.pronunciation_score).to.be.within(0, 100);
});
```

### Automation
```javascript
// Pre-request script untuk dynamic data
pm.globals.set("timestamp", new Date().toISOString());
pm.globals.set("random_user", "user_" + Math.random().toString(36).substr(2, 9));
```

## 🎯 Next Steps

1. ✅ Import collection dan environment
2. ✅ Test basic endpoints
3. ✅ Record sample audio files
4. ✅ Test full speech training flow
5. ✅ Explore character responses
6. ✅ Test error scenarios

Happy Testing! 🎉
