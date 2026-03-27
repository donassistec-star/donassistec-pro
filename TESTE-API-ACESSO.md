# Teste de acesso à API – nginx, firewall, HTTP/HTTPS

## O que foi verificado

| Teste | Resultado | Observação |
|-------|-----------|------------|
| Backend :3001 `/health` | OK 200 | API e MySQL respondem |
| Backend :3001 `POST /api/auth/login` | OK 401 | Rota de auth existe (401 = credenciais inválidas) |
| Nginx :80 `/api` (HTTP) | OK | Proxy para :3001 funcionando |
| **HTTPS :443** | **Falha** | Nada ouvindo em 443; nginx sem SSL |

- **`curl -s "https://donassistec.com.br/api/..."`**  
  - Resposta vazia e **exit 7** = “Failed to connect” em 443 (porta fechada / sem SSL).

- **`curl "http://donassistec.com.br/api/auth/login"`** (HTTP, porta 80)  
  - Funciona: nginx repassa para o backend em :3001.

---

## Comandos para repetir os testes

No servidor:

```bash
# Backend direto
curl -s "http://127.0.0.1:3001/health"
curl -s -X POST "http://127.0.0.1:3001/api/auth/login" -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'

# Via nginx (HTTP)
curl -s -X POST "http://donassistec.com.br/api/auth/login" -H "Content-Type: application/json" -d '{"email":"x","password":"y"}'

# HTTPS (vai falhar enquanto não houver SSL)
curl -sI "https://donassistec.com.br/api/auth/bootstrap-available"
```

Ou use o script:

```bash
./scripts/testar-api-acesso.sh
```

---

## Nginx

- **Config ativa:** `/etc/nginx/sites-available/donassistec` (equivalente ao `nginx-vps.conf` do projeto).
- **Porta 80:** ativa; `/api` e `/uploads` fazem proxy para `127.0.0.1:3001`; `/` para `:8200`.
- **Porta 443:** não configurada → **HTTPS não funciona**.

Para habilitar HTTPS:

1. Gerar certificado (Let’s Encrypt):

   ```bash
   sudo certbot certonly --webroot -w /var/www/html -d donassistec.com.br -d www.donassistec.com.br
   ```

   Ou, se o certbot configurar o nginx:

   ```bash
   sudo certbot --nginx -d donassistec.com.br -d www.donassistec.com.br
   ```

2. Incluir o bloco `listen 443 ssl` no site (ex.: usar o exemplo em `nginx-vps-ssl.conf.example`).
3. Testar e recarregar:

   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## Firewall

- **`ufw`:** inativo.
- **`iptables`:** regras genéricas (não bloqueando 80/443 de forma óbvia).
- **Provedor/cloud:** se existir firewall no painel (ex.: Security Groups, regras de rede), liberar **80** e **443** para o IP do servidor.

Comandos úteis:

```bash
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable   # só se for usar ufw
sudo ufw reload
```

---

## 404 em `/api/auth/bootstrap-available`

Se `/api/auth/login` retorna 401 mas `/api/auth/bootstrap-available` retorna 404, o processo do backend em execução pode estar com código antigo (sem essa rota).

- Rebuild e reinício:

  ```bash
  cd /home/DonAssistec/backend
  npm run build   # ou o comando de build do projeto
  pm2 restart all # ou systemctl restart donassistec-api, conforme o uso
  ```

---

## Resumo

| Item | Ação |
|------|------|
| HTTP (80) | OK com a configuração atual do nginx. |
| HTTPS (443) | Adicionar `listen 443 ssl` e certificados; ver `nginx-vps-ssl.conf.example`. |
| Firewall | Garantir 80 e 443 abertos (ufw e/ou painel do provedor). |
| 404 em bootstrap | Reiniciar o backend depois do deploy. |
