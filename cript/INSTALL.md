# 🚀 Guia de Instalação - Secrets Vault

## Pré-requisitos

- Docker Desktop instalado e rodando
- Node.js 20+ instalado
- PowerShell ou CMD

## Instalação Passo-a-Passo

### Opção 1: Script Automático

```batch
# Execute o script de inicialização
scripts\init-project.bat
```

### Opção 2: Instalação Manual

#### Passo 1: Gerar Chaves de Segurança

```batch
node scripts\generate-keys.js
```

Isto irá criar:
- `.env` com todas as chaves necessárias
- `secrets/master_key.txt` com a chave mestra

#### Passo 2: Instalar Dependências Localmente (Opcional mas Recomendado)

```batch
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

#### Passo 3: Construir e Iniciar Containers

```batch
docker compose up -d --build
```

#### Passo 4: Aguardar Serviços Iniciarem

```batch
# Aguardar 30 segundos
timeout /t 30

# Verificar status
docker compose ps
```

Todos os serviços devem mostrar status "Up" ou "healthy".

#### Passo 5: Testar o Sistema

```batch
# Teste automático via API
docker compose exec backend npm test

# Ou abrir no browser
start http://localhost
```

## Verificação de Problemas

### Ver Logs

```batch
# Logs de todos os serviços
docker compose logs -f

# Logs individuais
docker compose logs backend
docker compose logs frontend
docker compose logs db
docker compose logs nginx
```

### Status dos Containers

```batch
docker compose ps
```

Deve mostrar 4 containers:
- `secrets-backend` - Status: Up (healthy)
- `secrets-frontend` - Status: Up
- `secrets-db` - Status: Up (healthy)
- `secrets-nginx` - Status: Up (healthy)

### Verificar .env

```batch
type .env
```

Deve conter:
- `DB_ROOT_PASSWORD`
- `DB_PASSWORD`
- `JWT_SECRET`
- `MASTER_KEY` (64 caracteres hexadecimais)

## Problemas Comuns

### Erro: "MASTER_KEY not configured"

**Solução:**
```batch
node scripts\generate-keys.js
docker compose restart backend
```

### Erro: "Port 80 already in use"

**Solução 1:** Parar o serviço que usa a porta 80

**Solução 2:** Mudar a porta no `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Usar porta 8080 em vez de 80
```

Depois aceder via `http://localhost:8080`

### Erro: "Cannot connect to database"

**Solução:**
```batch
# Verificar se o DB está rodando
docker compose logs db

# Reiniciar DB
docker compose restart db

# Aguardar 10 segundos
timeout /t 10

# Reiniciar backend
docker compose restart backend
```

### Erro de Build no Frontend

**Solução:**
```batch
# Limpar e reconstruir
docker compose down
docker system prune -f
cd frontend
rmdir /s /q node_modules
rmdir /s /q .next
npm install
cd ..
docker compose up -d --build
```

### Erro de Build no Backend

**Solução:**
```batch
# Limpar e reconstruir
docker compose down
cd backend
rmdir /s /q node_modules
npm install
cd ..
docker compose up -d --build
```

## Reiniciar o Sistema

```batch
# Parar tudo
docker compose down

# Iniciar novamente
docker compose up -d
```

## Remover Completamente

```batch
# Parar e remover containers + volumes
docker compose down -v

# Remover imagens
docker rmi cript-backend cript-frontend

# Limpar dados (CUIDADO: Remove todos os segredos!)
rmdir /s /q backend\logs
rmdir /s /q backend\node_modules
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\.next
```

## Teste Rápido

Após instalação bem-sucedida:

1. **Abrir Browser**: http://localhost
2. **Registar conta**: Username: `testuser`, Password: `TestPass123!`
3. **Fazer Login**
4. **Criar um segredo**
5. **Visualizar o segredo desencriptado**

## Próximos Passos

- Ler o [README.md](README.md) para documentação completa
- Consultar [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) para testes detalhados
- Ver logs de auditoria: `docker compose exec backend cat logs/audit.log`

## Suporte

Se encontrar problemas:

1. Verificar logs: `docker compose logs -f`
2. Verificar status: `docker compose ps`
3. Verificar .env: `type .env`
4. Reiniciar: `docker compose restart`
5. Reconstruir: `docker compose up -d --build`

## Notas de Segurança

⚠️ **IMPORTANTE:**

- A `MASTER_KEY` no `.env` é CRÍTICA - sem ela não consegue desencriptar segredos
- Fazer backup da `MASTER_KEY` em local seguro
- Nunca commitar o `.env` ou `secrets/` para git
- Este sistema é para **testes e desenvolvimento apenas**
- **NÃO usar em produção** sem auditoria de segurança profissional

---

**Data:** 2025-01-04
**Versão:** 1.0.0
