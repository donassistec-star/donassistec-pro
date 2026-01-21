# Banco de Dados DonAssistec

Este diretório contém os scripts SQL e configurações para o banco de dados MySQL do projeto DonAssistec.

## Estrutura

- `init/01_schema.sql` - Script de criação das tabelas e estrutura do banco
- `init/02_seed_data.sql` - Script com dados iniciais (marcas, modelos, etc.)
- `.env.example` - Exemplo de configurações de ambiente

## Como Usar

### 1. Iniciar o Docker Compose

```bash
docker-compose up -d
```

Isso irá iniciar:
- **MySQL** na porta `3307` (externa) → `3306` (interna do container)
- **phpMyAdmin** na porta `8081` (externa) → `80` (interna do container)

⚠️ **Importante:** As portas foram configuradas para evitar conflitos com outros projetos MySQL em Docker.

### 2. Acessar o phpMyAdmin

Abra seu navegador e acesse: `http://localhost:8081`

**Credenciais:**
- Usuário: `root`
- Senha: `rootpassword`

Ou use:
- Usuário: `donassistec_user`
- Senha: `donassistec_password`
- Banco: `donassistec_db`

### 3. Estrutura do Banco de Dados

#### Tabelas Principais:

- **brands** - Marcas de celulares (Apple, Samsung, etc.)
- **phone_models** - Modelos de celulares
- **model_services** - Serviços disponíveis para cada modelo
- **model_videos** - Vídeos tutoriais dos modelos
- **service_types** - Tipos de serviços (Reconstrução, Troca de Vidro, etc.)

### 4. Parar os Containers

```bash
docker-compose down
```

### 5. Remover Volumes (limpar dados)

```bash
docker-compose down -v
```

## Scripts SQL

Os scripts SQL são executados automaticamente na primeira inicialização do container MySQL. Eles estão na pasta `init/` e são executados em ordem alfabética.

## Backup e Restore

### Backup:
```bash
docker exec donassistec_mysql mysqldump -u root -prootpassword donassistec_db > backup.sql
```

### Restore:
```bash
docker exec -i donassistec_mysql mysql -u root -prootpassword donassistec_db < backup.sql
```
