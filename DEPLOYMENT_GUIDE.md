# Micro-Job Platform - Deployment Guide

## Phase 1: Database Migration (JSON to MongoDB)

### Step 1: Set Up MongoDB
Choose one of these options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/microjob`

#### Option B: Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. Start MongoDB service
4. Connection string: `mongodb://localhost:27017/microjob`

### Step 2: Install MongoDB Driver
```bash
cd server
npm install mongoose
```

### Step 3: Run Migration Script
```bash
node scripts/migrateToMongoDB.js
```

This will:
- Connect to MongoDB
- Create collections from JSON files
- Migrate all users, messages, gigs, orders, transactions
- Create indexes for performance
- Verify all data was migrated

## Phase 2: Update Server Configuration

### Step 1: Create .env file
Create `server/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/microjob
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

### Step 2: Update server/index.js
Already configured to use MongoDB connection

## Phase 3: Deploy Frontend

### Option 1: Vercel (Recommended for React)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd d:\capstone webside\capstone
vercel
```

### Option 2: Netlify
1. Push to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

### Option 3: AWS, Google Cloud, Azure
Deploy the built dist folder to your hosting service

## Phase 4: Deploy Backend

### Option 1: Heroku (Free tier ended, but still available)
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"

# Deploy
git push heroku main
```

### Option 2: Railway.app (Recommended)
1. Go to https://railway.app
2. Connect GitHub repo
3. Add MongoDB plugin
4. Deploy automatically

### Option 3: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Set environment variables
5. Deploy

### Option 4: DigitalOcean, AWS, Google Cloud
Deploy Docker container or Node.js app directly

## Phase 5: Update Frontend API URLs

### Update API Base URL
Edit `src/config/api.js` or update all fetch URLs:

**Before (Development):**
```javascript
const API_URL = 'http://localhost:5000/api';
```

**After (Production):**
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.com/api';
```

## Phase 6: SSL/HTTPS Setup

### Get Free SSL Certificate
- Use Let's Encrypt (automatic with most hosting)
- Provided by Vercel, Netlify, Railway automatically

## Complete Deployment Checklist

- [ ] MongoDB database created and configured
- [ ] Migration script run successfully
- [ ] All data verified in MongoDB
- [ ] Backend deployed with environment variables
- [ ] Frontend deployed with correct API URLs
- [ ] CORS configured for your domain
- [ ] SSL/HTTPS enabled
- [ ] Test login with existing users
- [ ] Test chat functionality
- [ ] Test escrow system
- [ ] Monitor error logs
- [ ] Set up backups

## Data Being Migrated

### Collections:
- **users**: Admin, clients, students with passwords (HASHED)
- **messages**: All conversations and chats
- **gigs**: All student services and listings
- **orders**: All transactions and order history
- **transactions**: Payment records
- **clientTransactions**: Client payment history
- **student**: Student profile data

## Security Notes

⚠️ **Important:**
- Never commit .env file to GitHub
- Use environment variables for sensitive data
- Ensure MongoDB is password protected
- Use HTTPS for all connections
- Hash passwords before storing (already done in migration)
- Enable MongoDB authentication

## Troubleshooting

### MongoDB Connection Error
```bash
# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.log(e))"
```

### Data Not Migrating
- Check MongoDB is running
- Verify connection string is correct
- Check JSON files are in server/data folder
- Run migration script with verbose logging

### CORS Issues
- Update CORS_ORIGIN in .env
- Ensure backend URL matches frontend API URL

## Support URLs

- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
