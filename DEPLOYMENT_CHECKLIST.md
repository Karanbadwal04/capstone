# Deployment Checklist

## Backend (Railway) ✅
- **URL**: https://capstone-production-7059.up.railway.app
- **Status**: Already deployed

### Required Configuration on Railway:
```
CORS_ORIGIN=https://microjob.vercel.app
```

## Frontend (Vercel) - Next Steps

### Step 1: Update Vercel Environment Variables
1. Go to https://vercel.com → Your Project
2. Click **Settings** → **Environment Variables**
3. Add or update:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://capstone-production-7059.up.railway.app`
   - **Environments**: Select "Production" and "Preview"
4. Click **Save**

### Step 2: Deploy Updated Code
```bash
# From your local machine
cd e:\again exter\aaaaaaa
git add .
git commit -m "Setup backend connection with Railway API"
git push origin main
```

Vercel will automatically:
- Detect the changes
- Build your React app with the new config
- Deploy to https://microjob.vercel.app/

### Step 3: Verify Connection
1. Visit https://microjob.vercel.app/
2. Test any API call (login, view gigs, etc.)
3. Check browser console for any errors

## API Endpoints Your Frontend Uses

All these endpoints should be available on your Railway backend:

```
✅ POST   /api/auth/login
✅ POST   /api/auth/register
✅ GET    /api/gigs/all
✅ POST   /api/gigs/create
✅ GET    /api/gigs/{id}
✅ GET    /api/orders/client/{clientId}
✅ GET    /api/orders/student/{studentId}
✅ POST   /api/orders/create
✅ POST   /api/orders/{id}/approve
✅ POST   /api/orders/{id}/start-work
✅ POST   /api/orders/{id}/submit-work
✅ POST   /api/escrow/create
✅ GET    /api/escrow/status
✅ POST   /api/escrow/release
✅ GET    /api/client/transactions
✅ GET    /api/student/profile
✅ PUT    /api/student/profile
✅ GET    /api/student/earnings
✅ GET    /api/messages/conversations/{user}
✅ GET    /api/messages/conversation/{user1}/{user2}
✅ POST   /api/messages/send
✅ POST   /api/messages/mark-read
```

## Troubleshooting

### "Failed to fetch" errors?
1. Check if Railway backend is running: https://capstone-production-7059.up.railway.app/
2. Verify CORS is enabled on the backend
3. Check browser console → Network tab for actual error

### Environment variable not working?
1. Redeploy on Vercel (just push to git or manually trigger deploy)
2. Wait 2-3 minutes for build to complete
3. Check Vercel logs for any build errors

### Still having issues?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try in incognito/private mode
3. Check if backend is returning proper CORS headers
