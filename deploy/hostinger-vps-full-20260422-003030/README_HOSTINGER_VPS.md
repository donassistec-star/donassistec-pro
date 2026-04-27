# Pacote VPS Hostinger - DonAssistec

Este pacote foi preparado para subir o **frontend + backend** do DonAssistec em uma **VPS da Hostinger**.

## O que vai no pacote

- frontend completo (`src`, `public`, `dist`, configs e `package*.json`)
- backend completo (`backend/src`, `backend/dist`, `backend/uploads`, configs e `package*.json`)
- banco inicial (`database/init`)
- configs de produção:
  - `nginx-vps.conf`
  - `nginx-vps-ssl.conf.example`
  - `ecosystem.hostinger-vps.config.cjs`
- documentação de apoio:
  - `DEPLOY.md`
  - `README.md`
  - `docs/VERIFICAR-SERVIDOR.md`
  - `TESTE-API-ACESSO.md`

## O que nao vai

- `node_modules`
- `.git`
- arquivos `.env`
- logs locais
- artefatos antigos de `deploy/`

## Fluxo sugerido na VPS

1. Extraia o ZIP em uma pasta como `/home/DonAssistec`.
2. Crie os arquivos `.env` a partir dos exemplos:
   - `.env.example` -> `.env`
   - `backend/.env.example` -> `backend/.env`
3. Instale dependencias:
   - `npm install`
   - `cd backend && npm install`
4. Gere os builds novamente no servidor por seguranca:
   - `npm run build`
   - `cd backend && npm run build`
5. Suba com PM2:
   - `pm2 start ecosystem.hostinger-vps.config.cjs`
6. Configure o Nginx com `nginx-vps.conf`.

## Observacoes

- O pacote inclui `backend/uploads` para preservar imagens e videos ja enviados ao sistema.
- Revise `JWT_SECRET`, CORS, portas e credenciais do banco antes de publicar.
- Se o projeto for extraido em outro caminho, a config `ecosystem.hostinger-vps.config.cjs` continua funcionando porque usa caminhos relativos.
