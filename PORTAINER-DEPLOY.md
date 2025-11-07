# Deploy CofreKeys via Portainer

## Guia Completo de Deploy usando Portainer

### Pré-requisitos
- Portainer instalado e rodando
- Rede Traefik configurada (`traefik-public`)
- Git instalado na VPS (ou fazer upload manual dos arquivos)

---

## Método 1: Deploy via Git Repository (RECOMENDADO)

### Passo 1: Preparar Repositório Git
```bash
# Na sua máquina local, fazer commit e push do projeto
cd /path/to/cofrekeys
git add .
git commit -m "Setup CofreKeys with MySQL"
git push origin main
```

### Passo 2: No Portainer

1. **Acesse Portainer**: `https://seu-portainer.com`

2. **Vá em "Stacks" > "Add Stack"**

3. **Configurações da Stack:**
   - **Name**: `cofrekeys`
   - **Build method**: Selecione "Repository"

4. **Repository Configuration:**
   - **Repository URL**: `https://github.com/seu-usuario/cofrekeys` (ou seu repo)
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`

5. **Environment Variables** (muito importante!):
   Adicione as seguintes variáveis:
   ```
   DB_ROOT_PASSWORD=SeuSenhaRootMySQL2024!Segura
   DB_PASSWORD=SeuSenhaUserMySQL2024!Segura
   JWT_SECRET=SeuSecretJWT2024MuitoSeguroComMaisde32Caracteres!
   ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   FRONTEND_URL=https://cofrekeys.duckdns.org
   ```

   **⚠️ IMPORTANTE:**
   - `ENCRYPTION_KEY` deve ter EXATAMENTE 32 caracteres
   - `JWT_SECRET` deve ter no mínimo 32 caracteres
   - Use senhas fortes e únicas!

6. **Deploy**:
   - Clique em "Deploy the stack"
   - Aguarde o build (pode levar 3-5 minutos)

---

## Método 2: Deploy via Upload de Arquivo

### Passo 1: Preparar arquivos

Na sua VPS, copie os arquivos do projeto:
```bash
# Conectar via SSH na VPS
ssh usuario@seu-vps-ip

# Criar diretório
mkdir -p /opt/cofrekeys
cd /opt/cofrekeys

# Fazer upload dos arquivos (via SFTP ou git clone)
git clone https://github.com/seu-usuario/cofrekeys.git .
```

### Passo 2: No Portainer

1. **Acesse Portainer** e vá em "Stacks" > "Add Stack"

2. **Configurações:**
   - **Name**: `cofrekeys`
   - **Build method**: "Upload"

3. **Upload `docker-compose.yml`**

4. **Adicionar Environment Variables** (mesmas do Método 1)

5. **Deploy the stack**

---

## Método 3: Deploy via Web Editor (Mais Simples)

### Passo 1: No Portainer

1. **Acesse Portainer** > "Stacks" > "Add Stack"

2. **Configurações:**
   - **Name**: `cofrekeys`
   - **Build method**: "Web editor"

3. **Cole o conteúdo completo do docker-compose.yml:**

```yaml
services:
  # MySQL Database
  cofrekeys-db:
    image: mysql:8.0
    container_name: cofrekeys-db
    restart: unless-stopped
    networks:
      - cofrekeys-network
      - traefik-public
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: cofrekeys
      MYSQL_USER: cofrekeys
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  cofrekeys-api:
    build:
      context: https://github.com/seu-usuario/cofrekeys.git#main:backend
    container_name: cofrekeys-api
    restart: unless-stopped
    networks:
      - cofrekeys-network
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://cofrekeys:${DB_PASSWORD}@cofrekeys-db:3306/cofrekeys
      JWT_SECRET: ${JWT_SECRET}
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      PORT: 3000
      FRONTEND_URL: ${FRONTEND_URL:-https://cofrekeys.duckdns.org}
    depends_on:
      cofrekeys-db:
        condition: service_healthy
    command: sh -c "npx prisma migrate deploy && npm start"

  # Frontend
  cofrekeys-frontend:
    build:
      context: https://github.com/seu-usuario/cofrekeys.git#main:frontend
    container_name: cofrekeys-frontend
    restart: unless-stopped
    networks:
      - cofrekeys-network
      - traefik-public
    depends_on:
      - cofrekeys-api
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.cofrekeys.rule=Host(`cofrekeys.duckdns.org`)"
      - "traefik.http.routers.cofrekeys.entrypoints=websecure"
      - "traefik.http.routers.cofrekeys.tls.certresolver=letsencrypt"
      - "traefik.http.services.cofrekeys.loadbalancer.server.port=80"
      - "traefik.docker.network=traefik-public"

volumes:
  mysql-data:

networks:
  cofrekeys-network:
    driver: bridge
  traefik-public:
    external: true
    name: traefik-public
```

4. **Adicionar Environment Variables**

5. **Deploy the stack**

---

## Verificar Deploy

### No Portainer

1. **Vá em "Stacks" > "cofrekeys"**
2. **Verifique os containers:**
   - ✅ `cofrekeys-db` - healthy
   - ✅ `cofrekeys-api` - running
   - ✅ `cofrekeys-frontend` - running

3. **Ver logs:**
   - Clique em cada container
   - Vá em "Logs" para verificar erros

### Testar a Aplicação

1. **Acesse**: `https://cofrekeys.duckdns.org`
2. **Crie uma conta**
3. **Adicione uma senha**

---

## Troubleshooting no Portainer

### Erro: Rede traefik-public não existe

**Solução:**
```bash
# SSH na VPS
docker network create traefik-public
```

Ou no Portainer:
1. Vá em "Networks"
2. "Add network"
3. Name: `traefik-public`
4. Driver: `bridge`

### Erro: Build failed

**Solução 1 - Usar imagens pré-buildadas:**

Na VPS, fazer build manual:
```bash
cd /opt/cofrekeys
docker compose build
```

Depois fazer deploy novamente no Portainer.

**Solução 2 - Remover build context do compose:**

Se os arquivos estão na VPS, remova o `build.context` do docker-compose.yml e use apenas:
```yaml
build:
  context: ./backend
  dockerfile: Dockerfile
```

### Erro: Environment variables não carregam

Certifique-se de adicionar TODAS as variáveis no Portainer:
- DB_ROOT_PASSWORD
- DB_PASSWORD
- JWT_SECRET (mínimo 32 chars)
- ENCRYPTION_KEY (exatamente 32 chars)
- FRONTEND_URL

### Erro: Database não conecta

1. **Verificar logs do MySQL:**
   - Portainer > Container `cofrekeys-db` > Logs

2. **Testar conexão:**
   - Portainer > Container `cofrekeys-api` > Console
   - Execute: `ping cofrekeys-db`

3. **Verificar health:**
   - Portainer > Container `cofrekeys-db`
   - Status deve ser "healthy"

### Erro: Migrations falham

**Executar migrations manualmente:**

1. **No Portainer:**
   - Container `cofrekeys-api` > Console
   - Execute: `npx prisma migrate deploy`

2. **Ou via SSH:**
```bash
docker exec cofrekeys-api npx prisma migrate deploy
```

---

## Comandos Úteis via Portainer Console

### Container: cofrekeys-api

```bash
# Ver status
npm run prisma:migrate

# Rodar migrations
npx prisma migrate deploy

# Resetar database (⚠️ DELETA DADOS)
npx prisma migrate reset --force

# Ver logs do Node
cat /proc/1/fd/1
```

### Container: cofrekeys-db

```bash
# Acessar MySQL
mysql -u cofrekeys -p cofrekeys

# Ver databases
SHOW DATABASES;

# Ver tabelas
USE cofrekeys;
SHOW TABLES;
```

---

## Atualizar Stack no Portainer

1. **Pull nova versão do código:**
   - Portainer > Stacks > cofrekeys
   - Clique em "Pull and redeploy"
   - Ou "Editor" > Update > "Update the stack"

2. **Rebuild forçado:**
   - SSH na VPS
   ```bash
   cd /opt/cofrekeys
   git pull
   docker compose build --no-cache
   ```
   - Portainer > Redeploy stack

---

## Backup via Portainer

### Backup do banco de dados

1. **Container `cofrekeys-db` > Console:**
```bash
mysqldump -u cofrekeys -p cofrekeys > /tmp/backup.sql
```

2. **Copiar backup:**
```bash
# Na VPS
docker cp cofrekeys-db:/tmp/backup.sql ./backup_$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
# Na VPS
docker cp backup_20250107.sql cofrekeys-db:/tmp/

# No console do container
mysql -u cofrekeys -p cofrekeys < /tmp/backup_20250107.sql
```

---

## Checklist Final

- [ ] Rede `traefik-public` criada
- [ ] Variáveis de ambiente configuradas no Portainer
- [ ] ENCRYPTION_KEY tem exatamente 32 caracteres
- [ ] JWT_SECRET tem no mínimo 32 caracteres
- [ ] Stack deployed com sucesso
- [ ] Todos containers rodando (3/3)
- [ ] Database healthy
- [ ] Aplicação acessível via HTTPS
- [ ] Certificado SSL válido (Traefik)
- [ ] Registro de usuário funcionando
- [ ] CRUD de senhas funcionando

---

## Suporte

Se encontrar problemas:
1. Verifique os logs no Portainer
2. Consulte DEPLOY.md para troubleshooting detalhado
3. Revise este guia

**Deploy bem-sucedido! 🚀**
