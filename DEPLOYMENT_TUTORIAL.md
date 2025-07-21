# Step-by-Step Tutorial: Deploy Your Numerology Calculator to Heroku + GitHub

This tutorial will teach you how to host your numerology calculator on Heroku with GitHub integration and a custom domain, while maintaining the ability to develop locally in VSCode.

## 🎯 What You'll Achieve

By the end of this tutorial, you'll have:
- ✅ Your code in a GitHub repository
- ✅ Automatic deployment to Heroku when you push to GitHub
- ✅ A live website with your custom domain
- ✅ A workflow where you can code in VSCode and see changes go live automatically

---

## 📋 Prerequisites

Make sure you have accounts for:
1. **GitHub** (github.com) - Free account
2. **Heroku** (heroku.com) - Free account (but apps cost $7/month minimum)
3. **Domain registrar** (GoDaddy, Namecheap, etc.) - If you want a custom domain

**Alternative Recommendation**: Consider **Vercel** instead of Heroku - it's free for static sites and has the same GitHub integration. I'll show both approaches.

---

## 🚀 Method 1: Heroku Deployment (As Requested)

### Step 1: Prepare Your Project for Git

1. **Open Terminal in VSCode** (Terminal → New Terminal)

2. **Create a .gitignore file** to exclude unnecessary files:
   ```bash
   # In VSCode, create a new file called .gitignore and add:
   ```
   
   Copy this content into `.gitignore`:
   ```
   # macOS files
   .DS_Store
   
   # Exclude non-numerology data files
   Data/*.xlsx
   Data/*.csv
   Data/*.docx
   Data/Anonymized*
   Data/Pollfish*
   Data/Survey*
   Data/Pricing*
   
   # Keep only numerology JSON files
   !Data/chinese-new-year.json
   !Data/zodiac-animals.json
   !Data/compatibility.json
   
   # Exclude legacy files
   Old/
   
   # Environment files (for later use)
   .env
   .env.local
   ```

3. **For Heroku: Create required files**
   
   Create `package.json` (Heroku needs this to detect a Node.js app):
   ```json
   {
     "name": "numerology-calculator",
     "version": "2.1.0",
     "description": "Advanced numerology calculator with Chinese zodiac compatibility",
     "main": "index.html",
     "scripts": {
       "start": "node server.js"
     },
     "dependencies": {
       "express": "^4.18.2"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

   Create `server.js` (simple server to serve your static files):
   ```javascript
   const express = require('express');
   const path = require('path');
   const app = express();
   const port = process.env.PORT || 3000;
   
   // Serve static files from the root directory
   app.use(express.static(__dirname));
   
   // Serve index.html for the root route
   app.get('/', (req, res) => {
     res.sendFile(path.join(__dirname, 'index.html'));
   });
   
   app.listen(port, () => {
     console.log(`Numerology Calculator running on port ${port}`);
   });
   ```

### Step 2: Initialize Git Repository

In your terminal (inside your project folder):

```bash
# Initialize Git repository
git init

# Add all files to staging
git add .

# Make your first commit
git commit -m "Initial commit: Numerology Calculator v2.1.0"
```

### Step 3: Create GitHub Repository

1. **Go to GitHub.com** and log in
2. **Click the "+" icon** in the top right → "New repository"
3. **Repository settings:**
   - Repository name: `numerology-calculator`
   - Description: `Advanced numerology calculator with Chinese zodiac compatibility`
   - Make it **Public** (or Private if you prefer)
   - **Don't** check "Add a README file" (you already have one)
   - **Don't** add .gitignore or license (you already have .gitignore)
4. **Click "Create repository"**

### Step 4: Connect Local Repository to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/numerology-calculator.git

# Set main branch name
git branch -M main

# Push your code to GitHub
git push -u origin main
```

**Your code is now on GitHub!** 🎉

### Step 5: Set Up Heroku

1. **Go to Heroku.com** and log in
2. **Install Heroku CLI** (if not already installed):
   - **Mac**: `brew tap heroku/brew && brew install heroku`
   - **Windows**: Download from heroku.com/cli

3. **Login to Heroku** from terminal:
   ```bash
   heroku login
   ```

4. **Create Heroku app**:
   ```bash
   # Create app (replace 'your-app-name' with your desired name)
   heroku create your-numerology-app
   
   # Or let Heroku generate a name
   heroku create
   ```

### Step 6: Deploy to Heroku

**Option A: Deploy from GitHub (Recommended)**

1. **In Heroku Dashboard:**
   - Go to your app → Deploy tab
   - Select "GitHub" as deployment method
   - Connect your GitHub account
   - Search for "numerology-calculator" repository
   - Click "Connect"

2. **Enable Automatic Deploys:**
   - Scroll down to "Automatic deploys"
   - Select "main" branch
   - Click "Enable Automatic Deploys"

3. **Manual Deploy (first time):**
   - Scroll to "Manual deploy"
   - Click "Deploy Branch"

**Option B: Deploy directly with Git**

```bash
# Add Heroku as a git remote
heroku git:remote -a your-app-name

# Push to Heroku
git push heroku main
```

### Step 7: Set Up Custom Domain

1. **In Heroku Dashboard:**
   - Go to your app → Settings tab
   - Scroll to "Domains and certificates"
   - Click "Add domain"
   - Enter your domain (e.g., `numerology.yourdomain.com`)

2. **Update your domain's DNS:**
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add a CNAME record:
     ```
     Type: CNAME
     Name: numerology (or whatever subdomain you want)
     Value: your-app-name.herokuapp.com
     ```

3. **Wait for DNS propagation** (5-60 minutes)

---

## 🌟 Method 2: Vercel (Better for Static Sites - FREE!)

### Alternative: Use Vercel Instead

If you want a **completely free solution** that's actually better for static sites:

1. **Go to Vercel.com** and sign up with GitHub
2. **Click "Import Project"**
3. **Select your GitHub repository**
4. **Deploy with default settings** (Vercel auto-detects it's a static site)
5. **Add custom domain** in project settings

**Vercel Benefits:**
- ✅ Completely free for static sites
- ✅ Better performance (global CDN)
- ✅ Automatic HTTPS
- ✅ Easy custom domains
- ✅ Same GitHub integration

---

## 🔄 Your New Development Workflow

Once set up, your workflow becomes:

### Daily Development:
1. **Open VSCode** and make changes to your files
2. **Test locally** using Live Server extension or:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Updated calculation logic"
   git push origin main
   ```
4. **Your site updates automatically!** (within 1-2 minutes)

### File Structure (What goes live):
```
Your Live Site:
├── index.html          # Main page
├── css/               # Styles
├── js/                # JavaScript
├── Data/              # JSON data
└── config/            # Configuration
```

---

## 🛠 Troubleshooting Common Issues

### Issue 1: "Application Error" on Heroku
**Cause**: Missing `package.json` or `server.js`
**Solution**: Make sure you created both files as shown in Step 1

### Issue 2: Static files not loading
**Cause**: Wrong file paths in HTML
**Solution**: Check that all paths in `index.html` are relative (no leading slashes)

### Issue 3: Domain not working
**Cause**: DNS not propagated or wrong DNS records
**Solution**: Wait longer or check DNS settings with your registrar

### Issue 4: Git push fails
**Cause**: Authentication issues
**Solution**: Use GitHub personal access token instead of password

---

## 📱 Testing Your Live Site

Once deployed, test these features:
1. **Basic functionality**: Add family member, calculate numerology
2. **Chinese zodiac**: Verify timeline shows correctly
3. **Responsive design**: Test on mobile devices
4. **All data loads**: Check that JSON files load properly

---

## 💡 Pro Tips

1. **Use branches for new features:**
   ```bash
   git checkout -b feature/new-calculation
   # Make changes
   git push origin feature/new-calculation
   # Merge when ready
   ```

2. **Monitor your app:**
   - Heroku: Check logs with `heroku logs --tail`
   - Vercel: Check deployment logs in dashboard

3. **Environment variables** (for API keys, etc.):
   ```bash
   heroku config:set API_KEY=your-key-here
   ```

4. **Custom error pages**: Add `404.html` for better error handling

---

## 🎉 Congratulations!

You now have:
- ✅ Professional deployment pipeline
- ✅ Version control with Git/GitHub
- ✅ Live website with custom domain
- ✅ Automatic deployments
- ✅ Local development environment

**Your numerology calculator is now live on the web!** 

Continue coding in VSCode, and every time you push to GitHub, your live site updates automatically. This is the same workflow used by professional developers worldwide.

---

## 🔗 Quick Reference Links

- **Your GitHub repo**: `https://github.com/YOUR_USERNAME/numerology-calculator`
- **Your live site**: `https://your-app-name.herokuapp.com`
- **Custom domain**: `https://numerology.yourdomain.com`
- **Heroku dashboard**: `https://dashboard.heroku.com/apps/your-app-name`

---

*Need help? Check the logs, consult the documentation, or create an issue in your GitHub repository.*