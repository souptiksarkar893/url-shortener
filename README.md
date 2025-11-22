# URL Shortener

A simple URL shortener service similar to bit.ly, built with Node.js and Express.

## Features

- ✂️ Create short links with custom codes
- 📊 View click statistics
- 🔗 Manage all your links
- 📱 Responsive design
- ⚡ Fast redirects

## Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (can use Neon, Supabase, or any other provider)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and configuration

5. Initialize the database by running the SQL schema in `db/schema.sql`

6. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Database Setup

Execute the SQL commands in `db/schema.sql` to create the required table:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_code ON links(code);
```

## Deployment

### Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Deploy automatically on push

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `BASE_URL`: Your deployed app URL (e.g., https://yourapp.vercel.app)
- `NODE_ENV`: Environment (development/production)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard |
| GET | `/code/:code` | Stats page for a link |
| GET | `/:code` | Redirect to target URL |
| GET | `/healthz` | Health check |
| POST | `/api/links` | Create new link |
| GET | `/api/links` | List all links |
| GET | `/api/links/:code` | Get stats for one link |
| DELETE | `/api/links/:code` | Delete a link |

## License

ISC
