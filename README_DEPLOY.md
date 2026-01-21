# 🚀 Guia Rápido de Deploy - DonAssistec

## ⚡ Início Rápido

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd DonAssistec

# 2. Inicie todos os serviços
docker-compose up -d

# 3. Acesse a aplicação
# Frontend: http://localhost:8200
# Backend: http://localhost:3001
# phpMyAdmin: http://localhost:8081
```

## 📦 Serviços

- **MySQL** (porta 3307) - Banco de dados
- **phpMyAdmin** (porta 8081) - Interface web do MySQL
- **Backend API** (porta 3001) - API Node.js/Express
- **Frontend** (porta 8200) - Aplicação React/Vite

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild após mudanças
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver status
docker-compose ps
```

## 📚 Documentação Completa

Veja o arquivo `DEPLOY.md` para documentação detalhada sobre:
- Configuração de variáveis de ambiente
- Segurança em produção
- Backup e restore do banco de dados
- Troubleshooting
- E muito mais!
