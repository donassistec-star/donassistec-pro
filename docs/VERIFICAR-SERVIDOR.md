# Verificar por que donassistec.com.br não abre (ERR_CONNECTION_REFUSED)

Quando o navegador mostra **"A conexão com donassistec.com.br foi recusada"** (ERR_CONNECTION_REFUSED), algo na **VPS/servidor** ou na **rede** está impedindo o acesso.

## Caso real registrado

Em **2026-04-28**, o domínio `https://donassistec.com.br` ficou indisponível com `ERR_CONNECTION_REFUSED` porque o serviço **nginx** estava **`inactive (dead)`** no servidor.

Diagnóstico confirmado:

```bash
sudo systemctl status nginx
```

Saída observada:

- `Active: inactive (dead)`

Correção aplicada:

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl status nginx --no-pager
curl -k -I https://127.0.0.1
curl -k https://127.0.0.1/health
```

Resultado esperado após a correção:

- `nginx -t` sem erros
- `systemctl status nginx` com `active (running)`
- `https://127.0.0.1` respondendo `200`
- `https://127.0.0.1/health` respondendo `200`

## Checklist no servidor (SSH)

Conecte por SSH no servidor (ex.: `177.67.32.204` ou o IP onde donassistec.com.br aponta) e confira:

---

### 1. Nginx está rodando?

```bash
sudo systemctl status nginx
```

- Se estiver **inativo (inactive)**:
  ```bash
  sudo nginx -t
  sudo systemctl start nginx
  sudo systemctl enable nginx
  ```
- Se o site usa HTTPS, valide também com:
  ```bash
  curl -k -I https://127.0.0.1
  curl -k https://127.0.0.1/health
  ```

---

### 2. Algo está escutando na porta 80?

```bash
sudo ss -tlnp | grep :80
# ou
sudo netstat -tlnp | grep :80
```

- Deve aparecer `nginx` ou semelhante na porta 80. Se não aparecer, o nginx pode não ter iniciado ou a config está com erro.

---

### 3. Config do Nginx para donassistec

O projeto tem `nginx-vps.conf`. No servidor:

```bash
# Copiar e ativar
sudo cp /caminho/do/projeto/nginx-vps.conf /etc/nginx/sites-available/donassistec
sudo ln -sf /etc/nginx/sites-available/donassistec /etc/nginx/sites-enabled/

# Remover default se conflitar
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e recarregar
sudo nginx -t && sudo systemctl reload nginx
```

Se `nginx -t` der erro, corrija o arquivo em `sites-available/donassistec`.

---

### 4. Firewall (UFW) liberando 80 e 443

```bash
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

---

### 5. Frontend (porta 8200) está rodando?

O `nginx-vps.conf` faz proxy de `/` para `http://127.0.0.1:8200`:

```bash
ss -tlnp | grep 8200
# ou
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8200/
```

- Se **nada** escuta em 8200: é preciso subir o frontend (Vite na 8200 ou um serve da pasta `dist` na 8200).
- Exemplo com o build estático:
  ```bash
  cd /caminho/do/projeto
  npm run build
  npx serve -s dist -l 8200
  ```
  Para produção, use `pm2` ou systemd para manter o `serve` (ou o comando que você usa) sempre ativo.

---

### 6. Backend (porta 3001) está rodando?

A API e `/api` vão para `http://127.0.0.1:3001`:

```bash
ss -tlnp | grep 3001
curl -s http://127.0.0.1:3001/health
```

- Se não houver processo em 3001 ou `/health` falhar: subir o backend (ex.: `node dist/index.js` ou `npm run start`) e, em produção, mantê-lo com `pm2` ou systemd.

---

### 7. DNS de donassistec.com.br

No seu micro ou em outro computador:

```bash
nslookup donassistec.com.br
# ou
dig donassistec.com.br +short
```

- O IP deve ser o da sua VPS (ex.: `177.67.32.204`). Se for outro ou não resolver, ajuste o DNS no painel do domínio.

---

### 8. Resumo do que precisa estar de pé

| Serviço     | Porta | Comando / Verificação                          |
|------------|-------|-------------------------------------------------|
| Nginx      | 80    | `systemctl status nginx`                        |
| Frontend   | 8200  | `serve -s dist -l 8200` ou Vite dev            |
| Backend    | 3001  | `node backend/dist/index.js` ou `npm run start` |

O Nginx recebe na 80 e manda:
- `/` → `127.0.0.1:8200`
- `/api`, `/health`, `/uploads` → `127.0.0.1:3001`

---

### 9. Se usar Docker

Se o deploy for com `docker-compose` (como em `DEPLOY.md`), as portas 8200 e 3001 ficam expostas pelos containers. Confira:

```bash
docker-compose ps
docker-compose logs -f
```

E no `nginx-vps.conf` o `proxy_pass` deve apontar para os IPs/portas que o Docker expõe (ex.: `127.0.0.1:8200` e `127.0.0.1:3001` se mapeadas no host).

---

## Ordem prática de verificação

1. `systemctl status nginx` → ativo e `nginx -t` sem erro  
2. `ss -tlnp | grep -E ':80|:8200|:3001'` → 80, 8200 e 3001 em uso  
3. `curl -s http://127.0.0.1:8200/` e `curl -s http://127.0.0.1:3001/health` → ambos respondendo  
4. `ufw` → portas 80 e 443 liberadas  
5. DNS de donassistec.com.br apontando para o IP da VPS  

Se o domínio usa SSL, acrescente antes do teste no navegador:

6. `curl -k -I https://127.0.0.1` e `curl -k https://127.0.0.1/health` → HTTPS local respondendo

Quando isso estiver certo, **http://donassistec.com.br/admin/login** deve abrir (a menos que haja bloqueio de rede no seu provedor ou empresa).
