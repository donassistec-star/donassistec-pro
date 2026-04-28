# 🚀 Guia de Deploy - DonAssistec

Este guia explica como fazer o deploy completo do DonAssistec usando Docker Compose.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git (para clonar o repositório)

## 🔧 Configuração Inicial

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd DonAssistec
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- **JWT_SECRET**: Use uma string aleatória segura em produção
- **MYSQL_ROOT_PASSWORD**: Senha forte para o MySQL
- **CORS_ORIGIN**: URL do seu frontend em produção
- **VITE_API_URL**: URL completa da API em produção

## 🐳 Deploy com Docker Compose

### Iniciar todos os serviços

```bash
docker-compose up -d
```

Isso irá iniciar:
- ✅ MySQL (porta 3307)
- ✅ phpMyAdmin (porta 8081)
- ✅ Backend API (porta 3001)
- ✅ Frontend (porta 8200)

### Verificar status dos serviços

```bash
docker-compose ps
```

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Parar serviços

```bash
docker-compose down
```

### Parar e remover volumes (⚠️ CUIDADO: apaga dados)

```bash
docker-compose down -v
```

## 🔄 Rebuild após mudanças

### Rebuild completo

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Rebuild de serviço específico

```bash
docker-compose build backend
docker-compose up -d backend
```

## 🌐 Acessos

Após o deploy, você pode acessar:

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **phpMyAdmin local**: http://127.0.0.1:8081

## 🗄️ Banco de Dados

### Acessar via phpMyAdmin

Configuração atual do projeto:

- O container `phpmyadmin` publica a porta `80` interna em `127.0.0.1:8081`
- Isso significa que o acesso direto fica disponível apenas no próprio servidor
- O container usa `PMA_HOST=mysql` e se conecta ao MySQL interno da stack Docker

**Acesso local no servidor:**

1. Acesse `http://127.0.0.1:8081`
2. Usuário: `root`
3. Senha: (valor de `MYSQL_ROOT_PASSWORD` no `.env`)

**Opcional para acesso externo protegido:**

Existe um proxy dedicado em [nginx-phpmyadmin-secure.conf](/home/DonAssistec/nginx-phpmyadmin-secure.conf:1) com:

- `http://SEU_HOST:8083` redirecionando para `https://SEU_HOST:8443`
- autenticação básica via arquivo `nginx-phpmyadmin.htpasswd`
- proxy reverso para `http://127.0.0.1:8081`

Importante:

- a porta `8081` não deve ser exposta publicamente
- a senha do Basic Auth não deve ser documentada no repositório
- se for liberar acesso externo, prefira restringir por IP e usar HTTPS válido

### Acessar via linha de comando

```bash
docker exec -it donassistec_mysql mysql -u root -p
```

### Backup do banco de dados

```bash
docker exec donassistec_mysql mysqldump -u root -p donassistec_db > backup.sql
```

### Restaurar backup

```bash
docker exec -i donassistec_mysql mysql -u root -p donassistec_db < backup.sql
```

## 🔐 Segurança em Produção

### 1. Alterar senhas padrão

Edite o `.env` com senhas fortes:
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`
- `JWT_SECRET`

### 2. Nginx como proxy reverso (VPS)

Na raiz do projeto existe `nginx-vps.conf` para deploy em VPS:

- **Porta 80** → proxy `/` para o frontend em `127.0.0.1:8200`
- **`/api`** → proxy para o backend em `127.0.0.1:3001`
- **`/uploads`** e **`/health`** → backend
- **server_name**: `177.67.32.204`, `donassistec.com.br`, `www.donassistec.com.br`
- **Fallback SPA**: quando o frontend retorna 404 (ex.: rota `/apk`), o nginx devolve o `index.html` (location `@spa`), para o React Router tratar rotas como `/apk`, `/sobre`, etc.

**Comandos no servidor:**

```bash
sudo cp /home/DonAssistec/nginx-vps.conf /etc/nginx/sites-available/donassistec
sudo ln -sf /etc/nginx/sites-available/donassistec /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

**Recuperação rápida se o domínio retornar `ERR_CONNECTION_REFUSED`:**

```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx
curl -k -I https://127.0.0.1
curl -k https://127.0.0.1/health
```

Se o `nginx` aparecer como `inactive (dead)`, o domínio pode recusar conexão mesmo com backend e frontend ainda rodando no PM2.

**Página de download do APK:** a rota **https://donassistec.com.br/apk** exibe a página para baixar o app Android. Para o link funcionar, o build do frontend deve incluir a página `/apk` e, em produção, o nginx deve estar com o fallback SPA (acima). Para o botão de download servir o arquivo, coloque o APK em `public/DonAssistec.apk` no frontend antes do deploy (veja `docs/APK.md`).

**Firewall (firewalld):** libere 80 e 443:

```bash
sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
sudo firewall-cmd --zone=public --add-port=443/tcp --permanent
sudo firewall-cmd --reload
```

**Backend (`.env`):** para o domínio, use `CORS_ORIGIN=https://donassistec.com.br` (ou `http://` se ainda sem SSL).

### 3. Configurar HTTPS

Use Nginx com certificados SSL (Let's Encrypt, etc.):

```nginx
server {
    listen 443 ssl;
    server_name donassistec.com.br www.donassistec.com.br;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8200;
        proxy_set_header Host 127.0.0.1;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
    location /uploads { proxy_pass http://127.0.0.1:3001; proxy_set_header Host $host; }
    location /health { proxy_pass http://127.0.0.1:3001; }
}
```

### 4. Firewall

- Abra as portas necessárias: **80** (HTTP), **443** (HTTPS). No firewalld: `sudo firewall-cmd --zone=public --add-port=80/tcp --permanent` (e 443); depois `--reload`.
- Restrinja acesso ao MySQL (porta 3307) e ao phpMyAdmin apenas em desenvolvimento ou a IPs de confiança.

### 5. Variáveis de Ambiente

Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

**Produção com domínio (ex.: donassistec.com.br):**
- **Backend** `backend/.env`: `CORS_ORIGIN=https://donassistec.com.br`
- O frontend detecta `donassistec.com.br` e `177.67.32.204` e usa `/api` no mesmo host (sem `:3001`).

## 📊 Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

```bash
# Verificar saúde dos containers
docker-compose ps
```

### Logs

```bash
# Logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100
```

## 🚨 Troubleshooting

### Domínio com `ERR_CONNECTION_REFUSED`

Se `https://donassistec.com.br` não abrir e o navegador mostrar `ERR_CONNECTION_REFUSED`, verifique nesta ordem:

```bash
sudo systemctl status nginx
curl -s http://127.0.0.1:3001/health
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8200/
curl -k -I https://127.0.0.1
```

Interpretação rápida:

- Backend `200` e frontend `200`, mas domínio recusando conexão: o suspeito principal é o `nginx` parado ou porta 80/443 bloqueada.
- `nginx` inativo: execute `sudo nginx -t && sudo systemctl start nginx`.
- HTTPS local funcionando em `https://127.0.0.1`, mas domínio ainda falhando: revisar DNS, firewall e balanceador/proxy externo.

### phpMyAdmin

Estado atual do acesso:

- acesso direto apenas por `http://127.0.0.1:8081`
- não exposto diretamente no domínio principal
- opção de proxy protegido em `8083/8443` com `nginx-phpmyadmin-secure.conf`

Validação rápida:

```bash
docker-compose ps
curl -I http://127.0.0.1:8081
```

Se quiser publicar externamente com proteção:

```bash
docker run --name phpmyadmin-proxy \
  -p 8083:8083 -p 8443:8443 \
  -v /home/DonAssistec/nginx-phpmyadmin-secure.conf:/etc/nginx/nginx.conf:ro \
  -v /home/DonAssistec/nginx-phpmyadmin.htpasswd:/home/DonAssistec/nginx-phpmyadmin.htpasswd:ro \
  -v /home/DonAssistec/nginx-ssl.crt:/home/DonAssistec/nginx-ssl.crt:ro \
  -v /home/DonAssistec/nginx-ssl.key:/home/DonAssistec/nginx-ssl.key:ro \
  --network host \
  nginx:alpine
```

### Backend não conecta ao MySQL

1. Verifique se o MySQL está rodando: `docker-compose ps mysql`
2. Verifique as variáveis de ambiente no `.env`
3. Verifique os logs: `docker-compose logs backend`

### Frontend não carrega

1. Verifique se o build foi bem-sucedido
2. Verifique os logs: `docker-compose logs frontend`
3. Verifique se a variável `VITE_API_URL` está correta

### Porta já em uso

Se alguma porta estiver em uso, altere no `.env`:
- `MYSQL_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `PHPMYADMIN_PORT`

### Rebuild necessário após mudanças no código

**Docker:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**VPS com PM2:** após alterar o backend, recompile e reinicie:
```bash
cd backend && npm run build
pm2 restart donassistec-backend
```

## 🔄 Atualizações

### Atualizar código

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Rodar migrations (quando houver novas)

Após atualizar o código, se houver novas migrations em `backend/database/migrations/`, execute-as. Ex.: pré-pedidos (23 e 24):

```bash
cd backend
npm run migrate:pre-pedidos         # 23: tabela pre_pedidos
npm run migrate:pre-pedidos-contact # 24: campos de contato
npm run migrate:pre-pedidos-need-by # 25: need_by
npm run migrate:pre-pedidos-numero  # 26: numero (PRE-0001)
npm run migrate:orders-numero      # 27: numero, pre_pedido_id em orders
npm run migrate:order-items        # 28: order_items (se não existir)
```

**VPS com PM2** (backend fora do Docker): use o mesmo `backend/.env` e rode os scripts acima antes de `pm2 restart donassistec-backend`.

### Atualizar dependências

```bash
# Backend
cd backend
npm update
cd ..

# Frontend
npm update

# Rebuild
docker-compose build
docker-compose up -d
```

## 📝 Comandos Úteis

```bash
# Entrar no container do backend
docker exec -it donassistec_backend sh

# Entrar no container do frontend
docker exec -it donassistec_frontend sh

# Ver uso de recursos
docker stats

# Limpar containers parados
docker system prune

# Limpar tudo (⚠️ CUIDADO)
docker system prune -a --volumes
```

## 📚 Estrutura de Arquivos

```
DonAssistec/
├── backend/           # API Node.js/Express
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── src/              # Frontend React/Vite
├── database/         # Scripts SQL
├── docker-compose.yml
├── Dockerfile        # Frontend
├── nginx.conf
└── .env.example
```

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose logs`
2. Verifique a saúde dos containers: `docker-compose ps`
3. Verifique as variáveis de ambiente no `.env`
4. Consulte a documentação do Docker e Docker Compose

---

**Última atualização**: Fevereiro 2026
