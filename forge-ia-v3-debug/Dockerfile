FROM node:18-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# ============================================================================
# Stage de production
# ============================================================================

FROM node:18-alpine AS production

# Installer serve pour servir l'application
RUN npm install -g serve

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S forge-ia -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder --chown=forge-ia:nodejs /app/dist ./dist
COPY --from=builder --chown=forge-ia:nodejs /app/package.json ./

# Changer vers l'utilisateur non-root
USER forge-ia

# Exposer le port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "3000"]