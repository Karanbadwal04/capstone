# Micro-Job Platform - Complete Hosting Setup Guide

## 🎯 Quick Start (5 Steps)

### Step 1: Prepare MongoDB
```bash
# Create MongoDB Atlas account
# Go to: https://www.mongodb.com/cloud/atlas
# Create cluster and get connection string
```

### Step 2: Create .env file
```bash
cd server
cp .env.example .env

# Edit .env with your MongoDB URI:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/microjob
```

### Step 3: Install Mongoose
```bash
cd server
npm install mongoose
```

### Step 4: Run Migration
```bash
# This migrates all data from JSON to MongoDB
node scripts/migrateToMongoDB.js
```

### Step 5: Deploy
Choose one hosting platform below

---

## 🌐 Hosting Options

### Option 1: Railway.app (⭐ RECOMMENDED)

**Best for:** Full-stack apps, easiest setup

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your capstone repository
5. Add MongoDB plugin (Railway provides free MongoDB)
6. Set environment variables in Railway dashboard
7. Push to GitHub - deploys automatically

**Cost:** Free tier available, ~$5-10/month for production

---

### Option 2: Render.com

**Best for:** Free hosting with Node.js

**Steps:**
1. Go to https://render.com
2. Sign up with GitHub
3. Create new "Web Service"
4. Connect your repository
5. Settings:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `cd server && node index.js`
6. Add MongoDB Atlas connection in environment variables
7. Deploy

**Cost:** Free tier, $7/month for production

---

### Option 3: Heroku

**Best for:** Established platform

**Steps:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-micro-job-app

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

**Cost:** Hobby free tier ended, paid plans from $7/month

---

### Option 4: AWS EC2 + RDS/MongoDB Atlas

**Best for:** Scalable production apps

**Steps:**
1. Create EC2 instance (t2.micro free tier)
2. SSH into instance
3. Install Node.js and npm
4. Clone repository
5. Set up .env
6. Run migration
7. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "microjob"
   pm2 startup
   pm2 save
   ```

**Cost:** Free tier EC2 + MongoDB Atlas free tier

---

### Option 5: DigitalOcean

**Best for:** Developers wanting control

**Steps:**
1. Create Droplet ($4/month)
2. SSH in
3. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
4. Clone repo and setup
5. Use Nginx as reverse proxy
6. Use PM2 for process management

**Cost:** $4-6/month

---

## 📱 Deploy Frontend

### Option 1: Vercel (⭐ RECOMMENDED for React)

**Steps:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd d:\capstone webside\capstone
vercel
```

**Cost:** Free tier available, auto-scales

**Features:**
- Automatic deployments from GitHub
- CDN everywhere
- Built-in analytics
- Environment variables

---

### Option 2: Netlify

**Steps:**
1. Connect GitHub repo
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Deploy

**Cost:** Free tier, $19/month pro

---

### Option 3: GitHub Pages + Custom Domain

For static hosting (limited)

---

## 🗄️ MongoDB Hosting Options

### Option 1: MongoDB Atlas (⭐ RECOMMENDED)

- **Free tier:** 512 MB storage
- **Pros:** Easy setup, backups, security features
- **Cons:** Limited free tier
- **URL:** https://www.mongodb.com/cloud/atlas

```
Connection: mongodb+srv://user:pass@cluster.mongodb.net/microjob
```

### Option 2: Local MongoDB (Not recommended for production)

- **Pros:** Full control
- **Cons:** Need server management, backups

### Option 3: Mongoose (Railway provides)

- Included with Railway deployment
- Automatically managed

---

## 🔐 Security Checklist

- [ ] Never commit .env to GitHub
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS everywhere
- [ ] Set up CORS properly
- [ ] Hash passwords (already done)
- [ ] Set up backups
- [ ] Monitor logs for errors
- [ ] Use strong database password
- [ ] Enable IP whitelist on MongoDB

---

## 📊 Complete Deployment Checklist

### Pre-Deployment
- [ ] Test locally with MongoDB
- [ ] Run migration script
- [ ] Verify all data migrated
- [ ] Test login with real users
- [ ] Test chat functionality
- [ ] Test payments/escrow

### MongoDB Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster
- [ ] Get connection string
- [ ] Add IP whitelist
- [ ] Create database user

### Environment Setup
- [ ] Create .env file
- [ ] Add MONGODB_URI
- [ ] Add API URLs
- [ ] Add CORS origins

### Backend Deployment
- [ ] Choose hosting platform
- [ ] Push code to GitHub
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Test API endpoints
- [ ] Monitor logs

### Frontend Deployment
- [ ] Update API URLs in code
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/Netlify/other
- [ ] Test all features
- [ ] Verify API calls work

### Post-Deployment
- [ ] Test user registration
- [ ] Test login
- [ ] Test messaging
- [ ] Test gig creation
- [ ] Test payments
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Set up monitoring

---

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check connection string
# Verify IP is whitelisted in MongoDB Atlas
# Test locally first
```

### "API 404 errors"
- Check API URL in frontend matches backend domain
- Verify CORS is configured
- Check environment variables

### "Database empty after deployment"
- Run migration script before deploying
- Or use seed data included in repo

### "Slow performance"
- Upgrade MongoDB tier
- Add database indexes
- Use CDN for static files
- Implement caching

---

## 📝 After Deployment

1. **Set up monitoring:** Use Sentry or LogRocket
2. **Set up backups:** MongoDB Atlas auto-backup
3. **Set up alerts:** Uptime monitoring
4. **Custom domain:** Point DNS to hosting
5. **SSL certificate:** Auto-generated by hosting

---

## 💡 Recommended Setup (Easiest)

**Total Cost:** ~$15/month or free tier

1. **Frontend:** Vercel (free)
2. **Backend:** Railway (free tier or $5/month)
3. **Database:** MongoDB Atlas (free tier)
4. **Domain:** Namecheap ($1-10/year)

**Why?**
- Automatic deployments
- No server management
- Built-in monitoring
- Easy scaling
- GitHub integration

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com
- Mongoose Docs: https://mongoosejs.com
