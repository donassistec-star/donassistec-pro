# Setup do Banco de Dados DonAssistec

## 🚀 Início Rápido

### 1. Iniciar os Containers Docker

```bash
docker-compose up -d
```

Este comando irá:
- ✅ Criar e iniciar o container MySQL
- ✅ Criar e iniciar o container phpMyAdmin
- ✅ Executar automaticamente os scripts SQL de inicialização
- ✅ Popular o banco com dados iniciais

### 2. Acessar o phpMyAdmin

Após iniciar os containers, acesse:

**URL:** http://localhost:8081

⚠️ **Nota:** A porta 8081 foi escolhida para evitar conflitos com outros projetos que possam usar a porta 8080.

**Credenciais padrão:**
- **Usuário:** `root`
- **Senha:** `rootpassword`

Ou use a conta do usuário:
- **Usuário:** `donassistec_user`
- **Senha:** `donassistec_password`
- **Banco:** `donassistec_db`

### 3. Verificar Status dos Containers

```bash
docker-compose ps
```

### 4. Ver Logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do MySQL
docker-compose logs -f mysql

# Ver logs apenas do phpMyAdmin
docker-compose logs -f phpmyadmin
```

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **brands** - Marcas de celulares
   - id, name, logo_url, icon_name

2. **phone_models** - Modelos de celulares
   - id, brand_id, name, image_url, video_url, availability, premium, popular

3. **model_services** - Serviços disponíveis por modelo
   - model_id, reconstruction, glass_replacement, parts_available

4. **model_videos** - Vídeos tutoriais dos modelos
   - id, model_id, title, url, thumbnail_url, duration

5. **service_types** - Tipos de serviços
   - id, name, icon, description

## 🔧 Comandos Úteis

### Parar os Containers

```bash
docker-compose stop
```

### Iniciar Containers Parados

```bash
docker-compose start
```

### Parar e Remover Containers

```bash
docker-compose down
```

### Parar, Remover e Apagar Dados (⚠️ CUIDADO!)

```bash
docker-compose down -v
```

### Reiniciar os Containers

```bash
docker-compose restart
```

### Acessar o MySQL via Terminal

```bash
docker exec -it donassistec_mysql mysql -u root -prootpassword donassistec_db
```

### Fazer Backup do Banco

```bash
docker exec donassistec_mysql mysqldump -u root -prootpassword donassistec_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar Backup

```bash
docker exec -i donassistec_mysql mysql -u root -prootpassword donassistec_db < backup.sql
```

## 📝 Configurações

### Portas

⚠️ **ATENÇÃO:** Portas configuradas para evitar conflitos com outros projetos MySQL!

- **MySQL:** `3307` (porta externa) → `3306` (porta interna do container)
- **phpMyAdmin:** `8081` (porta externa) → `80` (porta interna do container)

**URL do phpMyAdmin:** http://localhost:8081

### Credenciais

#### MySQL Root
- **Usuário:** `root`
- **Senha:** `rootpassword`

#### MySQL Usuário Aplicação
- **Usuário:** `donassistec_user`
- **Senha:** `donassistec_password`
- **Banco:** `donassistec_db`

### Alterar Credenciais

Para alterar as credenciais, edite o arquivo `docker-compose.yml` e modifique as variáveis de ambiente:

```yaml
environment:
  MYSQL_ROOT_PASSWORD: sua_senha_root
  MYSQL_DATABASE: nome_do_banco
  MYSQL_USER: seu_usuario
  MYSQL_PASSWORD: sua_senha
```

⚠️ **Importante:** Após alterar as credenciais, você precisará recriar os containers:

```bash
docker-compose down -v
docker-compose up -d
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs mysql

# Verificar se a porta está em uso
sudo netstat -tulpn | grep :3307
sudo netstat -tulpn | grep :8081

# Verificar containers em execução
docker ps -a | grep donassistec
```

### Resetar o banco de dados

```bash
# Parar e remover tudo
docker-compose down -v

# Recriar os containers
docker-compose up -d
```

### Verificar se o MySQL está funcionando

```bash
docker exec donassistec_mysql mysqladmin -u root -prootpassword ping
```

## 📚 Próximos Passos

1. **Conectar o Frontend ao Banco de Dados**
   - Criar API backend (Node.js/Express ou similar)
   - Substituir dados estáticos por chamadas à API

2. **Gerenciar Dados via phpMyAdmin**
   - Adicionar novos modelos
   - Editar informações existentes
   - Gerenciar vídeos e serviços

3. **Implementar CRUD via API**
   - Endpoints para criar, ler, atualizar e deletar modelos
   - Autenticação para área do lojista

## 🔒 Segurança

⚠️ **ATENÇÃO:** As credenciais padrão são para desenvolvimento apenas!

Para produção:
- Altere todas as senhas
- Use variáveis de ambiente
- Configure firewall
- Use SSL/TLS para conexões
- Restrinja acesso ao phpMyAdmin
