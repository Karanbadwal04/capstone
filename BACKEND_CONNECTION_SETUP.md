# Frontend & Backend Connection Guide

## ✅ Changes Made

Your frontend has been successfully configured to connect with your backend at: **https://capstone-production-7059.up.railway.app**

### 1. **Created API Configuration File**
   - **File**: `src/config/apiConfig.js`
   - **Purpose**: Centralized API URL management
   - **Usage**: All fetch calls now use this configuration

### 2. **Environment Variables**
   - **`.env`** file created with backend URL
   - **`.env.example`** provided for reference
   
   ```
   VITE_API_URL=https://capstone-production-7059.up.railway.app
   ```

### 3. **Updated All API Calls**
   All files with API calls have been updated to use the new configuration:
   
   **Pages Updated:**
   - `src/pages/Auth.jsx`
   - `src/pages/ClientDashboard.jsx`
   - `src/pages/ClientOrders.jsx`
   - `src/pages/ClientSearch.jsx`
   - `src/pages/ClientTransactions.jsx`
   - `src/pages/CreateListing.jsx`
   - `src/pages/HireGig.jsx`
   - `src/pages/StudentGigs.jsx`
   - `src/pages/StudentOrders.jsx`
   - `src/pages/StudentEarnings.jsx`
   - `src/pages/StudentProfile.jsx`
   - `src/pages/Messages.jsx`

   **Components Updated:**
   - `src/components/ListingCard.jsx`
   - `src/hooks/useEscrow.jsx`

### 4. **Updated Vite Configuration**
   - **File**: `vite.config.js`
   - Now properly handles environment variables

## 🚀 How to Deploy

### For Vercel (Frontend):

1. **Add environment variable in Vercel dashboard:**
   - Go to your project settings → Environment Variables
   - Add: `VITE_API_URL=https://capstone-production-7059.up.railway.app`

2. **Redeploy your frontend:**
   ```bash
   git add .
   git commit -m "Connect frontend with Railway backend"
   git push origin main
   ```

3. **Vercel will automatically:**
   - Build with the new configuration
   - Deploy to https://microjob.vercel.app/

### For Railway (Backend):

Make sure your backend has CORS enabled for your frontend domain:
- **Frontend Domain**: `https://microjob.vercel.app`

## 📋 Environment Configuration

Your app now supports:
- **Development**: Uses local environment variables from `.env`
- **Production (Vercel)**: Uses environment variables from Vercel dashboard
- **Fallback**: Defaults to `https://capstone-production-7059.up.railway.app`

## ✨ How It Works

Instead of hardcoded URLs like:
```javascript
fetch('http://localhost:5000/api/gigs/all')
```

All code now uses:
```javascript
import { API_URL } from '../config/apiConfig';

fetch(`${API_URL}/gigs/all`)
```

This makes it easy to change the backend URL in one place!

## 🔧 Future Changes

If you need to change the backend URL in the future:
1. Just update the `VITE_API_URL` in `.env` (for development)
2. Update the variable in Vercel dashboard (for production)
3. The entire app will automatically use the new URL!

## 📝 Notes
- All `localhost:5000` references have been removed
- The API configuration respects environment variables
- Your Vercel frontend is now ready to communicate with Railway backend
