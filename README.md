# CofreKeys - Secure Password Manager

A modern, secure password manager application built with React and Node.js, featuring end-to-end encryption, user authentication, and a beautiful responsive UI.

**Live Demo**: [https://cofrekeys.duckdns.org](https://cofrekeys.duckdns.org)

---

## Features

### Core Functionality
- User registration and authentication with JWT
- Create, read, update, and delete password entries
- End-to-end encryption (AES-256) for stored passwords
- Search and filter passwords by title, username, or category
- Password generator with customizable options
- Copy passwords to clipboard with one click
- Categorize passwords (Email, Social, Banking, Work, etc.)
- Responsive design (mobile, tablet, desktop)

### Security Features
- Passwords encrypted at rest using AES-256-CBC
- JWT token-based authentication
- Bcrypt password hashing for user accounts
- HTTPS only (enforced via Traefik)
- Secure HTTP headers (X-Frame-Options, X-Content-Type-Options)
- Protected API routes
- Input validation and sanitization

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma ORM** - Database ORM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **crypto** - Encryption (Node.js native)
- **Zod** - Schema validation

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **Traefik** - Reverse proxy and SSL

---

## Project Structure

```
cofrekeys/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── passwords/    # Password management components
│   │   │   ├── layout/       # Layout components (Navbar)
│   │   │   └── ui/           # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts (AuthContext)
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities (encryption, JWT)
│   │   ├── config/           # Configuration files
│   │   ├── prisma/           # Database schema
│   │   └── server.js         # Entry point
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (for local development)
- Docker and Docker Compose (for production deployment)
- PostgreSQL 15+ (if running without Docker)

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cofrekeys
```

#### 2. Create Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and update the following values:
```env
# Database password
DB_PASSWORD=your_very_secure_password_here

# JWT secret (at least 32 characters)
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Encryption key (MUST be exactly 32 characters)
ENCRYPTION_KEY=your32characterencryptionkey!!
```

**Important**: Generate secure values for production!
```bash
# Generate a random password
openssl rand -base64 32

# Generate a 32-character encryption key
openssl rand -hex 16
```

---

## Development

### Backend Development
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update DATABASE_URL in backend/.env
# DATABASE_URL=postgresql://user:password@localhost:5432/cofrekeys

# Run Prisma migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Development
```bash
cd frontend
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Production Deployment

### Using Docker Compose with Traefik

1. **Ensure Traefik is running** with the `traefik-public` network
2. **Update docker-compose.yml** labels for your domain
3. **Create and configure .env file**:
```bash
cp .env.example .env
# Edit .env with secure values
```

4. **Deploy the application**:
```bash
docker-compose up -d --build
```

5. **Run database migrations** (first time only):
```bash
docker-compose exec cofrekeys-api npx prisma migrate deploy
```

6. **Access the application** at `https://cofrekeys.duckdns.org`

### Docker Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f cofrekeys-api

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
POST   /api/auth/logout      - Logout user (protected)
```

### Passwords (All Protected)
```
GET    /api/passwords        - Get all user passwords
GET    /api/passwords/:id    - Get single password
POST   /api/passwords        - Create new password
PUT    /api/passwords/:id    - Update password
DELETE /api/passwords/:id    - Delete password
```

### Example Requests

#### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

#### Create Password
```bash
curl -X POST http://localhost:3000/api/passwords \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Gmail Account",
    "username": "myemail@gmail.com",
    "password": "mySecretPassword123",
    "description": "My personal Gmail account",
    "category": "Email",
    "url": "https://gmail.com"
  }'
```

---

## Database Schema

### User Model
```prisma
model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String     # hashed with bcrypt
  name      String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  passwords Password[]
}
```

### Password Model
```prisma
model Password {
  id          String   @id @default(uuid())
  userId      String
  title       String
  username    String?
  password    String   # encrypted with AES-256
  description String?
  category    String?
  url         String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Security Best Practices

### Implemented Security Measures
- All passwords encrypted with AES-256-CBC before storage
- User passwords hashed with bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- Protected API routes with authentication middleware
- Input validation using Zod schemas
- CORS configured for specific frontend origin
- HTTPS enforced via Traefik
- Secure HTTP headers (X-Frame-Options, X-Content-Type-Options)
- SQL injection protection via Prisma ORM

### Recommendations for Production
1. Use strong, unique values for `JWT_SECRET` and `ENCRYPTION_KEY`
2. Enable rate limiting for authentication endpoints
3. Implement session timeout and auto-logout
4. Enable database backups
5. Monitor logs for suspicious activity
6. Keep dependencies updated
7. Use environment variables for all secrets
8. Never commit `.env` file to version control

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs cofrekeys-db

# Verify DATABASE_URL in backend environment
docker-compose exec cofrekeys-api env | grep DATABASE_URL
```

#### Frontend Cannot Connect to Backend
- Ensure `VITE_API_URL` is set correctly in frontend/.env
- Check if backend is running: `docker-compose logs cofrekeys-api`
- Verify nginx proxy configuration in `frontend/nginx.conf`

#### Prisma Migration Issues
```bash
# Reset database (WARNING: deletes all data)
docker-compose exec cofrekeys-api npx prisma migrate reset

# Generate Prisma Client
docker-compose exec cofrekeys-api npx prisma generate

# Apply migrations manually
docker-compose exec cofrekeys-api npx prisma migrate deploy
```

#### Token Expired Errors
- JWT tokens expire after 7 days by default
- Clear localStorage and login again
- Or adjust `JWT_EXPIRES_IN` in backend .env

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide Icons](https://lucide.dev/) for the beautiful icons
- [React Hot Toast](https://react-hot-toast.com/) for the notification system

---

## Contact

For questions or support, please open an issue on GitHub.

**Built with security and privacy in mind** 🔐
