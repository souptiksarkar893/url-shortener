# 🏃 Complete Local Setup Guide

This guide walks you through running the URL Shortener on your local machine.

---

## Prerequisites Check

Before starting, ensure you have:

- [ ] **Node.js** installed (v16 or higher)
  - Check: `node --version`
  - Download: https://nodejs.org
  
- [ ] **Git** installed
  - Check: `git --version`
  - Download: https://git-scm.com

- [ ] **Text Editor** (VS Code, Notepad++, etc.)

- [ ] **Web Browser** (Chrome, Firefox, Edge)

---

## Option 1: Using Railway PostgreSQL (Recommended)

### Step 1: Create Railway Database

1. Go to https://railway.app and sign up
2. Create new project
3. Add PostgreSQL service
4. Click on PostgreSQL → Variables
5. Copy the `DATABASE_URL` value

### Step 2: Configure Local Environment

1. In your project folder, open `.env` file
2. Paste your Railway database URL:

```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:6379/railway
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Step 3: Initialize Database

**Using Railway UI:**
1. Go to Railway dashboard
2. Click PostgreSQL service → Data → Query
3. Copy content from `db/schema.sql`
4. Paste and run

**Using psql:**
```powershell
# Connect to Railway database
psql "YOUR_DATABASE_URL_HERE"

# Copy and paste content from db/schema.sql, then press Enter
# Type \q to quit
```

### Step 4: Install Dependencies

```powershell
cd "c:\Users\SOUPTIK SARKAR\Desktop\Assignment\Bit"
npm install
```

### Step 5: Start Server

```powershell
npm start
```

You should see:
```
✓ Database connected
🚀 Server running on port 3000
📊 Dashboard: http://localhost:3000
💚 Health check: http://localhost:3000/healthz
```

### Step 6: Test It!

Open browser and go to: http://localhost:3000

---

## Option 2: Using Local PostgreSQL

### Step 1: Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (default settings are fine)
3. Remember the password you set for `postgres` user
4. Keep port as `5432`

**Or using Chocolatey:**
```powershell
choco install postgresql
```

### Step 2: Create Database

```powershell
# Open PowerShell as Administrator

# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE urlshortener;

# Connect to the database
\c urlshortener

# Exit psql
\q
```

### Step 3: Run Schema

```powershell
# Run the schema file
psql -U postgres -d urlshortener -f "c:\Users\SOUPTIK SARKAR\Desktop\Assignment\Bit\db\schema.sql"
```

### Step 4: Configure Environment

Edit your `.env` file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/urlshortener
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### Step 5: Install and Start

```powershell
npm install
npm start
```

---

## Option 3: Using Neon (Cloud PostgreSQL)

### Step 1: Create Neon Account

1. Go to https://console.neon.tech/signup
2. Sign up with GitHub (easiest)
3. Verify your email

### Step 2: Create Project

1. Click "Create Project"
2. Name: `urlshortener`
3. Region: Choose closest to you
4. Click "Create Project"

### Step 3: Get Connection String

1. You'll see a connection string like:
   ```
   postgresql://user:password@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
2. Copy it!

### Step 4: Initialize Database

1. In Neon dashboard, click "SQL Editor"
2. Copy content from `db/schema.sql`
3. Paste in SQL Editor
4. Click "Run" or press Ctrl+Enter

### Step 5: Configure and Start

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@ep-xyz-123.us-east-2.aws.neon.tech/neondb?sslmode=require
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

Install and start:
```powershell
npm install
npm start
```

---

## Testing Your Local Setup

### 1. Health Check

```powershell
# In browser
http://localhost:3000/healthz

# Or using curl
curl http://localhost:3000/healthz
```

Expected response:
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": 5,
  "timestamp": "2025-11-22T..."
}
```

### 2. Visit Dashboard

Open browser: http://localhost:3000

You should see:
- Header with "URL Shortener"
- Form to create new links
- Empty table (or existing links)

### 3. Create Test Link

1. Target URL: `https://github.com`
2. Custom Code: `test123`
3. Click "Create Short Link"
4. Should see success message

### 4. Test Redirect

Visit: http://localhost:3000/test123

Should redirect to GitHub!

### 5. Test Stats

Visit: http://localhost:3000/code/test123

Should show:
- Code: test123
- Target URL: https://github.com
- Total Clicks: 1
- Last Clicked: Just now

---

## Development Mode

For auto-reload on file changes (Node.js 18.11+):

```powershell
npm run dev
```

This uses `node --watch` to restart server when you edit files.

---

## Common Issues & Solutions

### Issue: `npm install` fails

**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### Issue: "Cannot find module 'express'"

**Solution:**
```powershell
npm install express pg dotenv
```

### Issue: "Error: connect ECONNREFUSED"

**Cause:** Cannot connect to database

**Solutions:**
1. Check DATABASE_URL in `.env` is correct
2. Verify database server is running
3. For Railway/Neon, check internet connection
4. For local PostgreSQL, start the service:
   ```powershell
   # Windows
   net start postgresql-x64-14
   ```

### Issue: "Port 3000 already in use"

**Solution:**
```powershell
# Option 1: Change port in .env
PORT=3001

# Option 2: Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "relation 'links' does not exist"

**Cause:** Database schema not initialized

**Solution:**
Run the schema again:
```powershell
psql "YOUR_DATABASE_URL" -f db/schema.sql
```

Or in Railway/Neon SQL Editor, paste and run `db/schema.sql`

### Issue: Database connection works but queries fail

**Solution:**
1. Verify schema was run successfully
2. Check table exists:
   ```sql
   \dt  -- in psql
   ```
3. Try selecting:
   ```sql
   SELECT * FROM links;
   ```

---

## Verify Installation Checklist

Run these checks:

### 1. Dependencies Installed
```powershell
# Should show express, pg, dotenv
npm list --depth=0
```

### 2. Database Connection
```powershell
# In your project, create test-db.js:
```

I'll create a test file:

<function_calls>
<invoke name="create_file">
<parameter name="content">// Quick database connection test
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test if links table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'links'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Links table exists');
      
      // Count links
      const count = await pool.query('SELECT COUNT(*) FROM links');
      console.log(`📊 Total links in database: ${count.rows[0].count}`);
    } else {
      console.log('❌ Links table not found! Run db/schema.sql first.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
