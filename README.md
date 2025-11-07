# 🔐 CofreKeys - Gerenciador de Senhas

Gerenciador de senhas SIMPLES e FUNCIONAL com React + Node.js + MySQL.

## 🚀 Como usar

### 1. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e altere as senhas!

### 2. Subir com Docker

```bash
docker compose up --build
```

### 3. Acessar

**Local:** http://localhost

**Produção:** https://cofrekeys.duckdns.org

## 📦 O que tem?

- ✅ Login e Cadastro
- ✅ CRUD completo de senhas
- ✅ Interface bonita e responsiva
- ✅ Ver, copiar, editar e deletar senhas
- ✅ Docker pronto para deploy

## 🛠️ Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- React Router
- Axios

**Backend:**
- Node.js + Express
- MySQL
- JWT Auth
- bcrypt

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Pegar usuário atual

### Passwords (precisa estar autenticado)
- `GET /api/passwords` - Listar todas
- `GET /api/passwords/:id` - Ver uma
- `POST /api/passwords` - Criar nova
- `PUT /api/passwords/:id` - Editar
- `DELETE /api/passwords/:id` - Deletar

## 🎨 Recursos

- Mostrar/esconder senha com 👁️
- Copiar senha com um clique
- Cards organizados
- Modais bonitos
- Totalmente responsivo

## 🔒 Segurança

- Senhas de usuário com bcrypt hash
- JWT para autenticação
- MySQL com foreign keys

**Nota:** Este é um projeto de teste. As senhas salvas NÃO são criptografadas (apenas hash da senha de login).

## 📄 Licença

MIT
