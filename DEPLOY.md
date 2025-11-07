# CofreKeys - Guia de Deploy na VPS

## Pré-requisitos

1. **VPS com Ubuntu/Debian**
2. **Docker e Docker Compose instalados**
3. **Traefik rodando** (para HTTPS automático)
4. **DuckDNS configurado** apontando para o IP da VPS

---

## Passo 1: Preparar a VPS

### Instalar Docker (se não tiver)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y
```

---

## Passo 2: Clonar o Projeto na VPS

```bash
# Clonar repositório
cd /home/$USER
git clone <seu-repositorio-url> cofrekeys
cd cofrekeys
```

---

## Passo 3: Configurar Variáveis de Ambiente

### Opção A: Usar valores fornecidos (.env já existe)
```bash
# O arquivo .env já está configurado com valores seguros
cat .env
```

### Opção B: Gerar novos valores (RECOMENDADO para produção)
```bash
# Instalar openssl se não tiver
sudo apt install openssl -y

# Gerar valores seguros
DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SEC=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
ENC_KEY=$(openssl rand -hex 16)

# Criar arquivo .env
cat > .env << EOF
# Database
DB_PASSWORD=${DB_PASS}

# JWT (at least 32 characters recommended)
JWT_SECRET=${JWT_SEC}

# Encryption (must be exactly 32 characters)
ENCRYPTION_KEY=${ENC_KEY}

# Frontend URL (for CORS)
FRONTEND_URL=https://cofrekeys.duckdns.org
EOF

echo "✅ Arquivo .env criado!"
echo "⚠️  SALVE ESTES VALORES EM LOCAL SEGURO:"
echo "DB_PASSWORD: ${DB_PASS}"
echo "JWT_SECRET: ${JWT_SEC}"
echo "ENCRYPTION_KEY: ${ENC_KEY}"
```

---

## Passo 4: Verificar Rede Traefik

```bash
# Verificar se rede traefik-public existe
docker network ls | grep traefik-public

# Se NÃO existir, criar:
docker network create traefik-public
```

---

## Passo 5: Deploy da Aplicação

### Com Traefik (HTTPS automático)
```bash
# Build e start
docker compose up -d --build

# Aguardar serviços iniciarem (30-60 segundos)
docker compose ps

# Verificar logs
docker compose logs -f
```

### Sem Traefik (HTTP apenas - localhost)
```bash
# Usar arquivo docker-compose.local.yml
docker compose -f docker-compose.local.yml up -d --build
```

---

## Passo 6: Verificar Status

```bash
# Ver status dos containers
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Ver logs específicos
docker compose logs cofrekeys-api
docker compose logs cofrekeys-frontend
docker compose logs cofrekeys-db
```

**Status esperado:**
- ✅ cofrekeys-db - healthy
- ✅ cofrekeys-api - running
- ✅ cofrekeys-frontend - running

---

## Passo 7: Testar a Aplicação

### Testar Backend (API)
```bash
# Health check
curl http://localhost:3000/health

# Ou através do frontend
curl http://localhost/api/health
```

### Testar Frontend
Abra no navegador: `https://cofrekeys.duckdns.org`

---

## Troubleshooting

### Problema 1: Rede Traefik não existe
```bash
# Criar rede
docker network create traefik-public

# Ou usar versão local
docker compose -f docker-compose.local.yml up -d --build
```

### Problema 2: Porta 80 já em uso
```bash
# Ver o que está usando a porta
sudo netstat -tulpn | grep :80

# Parar serviço que está usando (exemplo: nginx)
sudo systemctl stop nginx

# Ou mudar porta no docker-compose.yml
# ports:
#   - "8080:80"
```

### Problema 3: Database não conecta
```bash
# Verificar logs do database
docker compose logs cofrekeys-db

# Verificar se está healthy
docker compose ps

# Reiniciar database
docker compose restart cofrekeys-db

# Se necessário, resetar database
docker compose down
docker volume rm secretvault_postgres-data
docker compose up -d --build
```

### Problema 4: Migrations falham
```bash
# Rodar migrations manualmente
docker compose exec cofrekeys-api npx prisma migrate deploy

# Ou resetar e rodar novamente
docker compose exec cofrekeys-api npx prisma migrate reset --force
docker compose exec cofrekeys-api npx prisma migrate deploy
```

### Problema 5: Frontend não conecta ao Backend
```bash
# Verificar se backend está rodando
docker compose exec cofrekeys-api curl http://localhost:3000/health

# Verificar logs do nginx
docker compose logs cofrekeys-frontend

# Reiniciar frontend
docker compose restart cofrekeys-frontend
```

### Problema 6: Variáveis de ambiente não carregam
```bash
# Verificar .env existe
ls -la .env

# Verificar conteúdo
cat .env

# Recriar containers
docker compose down
docker compose up -d --build
```

---

## Comandos Úteis

### Reiniciar aplicação
```bash
docker compose restart
```

### Ver logs
```bash
# Todos os serviços
docker compose logs -f

# Apenas um serviço
docker compose logs -f cofrekeys-api

# Últimas 50 linhas
docker compose logs --tail=50
```

### Parar aplicação
```bash
docker compose down
```

### Parar e remover volumes (⚠️ DELETA BANCO DE DADOS)
```bash
docker compose down -v
```

### Rebuild completo
```bash
docker compose down
docker compose up -d --build --force-recreate
```

### Acessar container
```bash
# Backend
docker compose exec cofrekeys-api sh

# Database
docker compose exec cofrekeys-db psql -U cofrekeys -d cofrekeys

# Frontend
docker compose exec cofrekeys-frontend sh
```

### Backup do banco de dados
```bash
# Criar backup
docker compose exec cofrekeys-db pg_dump -U cofrekeys cofrekeys > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker compose exec -T cofrekeys-db psql -U cofrekeys -d cofrekeys < backup_20250107.sql
```

---

## Verificação Final

Execute estes comandos para verificar se tudo está funcionando:

```bash
# 1. Verificar containers rodando
docker compose ps

# 2. Verificar health do database
docker compose exec cofrekeys-db pg_isready -U cofrekeys

# 3. Verificar API
curl http://localhost/api/health

# 4. Verificar logs sem erros
docker compose logs --tail=20

# 5. Testar no navegador
# Abrir: https://cofrekeys.duckdns.org
```

---

## Atualizar Aplicação

```bash
# Pull novas alterações
git pull

# Rebuild e restart
docker compose down
docker compose up -d --build

# Rodar migrations (se houver)
docker compose exec cofrekeys-api npx prisma migrate deploy
```

---

## Monitoramento

### Ver uso de recursos
```bash
docker stats
```

### Ver tamanho dos volumes
```bash
docker system df -v
```

### Limpar recursos não usados
```bash
docker system prune -a
```

---

## Segurança em Produção

- ✅ HTTPS habilitado via Traefik
- ✅ Senhas criptografadas (AES-256)
- ✅ JWT para autenticação
- ✅ CORS configurado
- ⚠️ **IMPORTANTE:** Altere as credenciais do .env para valores únicos e seguros!

---

## Suporte

Se encontrar problemas:

1. Verifique os logs: `docker compose logs -f`
2. Verifique o status: `docker compose ps`
3. Revise este guia de troubleshooting
4. Abra uma issue no GitHub

**Deploy concluído! 🚀**
