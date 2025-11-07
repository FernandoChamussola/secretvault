# 🚀 Guia de Deploy - CofreKeys

## Deploy via Portainer na VPS

### Pré-requisitos

1. VPS com Docker e Portainer instalados
2. Traefik configurado e rodando
3. Network `traefik-public` criada
4. DuckDNS configurado apontando para o IP da VPS

---

## 📋 Passo a Passo

### 1. No Portainer, crie uma nova Stack

- Nome da Stack: `cofrekeys`
- Build method: **Repository**

### 2. Configure o repositório

- Repository URL: `https://github.com/SEU_USUARIO/secretvault`
- Repository reference: `refs/heads/main`
- Compose path: `docker-compose.yml`

### 3. Configure as variáveis de ambiente

Clique em "Add an environment variable" e adicione:

```
MYSQL_ROOT_PASSWORD=SuaSenhaRootMuitoSegura2024!
MYSQL_PASSWORD=SuaSenhaMySQLMuitoSegura2024!
JWT_SECRET=seu_jwt_secret_super_seguro_com_caracteres_aleatorios_12345
```

**IMPORTANTE:** Use senhas fortes e diferentes das de exemplo!

### 4. Deploy

- Clique em "Deploy the stack"
- Aguarde o build das imagens (pode levar alguns minutos)
- Verifique os logs de cada container

---

## ✅ Verificação

### 1. Verificar containers

No Portainer, vá em Stacks > cofrekeys e verifique se os 3 containers estão rodando:

- ✅ `cofrekeys-mysql` (healthy)
- ✅ `cofrekeys-api` (running)
- ✅ `cofrekeys-frontend` (running)

### 2. Verificar logs

**Backend (API):**
Deve mostrar:
```
✅ Database initialized
🚀 CofreKeys API running on port 3000
```

**Frontend:**
Deve mostrar logs do Nginx sem erros.

### 3. Testar acesso

Acesse: `https://cofrekeys.duckdns.org`

Você deve ver a página de login do CofreKeys.

---

## 🔧 Troubleshooting

### Erro: Network traefik-public not found

```bash
docker network create traefik-public
```

### Erro: Cannot resolve hostname

Verifique se o DuckDNS está apontando para o IP correto da VPS:

```bash
nslookup cofrekeys.duckdns.org
```

### Frontend não consegue conectar com API

Verifique os logs do frontend:

```bash
docker logs cofrekeys-frontend
```

Se houver erro "host not found in upstream", reconstrua a imagem:

```bash
# No Portainer, vá em Stacks > cofrekeys
# Clique em "Editor" e depois em "Update the stack" com "Re-pull image and redeploy"
```

### MySQL não inicia

Verifique se a porta 3306 não está sendo usada:

```bash
netstat -tulpn | grep 3306
```

Se estiver, pare o MySQL local ou use outra porta no docker-compose.

---

## 🔒 Segurança em Produção

### 1. Alterar senhas padrão

NUNCA use as senhas do `.env.example` em produção!

### 2. Backup do banco de dados

Configure backups automáticos do volume MySQL:

```bash
docker run --rm \
  -v cofrekeys_mysql-data:/data \
  -v /backups:/backup \
  alpine tar czf /backup/cofrekeys-mysql-$(date +%Y%m%d).tar.gz /data
```

### 3. Monitoramento

Configure alertas no Portainer para monitorar:
- Status dos containers
- Uso de CPU/Memória
- Espaço em disco

---

## 📝 Comandos Úteis

### Ver logs em tempo real

```bash
# Backend
docker logs -f cofrekeys-api

# Frontend
docker logs -f cofrekeys-frontend

# MySQL
docker logs -f cofrekeys-mysql
```

### Reiniciar um container

```bash
docker restart cofrekeys-api
```

### Acessar MySQL

```bash
docker exec -it cofrekeys-mysql mysql -u cofrekeys -p
# Digite a senha do MYSQL_PASSWORD
```

### Backup manual do banco

```bash
docker exec cofrekeys-mysql mysqldump -u cofrekeys -p cofrekeys > backup.sql
```

### Restaurar backup

```bash
docker exec -i cofrekeys-mysql mysql -u cofrekeys -p cofrekeys < backup.sql
```

---

## 🎯 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Todos os containers estão rodando (healthy)
- [ ] Site acessível via HTTPS em `https://cofrekeys.duckdns.org`
- [ ] Possível criar conta
- [ ] Possível fazer login
- [ ] Possível criar senha
- [ ] Possível ver senha
- [ ] Possível editar senha
- [ ] Possível deletar senha
- [ ] Interface responsiva (testar no mobile)
- [ ] Senhas estão sendo salvas no banco (persistem após restart)
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Backup configurado

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs dos containers
2. Verifique se o Traefik está configurado corretamente
3. Verifique se o DuckDNS está apontando para o IP correto
4. Verifique as variáveis de ambiente

---

**Desenvolvido com ❤️ usando React + Node.js + MySQL**

Testado e funcionando localmente ✅
Pronto para deploy em produção 🚀
