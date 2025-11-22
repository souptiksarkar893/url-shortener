const express = require('express');
const path = require('path');
const db = require('./db/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Utility functions
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ===== API ENDPOINTS =====

// Health check endpoint
app.get('/healthz', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  res.status(200).json({
    ok: true,
    version: '1.0',
    uptime: uptime,
    timestamp: new Date().toISOString()
  });
});

// Create a new short link
app.post('/api/links', async (req, res) => {
  try {
    let { target_url, code } = req.body;

    // Validate target URL
    if (!target_url) {
      return res.status(400).json({ error: 'target_url is required' });
    }

    if (!isValidUrl(target_url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate or validate custom code
    if (code) {
      if (!isValidCode(code)) {
        return res.status(400).json({ 
          error: 'Code must be 6-8 alphanumeric characters' 
        });
      }
    } else {
      // Generate random code if not provided
      code = generateRandomCode();
      
      // Ensure uniqueness (retry if collision)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await db.query('SELECT id FROM links WHERE code = $1', [code]);
        if (existing.rows.length === 0) break;
        code = generateRandomCode();
        attempts++;
      }
    }

    // Insert into database
    const result = await db.query(
      'INSERT INTO links (code, target_url, total_clicks, created_at) VALUES ($1, $2, 0, NOW()) RETURNING *',
      [code, target_url]
    );

    const link = result.rows[0];
    res.status(201).json({
      id: link.id,
      code: link.code,
      target_url: link.target_url,
      total_clicks: link.total_clicks,
      created_at: link.created_at,
      short_url: `${process.env.BASE_URL || `http://localhost:${PORT}`}/${link.code}`
    });

  } catch (error) {
    // Handle unique constraint violation (duplicate code)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Code already exists' });
    }
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all links
app.get('/api/links', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, code, target_url, total_clicks, last_clicked, created_at FROM links ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats for a specific link
app.get('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await db.query(
      'SELECT id, code, target_url, total_clicks, last_clicked, created_at FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a link
app.delete('/api/links/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await db.query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== PAGE ROUTES =====

// Dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Stats page for a specific code
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// ===== REDIRECT ROUTE =====

// Redirect short code to target URL (must be last to avoid conflicts)
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Skip static files and special routes
    if (code.includes('.') || code === 'favicon.ico') {
      return res.status(404).send('Not found');
    }

    const result = await db.query(
      'SELECT target_url FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Short link not found');
    }

    const targetUrl = result.rows[0].target_url;

    // Update click count and last clicked time
    await db.query(
      'UPDATE links SET total_clicks = total_clicks + 1, last_clicked = NOW() WHERE code = $1',
      [code]
    );

    // Perform redirect
    res.redirect(302, targetUrl);

  } catch (error) {
    console.error('Error processing redirect:', error);
    res.status(500).send('Internal server error');
  }
});

// Start server (only in non-serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/healthz`);
  });
}

module.exports = app;
