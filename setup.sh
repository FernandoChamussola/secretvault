#!/bin/bash

# CofreKeys Setup Script
# This script helps you set up the CofreKeys password manager

set -e

echo "=========================================="
echo "    CofreKeys - Setup Script"
echo "=========================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "🔐 Generating secure credentials..."
echo ""

# Generate secure values
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Create .env file
cat > .env << EOF
# Database
DB_PASSWORD=${DB_PASSWORD}

# JWT (at least 32 characters recommended)
JWT_SECRET=${JWT_SECRET}

# Encryption (must be exactly 32 characters)
ENCRYPTION_KEY=${ENCRYPTION_KEY}
EOF

echo "✅ Created .env file with secure credentials"
echo ""
echo "=========================================="
echo "    Generated Credentials"
echo "=========================================="
echo ""
echo "⚠️  SAVE THESE CREDENTIALS SECURELY!"
echo ""
echo "Database Password: ${DB_PASSWORD}"
echo "JWT Secret: ${JWT_SECRET}"
echo "Encryption Key: ${ENCRYPTION_KEY}"
echo ""
echo "=========================================="
echo ""

# Ask if user wants to start services
read -p "Do you want to start the services now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting services..."
    docker-compose up -d --build

    echo ""
    echo "⏳ Waiting for services to start..."
    sleep 10

    echo ""
    echo "🔧 Running database migrations..."
    docker-compose exec -T cofrekeys-api npx prisma migrate deploy

    echo ""
    echo "=========================================="
    echo "    Setup Complete!"
    echo "=========================================="
    echo ""
    echo "✅ CofreKeys is now running!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Access the application:"
    echo "     - Local: http://localhost"
    echo "     - Production: https://cofrekeys.duckdns.org"
    echo ""
    echo "  2. Create your first account"
    echo "  3. Start managing your passwords!"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
    echo ""
else
    echo ""
    echo "Setup complete! To start the services, run:"
    echo "  docker-compose up -d --build"
    echo ""
fi
