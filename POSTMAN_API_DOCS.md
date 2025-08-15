# ZEKO API Documentation - Postman Collection

## 🚀 Overview
This document provides comprehensive API documentation for ZEKO Speech Training Backend API. Use this guide to test all endpoints using Postman or any HTTP client.

**Base URL:** `http://localhost:8000`

## 📋 Table of Contents
1. [Authentication Setup](#authentication-setup)
2. [Health Check Endpoints](#health-check-endpoints)
3. [Speech Processing Endpoints](#speech-processing-endpoints)
4. [Error Handling](#error-handling)
5. [Postman Collection Import](#postman-collection-import)

---

## 🔐 Authentication Setup

### Environment Variables
Set up these variables in Postman Environment:

```json
{
  "base_url": "http://localhost:8000",
  "api_key": "your-api-key-here",
  "user_id": "test-user-123"
}
```

---

## 🏥 Health Check Endpoints

### 1. Root Health Check
**GET** `{{base_url}}/`

**Response:**
```json
{
  "message": "ZEKO Speech Training API",
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-08-15T10:30:00.000Z"
}
```

### 2. Detailed Health Check
**GET** `{{base_url}}/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-15T10:30:00.000Z",
  "services": {
    "database": true,
    "google_cloud": false,
    "firebase": false
  },
  "version": "1.0.0"
}
```

---

## 🎤 Speech Processing Endpoints

### 1. Text-to-Speech (TTS)

**POST** `{{base_url}}/api/speech/text-to-speech`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Halo, anak-anak! Mari belajar mengucapkan kata 'mama' dengan benar.",
  "language_code": "id-ID",
  "voice_name": "id-ID-Standard-A",
  "speed": 0.9,
  "user_id": "{{user_id}}"
}
```

**Response:**
```json
{
  "success": true,
  "audio_url": "http://localhost:8000/temp/audio_20250815_103000_abc123.mp3",
  "audio_base64": "UklGRjwAAABXQVZFZm10IBAAAAABAAEA...",
  "duration": 3.5,
  "message": "Text-to-speech conversion successful"
}
```

### 2. Speech-to-Text (STT)

**POST** `{{base_url}}/api/speech/speech-to-text`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `audio_file`: (file) - Audio file (.mp3, .wav, .m4a)
- `user_id`: (text) - "{{user_id}}"
- `target_word`: (text) - "mama"
- `language_code`: (text) - "id-ID"
- `difficulty_level`: (text) - "easy"

**Response:**
```json
{
  "success": true,
  "transcript": "mama",
  "confidence": 0.95,
  "pronunciation_score": 88.5,
  "feedback": "Pengucapan sangat bagus! Suara 'm' di awal kata terdengar jelas.",
  "encouragement": "Wah, {{user_id}} hebat sekali! 🌟",
  "session_id": "session_20250815_103000_def456"
}
```

### 3. Pronunciation Analysis

**POST** `{{base_url}}/api/speech/analyze-pronunciation`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `audio_file`: (file) - Audio file for analysis
- `expected_text`: (text) - "bapa"
- `user_id`: (text) - "{{user_id}}"

**Response:**
```json
{
  "similarity_score": 0.85,
  "pronunciation_feedback": "Good pronunciation!",
  "areas_for_improvement": ["Speak slightly slower"],
  "overall_score": 85
}
```

### 4. Generate Practice Words

**GET** `{{base_url}}/api/speech/practice-words`

**Query Parameters:**
- `difficulty`: easy|medium|hard
- `category`: family|animals|colors|school|food
- `count`: 5 (number of words)
- `age`: 6 (child's age)

**Example URL:**
```
{{base_url}}/api/speech/practice-words?difficulty=easy&category=family&count=5&age=6
```

**Response:**
```json
{
  "words": ["mama", "papa", "kakak", "adik", "nenek"],
  "category": "family",
  "difficulty": "easy",
  "phonetic_guides": {
    "mama": "ma-ma",
    "papa": "pa-pa",
    "kakak": "ka-kak",
    "adik": "a-dik",
    "nenek": "ne-nek"
  },
  "age_appropriate": true
}
```

### 5. Get Available Voices

**GET** `{{base_url}}/api/speech/voices`

**Query Parameters:**
- `language_code`: id-ID (optional)

**Response:**
```json
{
  "voices": [
    {
      "name": "id-ID-Standard-A",
      "language_codes": ["id-ID"],
      "gender": "FEMALE"
    },
    {
      "name": "id-ID-Standard-B",
      "language_codes": ["id-ID"],
      "gender": "MALE"
    }
  ]
}
```

---

## ❌ Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2025-08-15T10:30:00.000Z"
}
```

#### 404 Not Found
```json
{
  "detail": "Endpoint not found"
}
```

#### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error occurred",
  "error_code": "SERVER_ERROR",
  "timestamp": "2025-08-15T10:30:00.000Z"
}
```

---

## 📦 Postman Collection Import

### Option 1: Manual Setup

1. **Create New Collection** named "ZEKO Speech API"
2. **Set Environment Variables:**
   - `base_url`: http://localhost:8000
   - `user_id`: test-user-123

3. **Add Requests** using the endpoints above

### Option 2: JSON Collection

```json
{
  "info": {
    "name": "ZEKO Speech Training API",
    "description": "API endpoints for ZEKO speech training application",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "user_id",
      "value": "test-user-123"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "item": [
        {
          "name": "Root Health",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/",
              "host": ["{{base_url}}"],
              "path": [""]
            }
          }
        },
        {
          "name": "Detailed Health",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/health",
              "host": ["{{base_url}}"],
              "path": ["health"]
            }
          }
        }
      ]
    },
    {
      "name": "Speech Processing",
      "item": [
        {
          "name": "Text to Speech",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"text\": \"Halo, mari belajar mengucapkan kata mama\",\n  \"language_code\": \"id-ID\",\n  \"voice_name\": \"id-ID-Standard-A\",\n  \"speed\": 0.9,\n  \"user_id\": \"{{user_id}}\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/speech/text-to-speech",
              "host": ["{{base_url}}"],
              "path": ["api", "speech", "text-to-speech"]
            }
          }
        },
        {
          "name": "Speech to Text",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "audio_file",
                  "type": "file",
                  "src": "/path/to/audio/file.mp3"
                },
                {
                  "key": "user_id",
                  "value": "{{user_id}}",
                  "type": "text"
                },
                {
                  "key": "target_word",
                  "value": "mama",
                  "type": "text"
                },
                {
                  "key": "language_code",
                  "value": "id-ID",
                  "type": "text"
                },
                {
                  "key": "difficulty_level",
                  "value": "easy",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{base_url}}/api/speech/speech-to-text",
              "host": ["{{base_url}}"],
              "path": ["api", "speech", "speech-to-text"]
            }
          }
        },
        {
          "name": "Analyze Pronunciation",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "formdata",
              "formdata": [
                {
                  "key": "audio_file",
                  "type": "file",
                  "src": "/path/to/audio/file.mp3"
                },
                {
                  "key": "expected_text",
                  "value": "bapa",
                  "type": "text"
                },
                {
                  "key": "user_id",
                  "value": "{{user_id}}",
                  "type": "text"
                }
              ]
            },
            "url": {
              "raw": "{{base_url}}/api/speech/analyze-pronunciation",
              "host": ["{{base_url}}"],
              "path": ["api", "speech", "analyze-pronunciation"]
            }
          }
        },
        {
          "name": "Get Practice Words",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/speech/practice-words?difficulty=easy&category=family&count=5&age=6",
              "host": ["{{base_url}}"],
              "path": ["api", "speech", "practice-words"],
              "query": [
                {
                  "key": "difficulty",
                  "value": "easy"
                },
                {
                  "key": "category",
                  "value": "family"
                },
                {
                  "key": "count",
                  "value": "5"
                },
                {
                  "key": "age",
                  "value": "6"
                }
              ]
            }
          }
        },
        {
          "name": "Get Available Voices",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "{{base_url}}/api/speech/voices?language_code=id-ID",
              "host": ["{{base_url}}"],
              "path": ["api", "speech", "voices"],
              "query": [
                {
                  "key": "language_code",
                  "value": "id-ID"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Basic TTS Test
1. Start with health check to ensure server is running
2. Call TTS endpoint with simple Indonesian text
3. Verify audio URL is returned
4. Test different voice parameters

### Scenario 2: Speech Training Flow
1. Get practice words for specific difficulty
2. Use TTS to generate pronunciation example
3. Upload user's audio recording to STT endpoint
4. Analyze pronunciation accuracy
5. Provide feedback and encouragement

### Scenario 3: Error Handling
1. Test with invalid audio formats
2. Test with missing required fields
3. Test with oversized files
4. Verify appropriate error responses

---

## 📝 Notes

### Audio File Requirements
- **Supported formats:** .mp3, .wav, .m4a, .ogg, .flac
- **Max file size:** 10MB
- **Recommended quality:** 16kHz sample rate, mono channel

### Rate Limiting
- Currently no rate limiting implemented
- Recommended for production: 100 requests/minute per user

### Authentication
- Development environment uses simple user_id
- Production will require Firebase Auth tokens

### Environment Setup
Before testing, ensure:
1. Backend server is running on localhost:8000
2. Python virtual environment is activated
3. All dependencies are installed
4. Google Cloud credentials are configured (optional for basic testing)

---

## 🔗 Additional Resources

- [FastAPI Auto-generated Docs](http://localhost:8000/docs)
- [Redoc Documentation](http://localhost:8000/redoc)
- [ZEKO Development Plan](./DEVELOPMENT_PLAN.md)
- [Google Cloud Setup](./GOOGLE_SIGNIN_SETUP.md)

---

*Last updated: August 15, 2025*
