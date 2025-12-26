# Frontend-Backend Connection Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   Vercel CDN / Hosting             │
        │   https://microjob.vercel.app/     │
        │                                     │
        │  ┌──────────────────────────────┐  │
        │  │   React Frontend             │  │
        │  │                              │  │
        │  │  ✅ All pages configured     │  │
        │  │  ✅ API_URL imported         │  │
        │  │  ✅ Environment variables    │  │
        │  └──────────┬───────────────────┘  │
        └─────────────┼──────────────────────┘
                      │
                      │ API Requests
                      │ HTTPS
                      │
                      ▼
        ┌────────────────────────────────────┐
        │   Railway.app Backend              │
        │ https://capstone-production-...   │
        │                                     │
        │  ┌──────────────────────────────┐  │
        │  │   Express/Node.js Server     │  │
        │  │                              │  │
        │  │  ✅ CORS enabled             │  │
        │  │  ✅ API routes               │  │
        │  │  ✅ Database connection      │  │
        │  └──────────┬───────────────────┘  │
        │             │                       │
        │             ▼                       │
        │  ┌──────────────────────────────┐  │
        │  │   MongoDB / Database         │  │
        │  └──────────────────────────────┘  │
        └────────────────────────────────────┘
```

## 🔄 Request-Response Flow

```
1. User Action (Click button, form submit)
        ↓
2. Component imports API_URL
        ↓
3. JavaScript makes fetch request
        │
        ├─ URL: `https://capstone-production-7059.up.railway.app/api/...`
        ├─ Method: GET/POST/PUT
        ├─ Headers: Content-Type, Authorization
        └─ Body: JSON data (if POST/PUT)
        ↓
4. Request sent over HTTPS to Railway Backend
        ↓
5. Backend processes request
        │
        ├─ Validate input
        ├─ Check authentication
        ├─ Query database
        └─ Generate response
        ↓
6. Backend sends response (JSON)
        ↓
7. Frontend receives response
        │
        ├─ Parse JSON
        ├─ Update component state
        └─ Re-render UI
        ↓
8. User sees updated content
```

## 📂 Code Structure

```
Frontend Project (Vercel)
│
├── src/
│   ├── config/
│   │   └── apiConfig.js          ← Central API configuration
│   │
│   ├── pages/
│   │   ├── Auth.jsx              ← Imports API_URL
│   │   ├── ClientDashboard.jsx   ← Imports API_URL
│   │   ├── StudentProfile.jsx    ← Imports API_URL
│   │   └── ... (12 pages total)  ← All import API_URL
│   │
│   ├── components/
│   │   └── ListingCard.jsx       ← Imports API_URL
│   │
│   └── hooks/
│       └── useEscrow.jsx         ← Imports API_URL
│
├── .env                          ← Environment variables
├── vite.config.js                ← Build configuration
└── package.json
```

## 🔐 Security Flow

```
┌─────────────────┐
│  Vercel Secret  │ (Environment Variables)
│                 │
│ VITE_API_URL=   │
│ https://...     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build Process   │ (During deployment)
│                 │
│ Vite injects    │
│ env vars        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Compiled Frontend Bundle    │
│                             │
│ API_URL =                   │
│ https://...railway.app/api  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│  CDN / Browser  │
│                 │
│ Safe to expose  │ (Backend URL is public)
└─────────────────┘
```

## 🎯 Key Components

### 1. API Configuration
**File**: `src/config/apiConfig.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'fallback';
export const API_URL = `${API_BASE_URL}/api`;
```

**Why**: Single source of truth for API base URL

### 2. Environment Variables
**Files**: `.env`, `.env.example`
```
VITE_API_URL=https://capstone-production-7059.up.railway.app
```

**Why**: Different URLs for dev/prod

### 3. Usage in Components
**Every Component**:
```javascript
import { API_URL } from '../config/apiConfig';

fetch(`${API_URL}/endpoint`)
```

**Why**: Consistent API calls throughout app

## 🚀 Deployment Pipeline

```
1. Developer
   └─ Commits code to GitHub
       │
       ▼
2. GitHub
   └─ Webhook notifies Vercel
       │
       ▼
3. Vercel Build
   ├─ Checkout code
   ├─ Install dependencies
   ├─ Inject environment variables
   │  └─ VITE_API_URL from dashboard
   ├─ Run build: npm run build
   │  └─ Vite compiles React + injects env vars
   └─ Upload to CDN
       │
       ▼
4. Production
   ├─ Frontend: https://microjob.vercel.app/
   └─ Uses API_URL from environment
       │
       ▼
5. Users Access
   └─ Browser loads frontend
       └─ All API calls use Railway backend
```

## 📊 API Endpoints Map

```
┌──────────────────────────────────────────────────────────────┐
│                 Railway Backend API                          │
│           https://capstone-...railway.app/api/               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Auth Routes ──────────────────────────────────────────┐ │
│  │ • POST /auth/login                                     │ │
│  │ • POST /auth/register                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Gigs Routes ──────────────────────────────────────────┐ │
│  │ • GET  /gigs/all                                       │ │
│  │ • POST /gigs/create                                    │ │
│  │ • GET  /gigs/{id}                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Orders Routes ────────────────────────────────────────┐ │
│  │ • GET  /orders/client/{id}                             │ │
│  │ • GET  /orders/student/{id}                            │ │
│  │ • POST /orders/create                                  │ │
│  │ • POST /orders/{id}/approve                            │ │
│  │ • POST /orders/{id}/start-work                         │ │
│  │ • POST /orders/{id}/submit-work                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Escrow Routes ────────────────────────────────────────┐ │
│  │ • GET  /escrow/status                                  │ │
│  │ • POST /escrow/create                                  │ │
│  │ • POST /escrow/release                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ More Routes... ───────────────────────────────────────┐ │
│  │ • Messages                                             │ │
│  │ • Transactions                                         │ │
│  │ • Student Profile                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## ✅ Verification Checklist

- [x] API configuration created
- [x] Environment variables set
- [x] All 15 files updated (12 pages + 2 components + 1 hook)
- [x] Vite config updated
- [x] Documentation created
- [ ] Code pushed to GitHub
- [ ] Vercel environment variable set
- [ ] Frontend tested with backend

---

**Status**: ✅ Architecture complete and ready for production!
