# 📋 Guia do Administrador - DonAssistec

Este guia fornece instruções completas para usar a área administrativa do sistema DonAssistec.

## 🔐 Acesso ao Sistema

### URL de Acesso
- **Local**: `http://localhost:8200/admin/login`
- **Produção**: `http://177.67.32.204:8200/admin/login`

### Credenciais Padrão
- **Email**: `admin@donassistec.com`
- **Senha**: `admin123`

### Criar Novo Usuário Admin
```bash
cd /home/DonAssistec/backend
node scripts/create-admin-user.js
```

## 📊 Páginas Administrativas

### 1. Dashboard (`/admin/dashboard`)
Visão geral do sistema com estatísticas em tempo real:
- Total de pedidos
- Pedidos pendentes
- Pedidos concluídos
- Total de lojistas cadastrados
- Ações rápidas para navegação

### 2. Conteúdo da Home (`/admin/home-content`)
Gerencie os textos principais da página inicial:
- Seção Hero (título, subtítulo, CTA)
- Seção Features (recursos/destaques)
- Seção Stats (estatísticas)
- Seção Process (processo/serviço)

### 3. Modelos (`/admin/modelos`)
CRUD completo de modelos de celulares:
- **Listar**: Visualize todos os modelos com busca e filtros
- **Criar**: Adicione novos modelos com todas as informações
- **Editar**: Atualize informações de modelos existentes
- **Excluir**: Remova modelos (com confirmação)
- **Vídeos**: Gerencie vídeos associados a cada modelo

**Campos de um Modelo:**
- Nome do modelo
- Marca
- Disponibilidade (em estoque, sob encomenda, sem estoque)
- Preço (ou orçamento sob consulta)
- Serviços disponíveis:
  - Reconstrução
  - Troca de vidro
  - Peças disponíveis
- Imagem do produto
- Descrição

### 4. Marcas (`/admin/marcas`)
Gerencie as marcas de celulares:
- **Listar**: Visualize todas as marcas
- **Criar**: Adicione novas marcas
- **Editar**: Atualize informações de marcas
- **Excluir**: Remova marcas (com confirmação)

**Campos de uma Marca:**
- Nome da marca
- Logo/Imagem
- Descrição

### 5. Pedidos (`/admin/pedidos`)
Visualize e gerencie todos os pedidos do sistema:
- **Listar**: Veja todos os pedidos com busca e filtros
- **Detalhes**: Visualize informações completas de cada pedido
- **Status**: Atualize o status dos pedidos:
  - Pendente
  - Processando
  - Concluído
  - Cancelado

**Informações de um Pedido:**
- ID do pedido
- Lojista que fez o pedido
- Itens do pedido (modelos, quantidades, serviços)
- Valor total
- Status
- Data de criação
- Observações

### 5.1. Pré-pedidos (`/admin/pre-pedidos`)
Registros de pré-pedidos enviados pelo fluxo "Finalizar e enviar pré-pedido" no pré-orçamento:
- **Listar**: pré-pedidos com data, contato, itens
- **Dados de contato**: nome, empresa, telefone, e-mail, observações (quando preenchidos)
- **Urgente**: badge para pedidos marcados como urgentes
- **Busca**: por ID, sessão, nome, empresa ou e-mail
- **Exportar CSV**: Contato, Empresa, Telefone, E-mail, Urgente, Observações, itens
- **Expandir**: ver itens e serviços de cada pré-pedido

### 6. Lojistas (`/admin/lojistas`)
Gerencie contas de lojistas:
- **Listar**: Visualize todos os lojistas (ativos/inativos)
- **Ativar/Desativar**: Controle o acesso dos lojistas
- **Excluir**: Remova contas de lojistas (com confirmação)
- **Busca**: Encontre lojistas por nome, email ou empresa

**Proteções:**
- Administradores não podem desativar/excluir a si mesmos

### 7. Relatórios (`/admin/relatorios`)
Estatísticas e análises do sistema:
- Estatísticas gerais (pedidos, lojistas, modelos, marcas)
- Receita total e ticket médio
- Pedidos por status
- Top 5 marcas mais populares
- Saúde do sistema (taxa de conversão, conclusão, etc.)
- **Exportação**: Baixe relatórios em formato texto (.txt)

### 8. Configurações (`/admin/configuracoes`)
Configure o sistema:
- **Configurações Gerais**:
  - Nome do site
  - Descrição do site
  - URL do site
- **Informações de Contato**:
  - Email de suporte
  - Telefone de suporte
- **Configurações do Sistema**:
  - Modo de manutenção
  - Permitir cadastro de lojistas
  - Máximo de pedidos por dia
- **Notificações**:
  - Notificações por email
  - Notificações por SMS

## 🔒 Segurança

### Rotas Protegidas
Todas as rotas administrativas são protegidas:
- Requer autenticação (JWT)
- Requer role `admin`
- Acesso negado para usuários `retailer`

### Middlewares de Segurança
- **Backend**: `requireAdmin` - Verifica autenticação e role
- **Frontend**: `ProtectedRouteAdmin` - Redireciona se não for admin

### Boas Práticas
- Use senhas fortes
- Não compartilhe credenciais
- Faça logout após uso
- Mantenha o sistema atualizado

## 📝 Funcionalidades Principais

### Busca e Filtros
A maioria das páginas possui:
- **Busca**: Por ID, nome, email, etc.
- **Filtros**: Por status, marca, disponibilidade, etc.
- **Paginação**: Para grandes volumes de dados

### Confirmações
Operações destrutivas (excluir) requerem confirmação:
- Diálogo de confirmação
- Não pode ser desfeito
- Mostra o que será deletado

### Feedback Visual
- **Loading**: Spinners durante carregamento
- **Toasts**: Notificações de sucesso/erro
- **Empty States**: Mensagens quando não há dados
- **Error Boundaries**: Tratamento de erros inesperados

## 🚀 Melhores Práticas

### Gerenciamento de Modelos
1. Mantenha informações atualizadas
2. Adicione imagens de qualidade
3. Preencha todos os campos relevantes
4. Associe vídeos quando possível

### Gerenciamento de Pedidos
1. Atualize status regularmente
2. Verifique informações antes de marcar como concluído
3. Use observações para comunicação importante

### Gerenciamento de Lojistas
1. Verifique informações antes de ativar/desativar
2. Comunique mudanças importantes aos lojistas
3. Mantenha registros de ações administrativas

### Configurações
1. Teste mudanças em ambiente de desenvolvimento primeiro
2. Mantenha backups das configurações
3. Documente mudanças importantes

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do sistema
2. Consulte a documentação técnica
3. Entre em contato com o suporte técnico

## 🔄 Atualizações do Sistema

### Verificar Status
```bash
pm2 status
```

### Reiniciar Serviços
```bash
# Backend
pm2 restart donassistec-backend

# Frontend
pm2 restart donassistec-frontend
```

### Ver Logs
```bash
# Backend
pm2 logs donassistec-backend

# Frontend
pm2 logs donassistec-frontend
```

## 📚 Recursos Adicionais

- **API Documentation**: Ver `/backend/README.md`
- **Frontend Documentation**: Ver `/README.md`
- **Database Schema**: Ver `/backend/database/migrations/`

---

**Última atualização**: Janeiro 2026
**Versão do Sistema**: 1.2.0
