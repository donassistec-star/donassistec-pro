# Dockerfile para Backend DonAssistec
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar código compilado do builder
COPY --from=builder /app/dist ./dist

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3001

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "dist/index.js"]
