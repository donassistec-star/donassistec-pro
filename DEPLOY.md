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
- **phpMyAdmin**: http://localhost:8081

## 🗄️ Banco de Dados

### Acessar via phpMyAdmin

1. Acesse http://localhost:8081
2. Usuário: `root`
3. Senha: (valor de `MYSQL_ROOT_PASSWORD` no `.env`)

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

### 2. Configurar HTTPS

Use um reverse proxy (Nginx/Traefik) com certificados SSL:

```nginx
# Exemplo Nginx
server {
    listen 443 ssl;
    server_name seu-dominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8200;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

### 3. Firewall

- Abra apenas portas necessárias (80, 443)
- Restrinja acesso ao MySQL (porta 3307) apenas internamente
- Restrinja acesso ao phpMyAdmin apenas em desenvolvimento

### 4. Variáveis de Ambiente

Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

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

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔄 Atualizações

### Atualizar código

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

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

**Última atualização**: Janeiro 2025
