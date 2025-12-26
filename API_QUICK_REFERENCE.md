# Quick Reference: API Configuration

## 🎯 How to Use API in Your Code

### Import the API URL
```javascript
import { API_URL } from '../config/apiConfig';
```

### Make a GET Request
```javascript
const response = await fetch(`${API_URL}/gigs/all`);
const data = await response.json();
```

### Make a POST Request
```javascript
const response = await fetch(`${API_URL}/orders/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ /* your data */ })
});
```

### With Authentication
```javascript
const token = localStorage.getItem('token');
const response = await fetch(`${API_URL}/student/profile`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(profileData)
});
```

## 🌍 Environment URLs

### Development (Local)
```
VITE_API_URL=http://localhost:5000
```

### Production (Railway on Vercel)
```
VITE_API_URL=https://capstone-production-7059.up.railway.app
```

## 📍 API Base URL
- **Variable**: `API_URL`
- **Value**: `{VITE_API_URL}/api`
- **Example**: `https://capstone-production-7059.up.railway.app/api`

## 🔍 API Endpoints Quick List

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Gigs
- `GET /api/gigs/all` - Get all gigs
- `POST /api/gigs/create` - Create new gig
- `GET /api/gigs/{id}` - Get gig details

### Orders
- `GET /api/orders/client/{clientId}` - Get client orders
- `GET /api/orders/student/{studentId}` - Get student orders
- `POST /api/orders/create` - Create order
- `POST /api/orders/{id}/approve` - Approve order
- `POST /api/orders/{id}/start-work` - Start work
- `POST /api/orders/{id}/submit-work` - Submit work

### Escrow
- `GET /api/escrow/status` - Check escrow status
- `POST /api/escrow/create` - Create escrow
- `POST /api/escrow/release` - Release escrow funds

### Transactions
- `GET /api/client/transactions` - Client transactions
- `GET /api/student/earnings` - Student earnings

### Student Profile
- `GET /api/student/profile` - Get profile
- `PUT /api/student/profile` - Update profile

### Messages
- `GET /api/messages/conversations/{user}` - Get conversations
- `GET /api/messages/conversation/{user1}/{user2}` - Get messages
- `POST /api/messages/send` - Send message
- `POST /api/messages/mark-read` - Mark as read

## 🛠️ File Locations

### API Configuration
- `src/config/apiConfig.js` - Main configuration file

### Environment Variables
- `.env` - Local development
- `.env.example` - Template reference
- Vercel Dashboard → Environment Variables (Production)

## 🐛 Common Issues

### "Failed to fetch" error
- Check if backend is running
- Verify CORS is enabled
- Check network tab in DevTools

### API URL still pointing to localhost
- Rebuild the project: `npm run build`
- Clear browser cache
- Check if environment variable is set

### Environment variable not working in production
- Set `VITE_API_URL` in Vercel dashboard
- Redeploy on Vercel
- Wait 2-3 minutes for build

## ✅ Testing the Connection

### In Development
```bash
# Terminal 1: Start backend
cd server && node index.js

# Terminal 2: Start frontend
npm run dev
```

### In Production
1. Visit https://microjob.vercel.app/
2. Open DevTools → Console
3. Try any action (login, view gigs)
4. Should see successful API calls in Network tab

## 📚 Related Documentation
- `BACKEND_CONNECTION_SETUP.md` - Detailed setup guide
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `INTEGRATION_SUMMARY.md` - Complete change summary
