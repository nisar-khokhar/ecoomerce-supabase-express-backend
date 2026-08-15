# Deployment Documentation

This document provides comprehensive instructions for deploying this Node.js Express e-commerce backend to development, staging, and production environments.

---

## 1. Overview

Deployment involves:

- preparing the environment with dependencies
- configuring environment variables
- running database migrations
- building and testing the application
- deploying to a hosting platform
- monitoring and maintaining the running service

This guide covers common hosting platforms: Heroku, AWS, Google Cloud, DigitalOcean, and self-hosted VPS.

---

## 2. Prerequisites

### System Requirements

- Node.js 16+ (v18+ recommended)
- npm 8+ or yarn
- PostgreSQL client tools (psql)
- Git for version control
- A Supabase account for database hosting

### Tools to Install

```bash
# Check Node version
node --version  # should be v16+

# Check npm version
npm --version   # should be v8+

# Install PostgreSQL client (optional, for local DB management)
# macOS: brew install postgresql
# Windows: https://www.postgresql.org/download/windows/
# Linux: apt-get install postgresql-client
```

---

## 3. Local Development Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/Node_Express_CRUD.git
cd Node_Express_CRUD
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Server
NODE_ENV=development
PORT=8000

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
JWT_SECRET=your-dev-jwt-secret-min-32-chars
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# Payment Providers
PAYMENT_PROVIDER=stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (if implemented)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password

# Admin
ADMIN_EMAIL=admin@example.com
```

### Start the Development Server

```bash
# Using npm
npm run dev

# Or using nodemon directly
nodemon bin/www
```

The server should start at `http://localhost:8000`.

### Test the Application

```bash
# Check if the server is running
curl http://localhost:8000/api/health

# Or import the Postman collection
# postman/collections/ contains pre-built API requests
```

---

## 4. Database Migrations

### Running Migrations

Supabase migrations are stored in `supabase/migrations/`.

#### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run pending migrations
supabase migration up

# Check migration status
supabase migration list
```

#### Manual Migration (via Supabase Dashboard)

1. Go to https://supabase.com/ and log in
2. Select your project
3. Navigate to SQL Editor
4. Run migration files from `supabase/migrations/` in order
5. Verify all tables and indexes are created

### Database Seeding

Seed data is located in `supabase/seeds/`.

```bash
# Run seeds (if using Supabase CLI)
supabase db push

# Or manually execute seed files via SQL Editor
```

---

## 5. Deployment to Heroku

### Prerequisites

- Heroku account (free or paid)
- Heroku CLI installed

### Steps

#### 1. Create a Heroku App

```bash
heroku login
heroku create your-app-name
```

#### 2. Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-prod-jwt-secret-min-32-chars
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_KEY=your-anon-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_live_...
heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
# Add other variables as needed
```

#### 3. Configure Procfile

Create a `Procfile` in the project root:

```
web: node bin/www
```

#### 4. Deploy

```bash
git push heroku main
```

Or for a different branch:

```bash
git push heroku your-branch:main
```

#### 5. View Logs

```bash
heroku logs --tail
```

#### 6. Verify Deployment

```bash
curl https://your-app-name.herokuapp.com/api/health
```

---

## 6. Deployment to AWS (EC2)

### Prerequisites

- AWS account
- EC2 instance running Ubuntu 20.04+
- SSH key pair for EC2 access

### Steps

#### 1. Launch an EC2 Instance

```bash
# Using AWS Console or CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.micro \
  --key-name your-key-pair
```

#### 2. Connect to the Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

#### 3. Install Dependencies

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y nodejs npm git curl

# Verify installation
node --version
npm --version
```

#### 4. Clone and Setup the Project

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/Node_Express_CRUD.git
cd Node_Express_CRUD
npm install
```

#### 5. Configure Environment

```bash
cat > .env.production << EOF
NODE_ENV=production
PORT=8000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-prod-jwt-secret
STRIPE_SECRET_KEY=sk_live_...
ALLOWED_ORIGINS=https://yourdomain.com
EOF
```

#### 6. Set Up PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start the application
pm2 start bin/www --name "express-api"

# Make PM2 start on boot
pm2 startup
pm2 save
```

#### 7. Set Up Nginx Reverse Proxy

```bash
sudo apt install -y nginx

# Create Nginx config
sudo cat > /etc/nginx/sites-available/express-api << EOF
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the config
sudo ln -s /etc/nginx/sites-available/express-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Set Up HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

certbot --nginx -d yourdomain.com
```

#### 9. Monitor Logs

```bash
pm2 logs express-api
```

---

## 7. Deployment to Google Cloud Run

### Prerequisites

- Google Cloud account
- Google Cloud CLI installed
- Docker installed (optional, for local testing)

### Steps

#### 1. Create a Dockerfile

Create `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "bin/www"]
```

#### 2. Create .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
README.md
postman/
supabase/
```

#### 3. Build and Push Docker Image

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project your-project-id

# Build the image
gcloud builds submit --tag gcr.io/your-project-id/express-api

# Or build locally
docker build -t gcr.io/your-project-id/express-api .
docker push gcr.io/your-project-id/express-api
```

#### 4. Deploy to Cloud Run

```bash
gcloud run deploy express-api \
  --image gcr.io/your-project-id/express-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,SUPABASE_URL=...,JWT_SECRET=..."
```

#### 5. View Deployment

```bash
gcloud run services describe express-api --platform managed --region us-central1
```

---

## 8. Deployment to DigitalOcean App Platform

### Steps

#### 1. Push Code to GitHub

Ensure your code is pushed to a GitHub repository.

#### 2. Connect to DigitalOcean

1. Go to https://cloud.digitalocean.com/
2. Navigate to App Platform
3. Click "Create App"
4. Select GitHub repository

#### 3. Configure the App

- **Build Command:** `npm install`
- **Run Command:** `node bin/www`
- **Port:** `8000`

#### 4. Set Environment Variables

Add all required `.env` variables in the DigitalOcean App Platform dashboard.

#### 5. Deploy

Click "Deploy" and monitor the deployment progress.

---

## 9. Environment Variables by Deployment Stage

### Development

```env
NODE_ENV=development
PORT=8000
SUPABASE_KEY=anon-key-for-dev
JWT_SECRET=dev-secret-any-length
ALLOWED_ORIGINS=http://localhost:3000
```

### Staging

```env
NODE_ENV=staging
PORT=8000
SUPABASE_KEY=anon-key-for-staging
JWT_SECRET=staging-secret-min-32-chars
ALLOWED_ORIGINS=https://staging.yourdomain.com
STRIPE_SECRET_KEY=sk_test_...
```

### Production

```env
NODE_ENV=production
PORT=8000
SUPABASE_KEY=anon-key-for-production
JWT_SECRET=production-secret-min-32-chars (use a secrets manager)
ALLOWED_ORIGINS=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
```

---

## 10. Health Checks and Monitoring

### Health Check Endpoint

A simple health check endpoint helps monitoring services verify the app is running:

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-08-15T10:00:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Monitoring Tools

Recommended services:

- **Sentry**: Error tracking and alerting
  - Install: `npm install @sentry/node`
  - Set up in app.js

- **DataDog**: Infrastructure and application monitoring
  - Tracks response times, error rates, resource usage

- **New Relic**: APM and performance monitoring
  - Detailed transaction tracing

- **Prometheus + Grafana**: Metrics and visualization
  - Custom metrics for business logic

---

## 11. Logging

### Centralized Logging

Recommended services:

- **CloudWatch** (AWS)
- **Stackdriver** (Google Cloud)
- **Loggly**
- **Papertrail**

### Example Logging Setup

```javascript
// app.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

module.exports = logger;
```

---

## 12. Backup and Disaster Recovery

### Database Backups

Supabase automatically backs up data, but configure additional backups:

```bash
# Export database backup
pg_dump -h your-db-host -U your-user -d your-db > backup.sql

# Restore from backup
psql -h your-db-host -U your-user -d your-db < backup.sql
```

### Application Backups

Store application code in version control (Git). Create releases/tags for each deployment:

```bash
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

---

## 13. Rollback Procedures

### Heroku Rollback

```bash
# View recent releases
heroku releases

# Rollback to previous release
heroku rollback v10
```

### Manual Rollback

```bash
# If deployed via git
git revert <commit-sha>
git push origin main

# Restart application
# (Heroku, AWS, etc. will automatically redeploy)
```

### Database Rollback

For migration rollbacks:

```bash
# List applied migrations
supabase migration list

# Note: Rollback depends on custom migration scripts
# It's recommended to always write migration reversals
```

---

## 14. Common Deployment Issues

### Issue: Port Already in Use

**Solution:**

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3000 npm start
```

### Issue: Environment Variables Not Loaded

**Solution:**

```bash
# Verify .env file exists
ls -la .env

# Check environment variables are set
echo $JWT_SECRET

# Source the .env manually (development only)
source .env
npm start
```

### Issue: Database Connection Fails

**Solution:**

```bash
# Test database connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
client.from('users').select('count', { count: 'exact' }).then(console.log);
"
```

### Issue: Out of Memory

**Solution:**

```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=2048 npm start

# Check memory usage
ps aux | grep node
```

### Issue: CORS Errors in Production

**Solution:**

Verify `ALLOWED_ORIGINS` environment variable:

```bash
# Should match your frontend domain
echo $ALLOWED_ORIGINS
# Should output: https://yourdomain.com (not http or different domain)
```

---

## 15. Pre-Deployment Checklist

- [ ] All code is committed and pushed to Git
- [ ] Tests pass locally (`npm test` if available)
- [ ] Environment variables are configured for the target environment
- [ ] Database migrations are prepared and tested
- [ ] SSL/TLS certificate is valid (production)
- [ ] Backup of current production database is available
- [ ] Rollback plan is documented
- [ ] Monitoring and alerting are configured
- [ ] Health check endpoint is accessible
- [ ] Secrets are not in version control
- [ ] Dependencies are up-to-date (npm audit passes)
- [ ] Documentation is updated

---

## 16. Post-Deployment Steps

1. **Verify the deployment:**

   ```bash
   curl https://yourdomain.com/api/health
   ```

2. **Run smoke tests:**
   - Test login endpoint
   - Test product listing
   - Test order creation

3. **Monitor logs and metrics:**
   - Check for errors in logs
   - Monitor CPU and memory usage
   - Track response times

4. **Notify stakeholders:**
   - Update team about successful deployment
   - Document any changes made

---

## 17. Continuous Integration / Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

---

## 18. Key Files

- `bin/www` - Application entry point
- `app.js` - Express server setup
- `package.json` - Dependencies and scripts
- `.env.example` - Example environment variables
- `Dockerfile` - Docker container configuration
- `Procfile` - Heroku process configuration
- `supabase/migrations/` - Database migrations

---

## 19. Support and Troubleshooting

For issues:

1. Check logs: `heroku logs --tail` or `pm2 logs`
2. Review environment variables
3. Test database connection
4. Check memory and CPU usage
5. Review recent git commits
6. Test locally with same environment
7. Consult platform documentation

---

## 20. Summary

Deployment involves careful preparation, testing, and monitoring. This guide covers major hosting platforms and provides troubleshooting guidance. Follow the pre-deployment checklist and post-deployment steps to ensure a smooth and reliable deployment process.

For questions or issues, refer to the specific platform's documentation or consult your DevOps team.
