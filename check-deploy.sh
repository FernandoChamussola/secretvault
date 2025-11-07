#!/bin/bash

# Script de verificação pré-deploy
# Verifica se tudo está configurado corretamente antes do deploy

echo "=========================================="
echo "  CofreKeys - Verificação Pré-Deploy"
echo "=========================================="
echo ""

ERRORS=0

# Verificar se .env existe
echo "📝 Verificando arquivo .env..."
if [ ! -f .env ]; then
    echo "❌ ERRO: Arquivo .env não encontrado!"
    echo "   Execute: cp .env.example .env"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Arquivo .env encontrado"

    # Verificar variáveis necessárias
    source .env

    if [ -z "$DB_PASSWORD" ]; then
        echo "❌ ERRO: DB_PASSWORD não definido no .env"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ DB_PASSWORD configurado"
    fi

    if [ -z "$JWT_SECRET" ]; then
        echo "❌ ERRO: JWT_SECRET não definido no .env"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ JWT_SECRET configurado"
    fi

    if [ -z "$ENCRYPTION_KEY" ]; then
        echo "❌ ERRO: ENCRYPTION_KEY não definido no .env"
        ERRORS=$((ERRORS + 1))
    elif [ ${#ENCRYPTION_KEY} -ne 32 ]; then
        echo "❌ ERRO: ENCRYPTION_KEY deve ter exatamente 32 caracteres (atual: ${#ENCRYPTION_KEY})"
        ERRORS=$((ERRORS + 1))
    else
        echo "✅ ENCRYPTION_KEY configurado (32 caracteres)"
    fi
fi

echo ""

# Verificar Docker
echo "🐳 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERRO: Docker não instalado"
    echo "   Instale: curl -fsSL https://get.docker.com | sh"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Docker instalado"
    docker --version
fi

echo ""

# Verificar Docker Compose
echo "🐳 Verificando Docker Compose..."
if ! docker compose version &> /dev/null; then
    echo "❌ ERRO: Docker Compose não instalado"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ Docker Compose instalado"
    docker compose version
fi

echo ""

# Verificar estrutura de diretórios
echo "📁 Verificando estrutura de diretórios..."
REQUIRED_DIRS=("backend" "frontend" "backend/src" "frontend/src")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ ERRO: Diretório $dir não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
done
echo "✅ Estrutura de diretórios OK"

echo ""

# Verificar arquivos essenciais
echo "📄 Verificando arquivos essenciais..."
REQUIRED_FILES=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "backend/package.json"
    "frontend/package.json"
    "backend/src/server.js"
    "backend/src/prisma/schema.prisma"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ ERRO: Arquivo $file não encontrado"
        ERRORS=$((ERRORS + 1))
    fi
done
echo "✅ Arquivos essenciais OK"

echo ""

# Verificar rede Traefik
echo "🌐 Verificando rede Traefik..."
if docker network ls | grep -q traefik-public; then
    echo "✅ Rede traefik-public existe"
else
    echo "⚠️  AVISO: Rede traefik-public não existe"
    echo "   Opções:"
    echo "   1. Criar: docker network create traefik-public"
    echo "   2. Usar docker-compose.local.yml"
fi

echo ""

# Verificar portas
echo "🔌 Verificando portas..."
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":80 "; then
        echo "⚠️  AVISO: Porta 80 já está em uso"
        echo "   Pode ser necessário parar o serviço usando a porta"
    else
        echo "✅ Porta 80 disponível"
    fi
else
    echo "⚠️  netstat não disponível, pulando verificação de portas"
fi

echo ""
echo "=========================================="
echo "  Resumo da Verificação"
echo "=========================================="
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ SUCESSO: Tudo pronto para deploy!"
    echo ""
    echo "Próximos passos:"
    echo "  1. docker compose up -d --build"
    echo "  2. docker compose logs -f"
    echo "  3. Acesse: https://cofrekeys.duckdns.org"
    echo ""
    exit 0
else
    echo "❌ FALHA: $ERRORS erro(s) encontrado(s)"
    echo ""
    echo "Corrija os erros acima antes de fazer o deploy."
    echo ""
    exit 1
fi
