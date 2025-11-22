-- URL Shortener Database Schema

-- Drop table if exists (for fresh setup)
DROP TABLE IF EXISTS links;

-- Create links table
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_code ON links(code);

-- Optional: Add check constraint for code format (alphanumeric, 6-8 chars)
ALTER TABLE links ADD CONSTRAINT code_format CHECK (code ~ '^[A-Za-z0-9]{6,8}$');
