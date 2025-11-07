# CofreKeys - Quick Start Guide

Get CofreKeys up and running in 5 minutes!

## Quick Deploy (Production with Docker)

### 1. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Generate secure values
echo "DB_PASSWORD=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -hex 16)" >> .env
```

### 2. Start the Application
```bash
# Build and start all services
docker-compose up -d --build

# Wait for services to start (about 30 seconds)
docker-compose ps

# Run database migrations
docker-compose exec cofrekeys-api npx prisma migrate deploy
```

### 3. Access the Application
Open your browser and navigate to:
- **Local**: http://localhost (if using localhost)
- **Production**: https://cofrekeys.duckdns.org

### 4. Create Your First Account
1. Click "Register here" on the login page
2. Enter your email and a strong password
3. Click "Create Account"
4. You'll be redirected to your dashboard

### 5. Add Your First Password
1. Click the "Add Password" button
2. Fill in the details:
   - **Title**: e.g., "Gmail Account"
   - **Username**: your email or username
   - **Password**: your password (or click "Generate strong password")
   - **Category**: e.g., Email, Social, Banking
3. Click "Create"

---

## Local Development Setup

### Backend
```bash
cd backend
npm install

# Setup .env
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cofrekeys
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 16)
PORT=3000
NODE_ENV=development
EOF

# Run migrations
npx prisma migrate dev

# Start server
npm run dev
```

Backend runs on: http://localhost:3000

### Frontend
```bash
cd frontend
npm install

# Setup .env
echo "VITE_API_URL=http://localhost:3000" > .env

# Start dev server
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Quick Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f cofrekeys-api
docker-compose logs -f cofrekeys-frontend
docker-compose logs -f cofrekeys-db
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart cofrekeys-api
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v
```

### Database Operations
```bash
# Access Prisma Studio (Database GUI)
docker-compose exec cofrekeys-api npx prisma studio

# Run migrations
docker-compose exec cofrekeys-api npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
docker-compose exec cofrekeys-api npx prisma migrate reset
```

---

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned token for authenticated requests.

### Create a Password
```bash
curl -X POST http://localhost:3000/api/passwords \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Password",
    "username": "testuser",
    "password": "mypassword123",
    "category": "Test"
  }'
```

### Get All Passwords
```bash
curl -X GET http://localhost:3000/api/passwords \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check if database is running
docker-compose ps cofrekeys-db

# Restart database
docker-compose restart cofrekeys-db

# Check database logs
docker-compose logs cofrekeys-db
```

### Frontend Can't Connect to Backend
1. Check if backend is running: `docker-compose logs cofrekeys-api`
2. Verify `VITE_API_URL` in frontend/.env
3. Clear browser cache and reload

### Prisma Errors
```bash
# Regenerate Prisma Client
cd backend
npx prisma generate

# Reset migrations
npx prisma migrate reset
```

---

## Next Steps

1. **Customize Categories**: Edit the password categories in `frontend/src/utils/helpers.js`
2. **Add More Features**: Check the main README.md for feature ideas
3. **Configure Backups**: Set up automatic database backups
4. **Enable HTTPS**: Configure Traefik SSL certificates
5. **Monitor Logs**: Set up log aggregation and monitoring

---

## Security Checklist

- [ ] Changed default passwords in `.env`
- [ ] Generated secure `ENCRYPTION_KEY` (32 chars)
- [ ] Generated secure `JWT_SECRET` (32+ chars)
- [ ] HTTPS enabled (via Traefik)
- [ ] `.env` file not committed to git
- [ ] Database backups configured
- [ ] Strong user passwords enforced
- [ ] Rate limiting enabled (optional)

---

## Need Help?

- Check the full [README.md](./README.md) for detailed documentation
- Review the [API documentation](#testing-the-api)
- Open an issue on GitHub

**Happy password managing!** 🔐
