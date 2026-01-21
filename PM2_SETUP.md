# 🚀 Configuração PM2 - DonAssistec

## 📋 Status

O DonAssistec está configurado para rodar localmente via PM2:

- **Backend**: `donassistec-backend` (porta 3001)
- **Frontend**: `donassistec-frontend` (porta 8200)
- **MySQL**: Docker container (porta 3307)
- **phpMyAdmin**: Docker container (porta 8081)

## 🎯 Comandos PM2

### Gerenciar processos

```bash
# Ver status
pm2 list

# Ver logs em tempo real
pm2 logs donassistec-backend
pm2 logs donassistec-frontend
pm2 logs  # Todos os processos

# Parar processos
pm2 stop donassistec-backend
pm2 stop donassistec-frontend
pm2 stop all

# Reiniciar processos
pm2 restart donassistec-backend
pm2 restart donassistec-frontend
pm2 restart all

# Recarregar (zero-downtime)
pm2 reload donassistec-backend

# Deletar processos
pm2 delete donassistec-backend
pm2 delete donassistec-frontend
```

### Informações detalhadas

```bash
# Informações do processo
pm2 show donassistec-backend
pm2 show donassistec-frontend

# Monitoramento em tempo real
pm2 monit

# Informações gerais
pm2 info
```

### Logs

```bash
# Ver últimas linhas
pm2 logs donassistec-backend --lines 50

# Limpar logs
pm2 flush

# Ver logs sem streaming
pm2 logs donassistec-backend --nostream --lines 100
```

### Persistência

```bash
# Salvar configuração atual
pm2 save

# Restaurar processos salvos
pm2 resurrect

# Configurar PM2 para iniciar no boot do sistema
pm2 startup
# (siga as instruções mostradas)
```

## 🔧 Configuração

O arquivo `ecosystem.config.cjs` contém a configuração completa dos processos PM2.

### Variáveis de Ambiente

**Backend** (`donassistec-backend`):
- `DB_HOST`: localhost (MySQL no Docker)
- `DB_PORT`: 3307
- `PORT`: 3001
- `JWT_SECRET`: Configure em produção!

**Frontend** (`donassistec-frontend`):
- `PORT`: 8200
- `VITE_API_URL`: http://localhost:3001/api

## 📊 Estrutura de Logs

Os logs são salvos em `./logs/`:
- `backend-error.log` - Erros do backend
- `backend-out.log` - Output do backend
- `backend-combined.log` - Log combinado do backend
- `frontend-error.log` - Erros do frontend
- `frontend-out.log` - Output do frontend
- `frontend-combined.log` - Log combinado do frontend

## 🔄 Reiniciar após mudanças no código

```bash
# 1. Rebuild do backend (se necessário)
cd backend
npm run build

# 2. Rebuild do frontend (se necessário)
cd ..
npm run build

# 3. Reiniciar processos
pm2 restart donassistec-backend
pm2 restart donassistec-frontend
```

## 🐳 Docker (MySQL e phpMyAdmin)

```bash
# Iniciar MySQL e phpMyAdmin
docker-compose up -d

# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## 🌐 Acessos

- **Frontend**: http://localhost:8200
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **phpMyAdmin**: http://localhost:8081

## ⚠️ Troubleshooting

### Processo não inicia

```bash
# Ver logs de erro
pm2 logs donassistec-backend --err --lines 50

# Verificar se porta está em uso
sudo lsof -i :3001  # Backend
sudo lsof -i :8200  # Frontend
```

### Processo reiniciando constantemente

```bash
# Ver logs detalhados
pm2 logs donassistec-backend --lines 100

# Verificar uso de memória
pm2 monit
```

### MySQL não conecta

```bash
# Verificar se MySQL está rodando
docker-compose ps mysql

# Ver logs do MySQL
docker-compose logs mysql

# Verificar conectividade
docker exec -it donassistec_mysql mysql -u donassistec_user -p
```

---

**Última atualização**: Janeiro 2025
