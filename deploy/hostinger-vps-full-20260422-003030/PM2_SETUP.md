# 🚀 Configuração PM2 - DonAssistec

## 📋 Status

O DonAssistec está configurado para rodar localmente via PM2:

- **Backend**: `donassistec-backend` (porta 3001)
- **Frontend**: `donassistec-frontend` (porta 8200) — em **produção** roda `serve -s dist -l 8200` (build estático), não Vite dev
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
- `CORS_ORIGIN`: Em produção com domínio, use `https://donassistec.com.br` (ou `http://` se sem SSL)

**Frontend** (`donassistec-frontend`):
- `PORT`: 8200
- Em produção o ecosystem usa `npm run start:prod` (`serve -s dist -l 8200`). Não usa Vite dev (evita ENOSPC por file watchers).
- O frontend detecta `donassistec.com.br` e `177.67.32.204` e usa `/api` no mesmo host quando atrás de Nginx.

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
# 1. Rebuild do backend (obrigatório se alterou rotas/controllers/models)
cd backend
npm run build
pm2 restart donassistec-backend

# 2. Rebuild do frontend (obrigatório se alterou o código do frontend)
cd ..
npm run build
pm2 restart donassistec-frontend
```

**Importante:** após adicionar ou alterar rotas no backend (ex.: `/api/settings/public`), sempre rode `npm run build` na pasta `backend` e `pm2 restart donassistec-backend`.

### Migrations

Se houver **novas migrations**, execute-as **antes** do restart:

```bash
cd backend
npm run migrate:pre-pedidos         # 23: tabela pre_pedidos
npm run migrate:pre-pedidos-contact # 24: campos de contato
npm run migrate:pre-pedidos-need-by # 25: need_by
npm run migrate:pre-pedidos-numero  # 26: numero (PRE-0001)
npm run migrate:orders-numero      # 27: numero, pre_pedido_id em orders
npm run migrate:order-items        # 28: order_items (se não existir)
npm run build
pm2 restart donassistec-backend
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

- **Frontend**: http://localhost:8200 (ou via Nginx na porta 80: http://donassistec.com.br)
- **Backend API**: http://localhost:3001 (ou via Nginx: http://donassistec.com.br/api)
- **Health Check**: http://localhost:3001/health
- **phpMyAdmin**: http://localhost:8081

Com **Nginx** na frente (`nginx-vps.conf`), o acesso externo é pela porta 80; Nginx faz proxy de `/` para :8200 e de `/api`, `/uploads`, `/health` para :3001.

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

### ENOSPC: "System limit for number of file watchers reached"

Se o **frontend** (Vite em modo dev) crashar com `ENOSPC` ao observar arquivos, o limite de inotify do Linux foi atingido. Em produção o DonAssistec usa `serve` (build estático), que **não** usa file watchers.

Se em outro ambiente você rodar `npm run dev` (Vite) e tiver esse erro:

```bash
# Aumentar limite de file watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
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

**Última atualização**: Janeiro 2026
