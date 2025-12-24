#!/bin/bash

echo "🚀 Micro-Job Platform - Quick Deployment Setup"
echo "=============================================="
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
cd server
npm install mongoose
cd ..

# Step 2: Create .env file
echo ""
echo "📝 Step 2: Setting up environment variables..."
if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "✅ Created server/.env"
  echo "⚠️  Please edit server/.env with your MongoDB connection string"
else
  echo "✅ server/.env already exists"
fi

# Step 3: Instructions
echo ""
echo "🎯 Next steps:"
echo ""
echo "1️⃣  Get MongoDB URI:"
echo "   - Go to https://www.mongodb.com/cloud/atlas"
echo "   - Create a free cluster"
echo "   - Copy connection string"
echo ""
echo "2️⃣  Update server/.env with your MongoDB URI"
echo ""
echo "3️⃣  Run migration script:"
echo "   cd server"
echo "   node scripts/migrateToMongoDB.js"
echo ""
echo "4️⃣  Start development:"
echo "   npm run dev  (in root)"
echo "   cd server && node index.js  (in another terminal)"
echo ""
echo "5️⃣  Choose hosting platform from HOSTING_GUIDE.md"
echo ""
echo "📚 Read these guides:"
echo "   - DEPLOYMENT_GUIDE.md (detailed instructions)"
echo "   - HOSTING_GUIDE.md (quick start for each platform)"
echo ""
echo "✅ Setup complete!"
