# Guia de Contribuição - DonAssistec

Obrigado por considerar contribuir para o DonAssistec! 🎉

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits](#commits)
- [Pull Requests](#pull-requests)
- [Testes](#testes)

## 📜 Código de Conduta

Este projeto segue o [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Ao participar, você concorda em manter este código.

## 🤝 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já foi reportado
2. Abra uma issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Screenshots (se aplicável)
   - Ambiente (OS, versão Node, etc)

### Sugerir Funcionalidades

1. Verifique se já existe uma issue similar
2. Abra uma issue com:
   - Descrição clara da funcionalidade
   - Casos de uso
   - Mockups/wireframes (se aplicável)

### Contribuir com Código

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Faça suas mudanças
4. Siga os padrões de código
5. Adicione testes (se aplicável)
6. Commit suas mudanças
7. Push para sua branch (`git push origin feature/AmazingFeature`)
8. Abra um Pull Request

## 🔄 Processo de Desenvolvimento

### Estrutura de Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `docs/*` - Documentação
- `refactor/*` - Refatorações

### Workflow

```bash
# 1. Atualizar fork
git fetch upstream
git checkout main
git merge upstream/main

# 2. Criar branch
git checkout -b feature/nova-funcionalidade

# 3. Desenvolver
# ... fazer mudanças ...

# 4. Commit
git add .
git commit -m "feat: Adicionar nova funcionalidade"

# 5. Push
git push origin feature/nova-funcionalidade

# 6. Criar Pull Request no GitHub
```

## 📝 Padrões de Código

### TypeScript

- Use TypeScript estrito
- Defina tipos explícitos
- Evite `any` quando possível
- Use interfaces para objetos complexos

### React

- Use componentes funcionais
- Use hooks para lógica reutilizável
- Mantenha componentes pequenos e focados
- Use `useCallback` e `useMemo` quando apropriado

### Estilo de Código

```typescript
// ✅ BOM
interface User {
  id: string;
  name: string;
  email: string;
}

const getUserById = async (id: string): Promise<User | null> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
};

// ❌ EVITAR
const getUserById = async (id: any) => {
  const response = await api.get('/users/' + id);
  return response.data;
};
```

### Nomenclatura

- **Componentes**: PascalCase (`UserProfile.tsx`)
- **Funções**: camelCase (`getUserById`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários

### Estrutura de Arquivos

```
src/
├── components/       # Componentes React
│   ├── ui/          # Componentes UI base
│   └── admin/       # Componentes específicos
├── pages/           # Páginas da aplicação
├── services/        # Serviços de API
├── hooks/           # Custom hooks
├── contexts/        # Contextos React
├── types/           # Definições de tipos
└── utils/           # Funções utilitárias
```

## 💬 Commits

Use mensagens descritivas seguindo [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula faltando, etc
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adicionar ou corrigir testes
- `chore`: Tarefas de manutenção

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(auth): Adicionar login com Google"

# Correção
git commit -m "fix(upload): Corrigir erro de CORS"

# Documentação
git commit -m "docs: Atualizar guia de instalação"

# Refatoração
git commit -m "refactor(api): Otimizar queries do banco"
```

## 🔍 Pull Requests

### Checklist Antes de Abrir PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (se existirem)
- [ ] Documentação atualizada (se necessário)
- [ ] Sem erros de lint
- [ ] Build funciona corretamente
- [ ] Mudanças testadas manualmente

### Template de PR

```markdown
## Descrição
Descrição clara das mudanças.

## Tipo de Mudança
- [ ] Nova funcionalidade
- [ ] Correção de bug
- [ ] Refatoração
- [ ] Documentação

## Como Testar
Passos para testar as mudanças.

## Screenshots (se aplicável)

## Checklist
- [ ] Código revisado
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
```

## 🧪 Testes

### Estrutura de Testes

```
src/
└── test/
    ├── components/
    ├── services/
    └── utils/
```

### Executar Testes

```bash
# Frontend
npm test

# Backend
cd backend
npm test
```

## 📚 Recursos Adicionais

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## ❓ Dúvidas?

Abra uma issue ou entre em contato:
- Email: suporte@donassistec.com.br

---

Obrigado por contribuir! 🚀
