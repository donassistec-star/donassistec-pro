# 🔧 Configuração do Banco de Dados DonAssistec

## ⚠️ IMPORTANTE - Conflitos de Portas

Este projeto foi configurado para **não conflitar** com outros projetos MySQL em Docker que você possa ter.

### 📊 Portas Utilizadas

| Serviço | Porta Externa | Porta Interna | Status |
|---------|---------------|---------------|--------|
| **MySQL** | `127.0.0.1:3307` | `3306` | ✅ Disponível |
| **phpMyAdmin** | `127.0.0.1:8081` | `80` | ✅ Disponível |

### 🔍 Verificação de Conflitos

Antes de iniciar, verifique se as portas estão disponíveis:

```bash
# Verificar porta MySQL (3307)
netstat -tuln | grep :3307

# Verificar porta phpMyAdmin (8081)
netstat -tuln | grep :8081

# Verificar containers Docker
docker ps | grep -E "(mysql|phpmyadmin)"
```

## 🚀 Como Iniciar

### 1. Iniciar os Containers

```bash
cd /home/DonAssistec
docker-compose up -d
```

### 2. Verificar Status

```bash
docker-compose ps
```

Você deve ver:
- ✅ `donassistec_mysql` - Up
- ✅ `donassistec_phpmyadmin` - Up

### 3. Acessar o phpMyAdmin

**URL local no servidor:** `http://127.0.0.1:8081`

**Credenciais:**
- Usuário: `root`
- Senha: `rootpassword`

**OU** use a conta da aplicação:
- Usuário: `donassistec_user`
- Senha: `donassistec_password`
- Banco: `donassistec_db`

### 4. Acesso externo protegido

O repositório também contém uma configuração opcional em [nginx-phpmyadmin-secure.conf](/home/DonAssistec/nginx-phpmyadmin-secure.conf:1):

- `8083` redireciona para `8443`
- `8443` usa SSL
- há autenticação básica via `nginx-phpmyadmin.htpasswd`
- o proxy encaminha para `http://127.0.0.1:8081`

Observações:

- a porta `8081` continua sendo apenas local
- a senha do Basic Auth não deve ser salva em documentação pública
- para produção, restrinja por IP sempre que possível

## 🔌 Conexão do Banco de Dados

Para conectar de um cliente MySQL ou aplicação:

```
Host: localhost (ou 127.0.0.1)
Porta: 3307
Banco: donassistec_db
Usuário: donassistec_user
Senha: donassistec_password
```

### Exemplo de String de Conexão

**Node.js/JavaScript:**
```javascript
const connection = {
  host: 'localhost',
  port: 3307,
  database: 'donassistec_db',
  user: 'donassistec_user',
  password: 'donassistec_password'
};
```

**PHP:**
```php
$host = 'localhost';
$port = 3307;
$dbname = 'donassistec_db';
$username = 'donassistec_user';
$password = 'donassistec_password';
```

**Python:**
```python
connection = {
    'host': 'localhost',
    'port': 3307,
    'database': 'donassistec_db',
    'user': 'donassistec_user',
    'password': 'donassistec_password'
}
```

## 🛠️ Comandos Úteis

### Acessar MySQL via Terminal

```bash
docker exec -it donassistec_mysql mysql -u root -prootpassword donassistec_db
```

### Ver Logs

```bash
# Logs do MySQL
docker-compose logs -f mysql

# Logs do phpMyAdmin
docker-compose logs -f phpmyadmin

# Todos os logs
docker-compose logs -f
```

### Parar os Containers

```bash
docker-compose stop
```

### Remover Containers (mantém dados)

```bash
docker-compose down
```

### Remover Tudo (inclui dados) ⚠️

```bash
docker-compose down -v
```

## 📦 Estrutura do Banco

### Tabelas Criadas

- ✅ `brands` - Marcas de celulares
- ✅ `phone_models` - Modelos de celulares
- ✅ `model_services` - Serviços por modelo
- ✅ `model_videos` - Vídeos tutoriais
- ✅ `service_types` - Tipos de serviços

### Dados Iniciais

- ✅ 6 marcas cadastradas
- ✅ 30+ modelos de celulares
- ✅ Serviços configurados
- ✅ Vídeos tutoriais de exemplo

## 🔒 Segurança

⚠️ **ATENÇÃO:** As senhas padrão são apenas para desenvolvimento!

Para produção:
- Altere todas as senhas
- Use variáveis de ambiente
- Restrinja acesso ao phpMyAdmin
- Configure firewall

## 🐛 Troubleshooting

### Erro: Porta já em uso

Se você receber erro de porta em uso:

1. Verifique qual processo está usando a porta:
```bash
sudo lsof -i :3307
sudo lsof -i :8081
```

2. Se necessário, altere as portas no `docker-compose.yml`:
```yaml
ports:
  - "3308:3306"  # Altere 3307 para outra porta
  - "8082:80"    # Altere 8081 para outra porta
```

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs mysql

# Verificar configuração
docker-compose config

# Recriar containers
docker-compose down -v
docker-compose up -d
```

### Conectar de outro container

Se você precisar conectar de outro container Docker:

```
Host: donassistec_mysql (nome do serviço)
Porta: 3306 (porta interna)
Banco: donassistec_db
Usuário: donassistec_user
Senha: donassistec_password
```

## ✅ Checklist

Antes de iniciar:
- [ ] Verificar se as portas 3307 e 8081 estão disponíveis
- [ ] Verificar se não há conflito com outros containers MySQL
- [ ] Docker e Docker Compose instalados

Após iniciar:
- [ ] Containers estão rodando (`docker-compose ps`)
- [ ] Consegue acessar phpMyAdmin em http://localhost:8081
- [ ] Banco `donassistec_db` foi criado
- [ ] Tabelas foram criadas
- [ ] Dados iniciais foram inseridos
