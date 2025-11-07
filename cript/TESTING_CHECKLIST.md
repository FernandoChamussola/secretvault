# 🧪 Testing Checklist - Secrets Vault

Use esta checklist para validar que o sistema está a funcionar corretamente.

## Pré-requisitos

- [ ] Docker e Docker Compose instalados
- [ ] Node.js 20+ instalado (para scripts)
- [ ] Porta 80 disponível (não usada por outro serviço)
- [ ] Geradas as chaves de segurança (`node scripts/generate-keys.js`)
- [ ] Ficheiro `.env` criado com MASTER_KEY válida

## Inicialização

- [ ] `docker compose up -d` executado sem erros
- [ ] Todos os 4 containers estão "healthy" (`docker compose ps`)
- [ ] Backend mostra "Server running on port 3001" nos logs
- [ ] Frontend mostra "ready - started server" nos logs
- [ ] Database mostra "ready for connections" nos logs
- [ ] Nginx responde no health check: `curl http://localhost/health`

## Testes Automatizados

- [ ] Script de teste da API executado: `docker compose exec backend npm test`
- [ ] Todos os 6 testes passaram (register, login, create, read, list, delete)
- [ ] Teste PowerShell executado: `.\scripts\test-api.ps1`
- [ ] Teste de rate limiting executado: `.\scripts\test-rate-limit.ps1`

## Testes Manuais - Frontend

### Registo
- [ ] Aceder a http://localhost
- [ ] Redireciona para `/login`
- [ ] Clicar em "Register"
- [ ] Criar utilizador com username válido (3+ caracteres, alfanumérico)
- [ ] Password aceita apenas se tiver 8+ caracteres, maiúsculas, minúsculas e números
- [ ] Passwords fracas são rejeitadas
- [ ] Registo bem-sucedido redireciona para login
- [ ] Utilizador duplicado mostra erro

### Login
- [ ] Login com credenciais corretas funciona
- [ ] Login com credenciais incorretas mostra erro
- [ ] Após login, redireciona para `/secrets`
- [ ] Token JWT armazenado em sessionStorage
- [ ] Username mostrado no header

### Gestão de Segredos
- [ ] Página `/secrets` mostra interface vazia se não houver segredos
- [ ] Botão "+ New Secret" visível
- [ ] Criar segredo com nome e valor funciona
- [ ] Notas opcionais podem ser adicionadas
- [ ] Segredo aparece na lista à esquerda após criação
- [ ] Clicar num segredo mostra os detalhes
- [ ] Valor desencriptado é mostrado corretamente
- [ ] Botão "Copy" copia o valor para clipboard
- [ ] Datas de criação e atualização são mostradas
- [ ] Botão "Delete" remove o segredo após confirmação
- [ ] Após eliminar, segredo desaparece da lista

### Logout
- [ ] Botão "Logout" no header funciona
- [ ] Após logout, redireciona para `/login`
- [ ] Token removido do sessionStorage
- [ ] Acesso a `/secrets` sem login redireciona para `/login`

## Testes de Segurança

### Encriptação
- [ ] Conectar à DB: `docker compose exec db mysql -u secrets_user -p secrets_vault`
- [ ] Executar: `SELECT * FROM secrets;`
- [ ] Coluna `value_encrypted` contém hex (não texto plano)
- [ ] Coluna `iv` contém 24 caracteres hex (12 bytes)
- [ ] Coluna `auth_tag` contém 32 caracteres hex (16 bytes)
- [ ] Cada segredo tem IV único (nunca repetido)

### Autenticação
- [ ] Acesso a `/api/secrets` sem token retorna 401
- [ ] Token inválido retorna 401
- [ ] Token expirado retorna 401 (testar após 24h)

### Autorização
- [ ] Criar 2 utilizadores diferentes
- [ ] Cada utilizador só vê os seus próprios segredos
- [ ] Tentar aceder ao segredo de outro user (via API) retorna 404

### Rate Limiting
- [ ] Após 5 tentativas de login falhadas, retorna 429
- [ ] Rate limit reseta após 15 minutos
- [ ] Diferentes IPs têm rate limits independentes

### Validação de Inputs
- [ ] Username com < 3 caracteres é rejeitado
- [ ] Username com caracteres especiais (exceto _ -) é rejeitado
- [ ] Password com < 8 caracteres é rejeitada
- [ ] Password sem maiúsculas/minúsculas/números é rejeitada
- [ ] Nome de segredo vazio é rejeitado
- [ ] Valor de segredo vazio é rejeitado
- [ ] XSS attempts são sanitizados (testar: `<script>alert(1)</script>`)

## Logs e Auditoria

- [ ] Logs de aplicação: `docker compose logs backend`
- [ ] Logs de auditoria: `docker compose exec backend cat logs/audit.log`
- [ ] Eventos registados incluem:
  - [ ] `user_registered`
  - [ ] `login_success`
  - [ ] `login_failed`
  - [ ] `secret_created`
  - [ ] `secret_read`
  - [ ] `secret_updated`
  - [ ] `secret_deleted`
- [ ] Logs NÃO contêm valores desencriptados
- [ ] Logs NÃO contêm passwords em texto plano
- [ ] Logs incluem timestamps e user_id

## Backup e Recovery

- [ ] Backup da DB: `docker compose exec db mysqldump -u secrets_user -p secrets_vault > backup.sql`
- [ ] Backup criado com sucesso
- [ ] Backup contém dados encriptados (não texto plano)
- [ ] MASTER_KEY guardada separadamente em local seguro
- [ ] Testar restore: `docker compose exec -T db mysql -u secrets_user -p secrets_vault < backup.sql`
- [ ] Após restore, segredos ainda podem ser desencriptados

## Performance e Estabilidade

- [ ] Sistema responde em < 1s para operações normais
- [ ] Criar 100+ segredos não causa problemas de performance
- [ ] Restart dos containers mantém dados: `docker compose restart`
- [ ] Health checks passam consistentemente
- [ ] Não há memory leaks após uso prolongado

## Configuração Docker

- [ ] Todos os containers usam utilizadores não-root
- [ ] Volumes persistentes criados para DB
- [ ] Rede interna isola serviços
- [ ] Apenas porta 80 (e 443 se HTTPS) exposta
- [ ] Backend não é acessível diretamente (apenas via nginx)
- [ ] DB não é acessível externamente

## Documentação

- [ ] README.md completo e claro
- [ ] Instruções de instalação funcionam
- [ ] Avisos de segurança claramente visíveis
- [ ] API documentation está correta
- [ ] Exemplos de uso são funcionais

## Problemas Conhecidos

Documentar aqui quaisquer problemas encontrados:

```
1. [Descrever problema]
   - Passos para reproduzir:
   - Workaround:

2. [Descrever problema]
   ...
```

## Notas Adicionais

```
[Adicionar notas sobre o ambiente de teste, versões, etc.]
```

---

**Data do teste**: _________________

**Testado por**: _________________

**Ambiente**: [ ] Development  [ ] Staging  [ ] Production

**Resultado**: [ ] Passou  [ ] Falhou  [ ] Parcial

**Observações**:
```
