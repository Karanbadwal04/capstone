#!/bin/bash
# Quick Deployment Script for Frontend-Backend Integration

echo "🚀 Frontend Deployment Script"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized"
    echo "Please run: git init && git add remote origin <your-repo>"
    exit 1
fi

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    echo "📦 Changes detected:"
    git status --short
    echo ""
    
    read -p "Do you want to commit and push? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Adding files..."
        git add .
        
        echo "💾 Committing changes..."
        git commit -m "Configure frontend-backend connection with Railway backend

- Created centralized API configuration
- Updated all 15 files to use API_URL from config
- Removed hardcoded localhost:5000 references
- Added environment variable support
- Ready for Vercel deployment"
        
        echo "🚀 Pushing to GitHub..."
        git push origin main
        
        echo "✅ Code pushed successfully!"
        echo ""
        echo "⏭️  Next Steps:"
        echo "1. Go to Vercel Dashboard → Project Settings → Environment Variables"
        echo "2. Add: VITE_API_URL=https://capstone-production-7059.up.railway.app"
        echo "3. Vercel will auto-deploy"
        echo "4. Wait 2-3 minutes for build to complete"
        echo "5. Visit https://microjob.vercel.app/ to test"
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi
