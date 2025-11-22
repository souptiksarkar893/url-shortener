# 🚂 Railway Deployment Guide

Complete step-by-step guide to deploy your URL Shortener to Railway.

## 📋 Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Git installed on your computer
- Your project code (already ready!)

---

## Part 1: Prepare Your Project (5 minutes)

### Step 1: Initialize Git Repository

Open terminal in your project folder and run:

```powershell
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: URL Shortener project"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `url-shortener` (or any name you like)
3. Description: "URL Shortener similar to bit.ly"
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 3: Push to GitHub

Copy the commands shown on GitHub and run them:

```powershell
# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/url-shortener.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## Part 2: Set Up Railway (10 minutes)

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Login" or "Start a New Project"
3. Sign in with GitHub (recommended)
4. Authorize Railway to access your GitHub

### Step 2: Create New Project

1. Click "New Project" button
2. You'll see several options

### Step 3: Add PostgreSQL Database

1. Click "Deploy from Repo" OR "New Project"
2. Select "Provision PostgreSQL" or "Add PostgreSQL"
3. Railway will create a PostgreSQL database for you
4. Wait 30-60 seconds for deployment
5. Your database is ready! ✅

### Step 4: Get Database Connection Details

1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. You'll see `DATABASE_URL` - this is your connection string
4. Copy it (looks like: `postgresql://postgres:password@containers-us-west-xxx.railway.app:6379/railway`)
5. **Save this somewhere safe!**

### Step 5: Initialize Database Schema

**Option A: Using Railway's PostgreSQL Plugin UI**

1. Click on PostgreSQL service
2. Go to "Data" tab
3. Click "Query"
4. Open your `db/schema.sql` file in this project
5. Copy ALL the SQL code:
```sql
DROP TABLE IF EXISTS links;

CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_code ON links(code);
ALTER TABLE links ADD CONSTRAINT code_format CHECK (code ~ '^[A-Za-z0-9]{6,8}$');
```
6. Paste it in the Query editor
7. Click "Run" or press Ctrl+Enter
8. You should see "Success" ✅

**Option B: Using psql (Command Line)**

1. Install PostgreSQL client if not installed:
   ```powershell
   # Windows (using Chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/windows/
   ```

2. Connect to Railway database:
   ```powershell
   psql "postgresql://postgres:password@containers-us-west-xxx.railway.app:6379/railway"
   ```

3. Copy and paste the schema from `db/schema.sql`

4. Press Enter to execute

5. Type `\dt` to verify table was created

6. Type `\q` to quit

---

## Part 3: Deploy Your Application (5 minutes)

### Step 1: Add Your Application to Railway

1. In Railway dashboard, click "New" in your project
2. Select "GitHub Repo"
3. Find and select your `url-shortener` repository
4. Click "Deploy Now"
5. Railway will start building your app

### Step 2: Configure Environment Variables

1. Click on your app service (not the database)
2. Go to "Variables" tab
3. Click "Raw Editor" or "+ New Variable"
4. Add these variables:

```env
NODE_ENV=production
PORT=3000
```

**Important:** Railway automatically injects `DATABASE_URL` from your PostgreSQL service, so you don't need to add it manually!

### Step 3: Get Your BASE_URL

1. Go to "Settings" tab in your app service
2. Scroll to "Domains" section
3. Click "Generate Domain"
4. Railway will give you a URL like: `your-app.up.railway.app`
5. Copy this URL

### Step 4: Add BASE_URL Variable

1. Go back to "Variables" tab
2. Add one more variable:

```env
BASE_URL=https://your-app.up.railway.app
```

Replace with your actual Railway domain.

### Step 5: Wait for Deployment

1. Go to "Deployments" tab
2. Watch the build logs
3. Wait for "Success" status (usually 1-2 minutes)
4. You'll see "Deployed" with a green checkmark ✅

---

## Part 4: Test Your Deployment (3 minutes)

### Step 1: Health Check

Open your browser and visit:
```
https://your-app.up.railway.app/healthz
```

You should see:
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": 123,
  "timestamp": "2025-11-22T..."
}
```

### Step 2: Visit Dashboard

Go to:
```
https://your-app.up.railway.app
```

You should see your URL Shortener dashboard! 🎉

### Step 3: Create a Test Link

1. Enter a URL: `https://github.com`
2. Custom code: `github` (optional)
3. Click "Create Short Link"
4. You should get: `https://your-app.up.railway.app/github`

### Step 4: Test Redirect

Visit your short link:
```
https://your-app.up.railway.app/github
```

It should redirect to GitHub! ✅

### Step 5: Check Stats

Visit:
```
https://your-app.up.railway.app/code/github
```

You should see statistics with 1 click!

---

## 🎯 Complete Environment Variables Summary

Your Railway app should have these variables:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://postgres:...` | Auto-injected by Railway |
| `NODE_ENV` | `production` | You add this |
| `PORT` | `3000` | You add this |
| `BASE_URL` | `https://your-app.up.railway.app` | You add this |

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution:**
1. Verify PostgreSQL service is running in Railway
2. Check that both services are in the same project
3. Railway auto-connects them - no manual DATABASE_URL needed
4. Restart your app service

### Issue: "Port already in use" or "Port 3000 not available"

**Solution:**
Railway automatically assigns ports. Update your `server.js`:

Current code is fine! It uses:
```javascript
const PORT = process.env.PORT || 3000;
```

This automatically uses Railway's assigned port.

### Issue: "Schema not found" or "relation does not exist"

**Solution:**
1. Click PostgreSQL service → Data → Query
2. Run the schema from `db/schema.sql` again
3. Verify with: `SELECT * FROM links;`

### Issue: "Application Error" or "503 Service Unavailable"

**Solution:**
1. Check "Deployments" tab for build errors
2. Click on latest deployment
3. Check logs for error messages
4. Common fixes:
   - Ensure `package.json` has all dependencies
   - Check that `start` script is: `"node server.js"`
   - Verify no syntax errors in code

### Issue: Redirect not working

**Solution:**
1. Check BASE_URL is set correctly
2. Verify schema was run in database
3. Check logs: PostgreSQL service → Logs

---

## 🚀 Updating Your App

When you make changes to your code:

```powershell
# 1. Make your changes to code

# 2. Commit changes
git add .
git commit -m "Description of changes"

# 3. Push to GitHub
git push origin main

# 4. Railway auto-deploys! ✨
```

Railway automatically rebuilds and redeploys when you push to GitHub!

---

## 💰 Railway Pricing & Limits

### Free Plan (Starter):
- ✅ $5 free credit per month
- ✅ Enough for small projects
- ✅ 500 hours of usage
- ✅ 1GB RAM
- ✅ 1 CPU

### What happens when free credit runs out?
- App goes to sleep
- Upgrade to hobby plan ($5/month) for unlimited usage

### Tips to stay within free tier:
1. Use "sleep after inactivity" feature
2. Delete old deployments
3. Monitor usage in Railway dashboard

---

## 📊 Monitoring Your App

### View Logs

**Application Logs:**
1. Click on your app service
2. Go to "Deployments" tab
3. Click on active deployment
4. See real-time logs

**Database Logs:**
1. Click PostgreSQL service
2. Go to "Logs" tab
3. Monitor queries and connections

### View Metrics

1. Click on service
2. Go to "Metrics" tab
3. See CPU, Memory, Network usage

### Set Up Alerts

1. Go to project settings
2. Configure notifications
3. Get alerts for crashes or errors

---

## 🔐 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to GitHub
- ✅ All secrets in Railway Variables
- ✅ Use Railway's built-in variable injection

### 2. Database Security
- ✅ Railway databases are private by default
- ✅ SSL enabled automatically
- ✅ Regular backups recommended

### 3. Application Security
- ✅ Input validation (already implemented)
- ✅ SQL injection protection (parameterized queries)
- ✅ HTTPS enforced by Railway

---

## 🎨 Custom Domain (Optional)

### Add Your Own Domain

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Railway, go to app service → Settings → Domains
3. Click "Custom Domain"
4. Enter your domain: `links.yourdomain.com`
5. Add these DNS records at your domain provider:

**CNAME Record:**
```
Type: CNAME
Name: links (or @)
Value: your-app.up.railway.app
```

6. Wait 5-60 minutes for DNS propagation
7. Railway auto-generates SSL certificate! 🔒

---

## 📱 Next Steps After Deployment

### 1. Test All Features
- [ ] Create links
- [ ] Test redirects
- [ ] View statistics
- [ ] Delete links
- [ ] Search/filter
- [ ] Mobile responsiveness

### 2. Share Your App
- Copy your Railway URL
- Share with friends
- Get feedback

### 3. Monitor Usage
- Check Railway dashboard daily
- Monitor credit usage
- Watch for errors in logs

### 4. Optional Enhancements
- Add analytics (Google Analytics)
- Set up custom domain
- Add rate limiting
- Implement user authentication
- Add QR code generation

---

## 🆘 Getting Help

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Twitter: @Railway

### Your Project
- Check logs in Railway dashboard
- Review TESTING.md for testing
- See server.js for code reference

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] GitHub repository created and pushed
- [ ] Railway account created
- [ ] PostgreSQL database provisioned
- [ ] Database schema executed
- [ ] Application deployed from GitHub
- [ ] Environment variables set (NODE_ENV, PORT, BASE_URL)
- [ ] Health check returns 200
- [ ] Dashboard loads correctly
- [ ] Can create links
- [ ] Redirects work
- [ ] Stats page works
- [ ] Delete function works
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)

---

## 🎉 Congratulations!

Your URL Shortener is now live on Railway! 

**Your Live URLs:**
- Dashboard: `https://your-app.up.railway.app`
- Health: `https://your-app.up.railway.app/healthz`
- API: `https://your-app.up.railway.app/api/links`

Share it with the world! 🚀

---

## Quick Commands Reference

```powershell
# Git commands
git add .
git commit -m "message"
git push origin main

# Test health check
curl https://your-app.up.railway.app/healthz

# Test API
curl https://your-app.up.railway.app/api/links

# Create link
curl -X POST https://your-app.up.railway.app/api/links `
  -H "Content-Type: application/json" `
  -d '{\"target_url\":\"https://github.com\",\"code\":\"github\"}'
```

Need help? Check the logs in Railway dashboard or review TESTING.md!
