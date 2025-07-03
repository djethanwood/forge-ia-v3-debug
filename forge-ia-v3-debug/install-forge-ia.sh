#!/bin/bash

# ============================================================================
# FORGE IA - INSTALLATION COMPLÈTE SERVEUR PRODUCTION
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation FORGE IA - Meta-Orchestrateur de Développement"
echo "=============================================================="

# Variables de configuration
DOMAIN="votre-domaine.com"
PROJECT_DIR="/var/www/forge-ia"
DB_DIR="/var/lib/pocketbase"
SERVICE_USER="forge-ia"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# 1. MISE À JOUR SYSTÈME ET DÉPENDANCES
# ============================================================================

log_info "Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

log_info "Installation des dépendances système..."
sudo apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip \
    build-essential

# ============================================================================
# 2. INSTALLATION NODE.JS ET NPM
# ============================================================================

log_info "Installation Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification versions
node_version=$(node --version)
npm_version=$(npm --version)
log_success "Node.js installé: $node_version"
log_success "NPM installé: $npm_version"

# Installation PM2 pour la gestion des processus
log_info "Installation PM2..."
sudo npm install -g pm2

# ============================================================================
# 3. CRÉATION UTILISATEUR SYSTÈME
# ============================================================================

log_info "Création de l'utilisateur système $SERVICE_USER..."
if ! id "$SERVICE_USER" &>/dev/null; then
    sudo useradd -r -s /bin/bash -d $PROJECT_DIR $SERVICE_USER
    log_success "Utilisateur $SERVICE_USER créé"
else
    log_warning "Utilisateur $SERVICE_USER existe déjà"
fi

# ============================================================================
# 4. CLONAGE ET CONFIGURATION DU PROJET
# ============================================================================

log_info "Création du répertoire projet..."
sudo mkdir -p $PROJECT_DIR
sudo chown $SERVICE_USER:$SERVICE_USER $PROJECT_DIR

log_info "Clonage du projet FORGE IA..."
# Remplacez par votre URL de repository
# sudo -u $SERVICE_USER git clone https://github.com/votre-username/forge-ia.git $PROJECT_DIR

# Pour cette démo, on crée la structure
sudo -u $SERVICE_USER mkdir -p $PROJECT_DIR/{src,public,scripts}

# ============================================================================
# 5. INSTALLATION DÉPENDANCES NPM
# ============================================================================

log_info "Installation des dépendances NPM..."
cd $PROJECT_DIR

# Création du package.json avec toutes les dépendances
sudo -u $SERVICE_USER cat > package.json << 'EOF'
{
  "name": "forge-ia-meta-orchestrator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --fix",
    "preview": "vite preview",
    "format": "prettier --write .",
    "analyze": "npx madge --circular --extensions ts,tsx src/",
    "test": "jest",
    "storybook": "storybook dev -p 6006",
    "start": "npm run preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.8.1",
    "framer-motion": "^10.16.16",
    "react-beautiful-dnd": "^13.1.1",
    "react-ace": "^10.1.0",
    "ace-builds": "^1.32.6",
    "pocketbase": "^0.19.0",
    "openai": "^4.24.7",
    "fuse.js": "^7.0.0",
    "react-hotkeys-hook": "^4.4.1",
    "react-split-pane": "^0.1.92",
    "socket.io-client": "^4.7.4",
    "zustand": "^4.4.7",
    "react-query": "^3.39.3",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.3",
    "react-select": "^5.8.0",
    "react-color": "^2.19.3",
    "react-grid-layout": "^1.4.4",
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@types/react-beautiful-dnd": "^13.1.8",
    "@types/react-color": "^3.0.9",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2",
    "prettier": "^3.1.1",
    "madge": "^6.1.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "storybook": "^7.6.6",
    "@storybook/react": "^7.6.6",
    "@storybook/react-vite": "^7.6.6"
  }
}
EOF

log_info "Installation des dépendances (cela peut prendre plusieurs minutes)..."
sudo -u $SERVICE_USER npm install

log_success "Dépendances NPM installées"

# ============================================================================
# 6. INSTALLATION ET CONFIGURATION POCKETBASE
# ============================================================================

log_info "Installation PocketBase..."
sudo mkdir -p $DB_DIR
cd /tmp

# Téléchargement PocketBase
POCKETBASE_VERSION="0.19.4"
wget "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
unzip "pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
sudo mv pocketbase /usr/local/bin/
sudo chmod +x /usr/local/bin/pocketbase

# Configuration PocketBase
sudo chown -R $SERVICE_USER:$SERVICE_USER $DB_DIR

log_success "PocketBase installé"

# ============================================================================
# 7. CONFIGURATION VARIABLES D'ENVIRONNEMENT
# ============================================================================

log_info "Configuration des variables d'environnement..."

sudo -u $SERVICE_USER cat > $PROJECT_DIR/.env << 'EOF'
# Configuration FORGE IA Production

# API Keys pour les services IA
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_CLAUDE_API_KEY=your_anthropic_api_key_here

# Base de données PocketBase
VITE_POCKETBASE_URL=https://your-domain.com/api
VITE_POCKETBASE_ADMIN_EMAIL=admin@forge-ia.com
VITE_POCKETBASE_ADMIN_PASSWORD=your_secure_admin_password

# Services externes
VITE_FIGMA_TOKEN=your_figma_token
VITE_GITHUB_TOKEN=your_github_token

# Configuration IA
VITE_AI_ROUTING_STRATEGY=smart
VITE_CLAUDE_USAGE_LIMIT=1000
VITE_CODE_ANALYSIS_DEPTH=deep

# Performance
VITE_CACHE_STRATEGY=intelligent
VITE_REAL_TIME_PREVIEW=true
VITE_AUTO_SAVE_INTERVAL=30

# Production
NODE_ENV=production
PORT=3000
POCKETBASE_PORT=8090
EOF

log_warning "⚠️  IMPORTANT: Éditez le fichier $PROJECT_DIR/.env avec vos vraies clés API !"

# ============================================================================
# 8. BUILD DU PROJET
# ============================================================================

log_info "Build du projet pour la production..."
cd $PROJECT_DIR
sudo -u $SERVICE_USER npm run build

log_success "Build terminé"

# ============================================================================
# 9. CONFIGURATION NGINX
# ============================================================================

log_info "Configuration Nginx..."

sudo cat > /etc/nginx/sites-available/forge-ia << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirection HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # Certificats SSL (seront générés par Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Frontend (React App)
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache statique
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API PocketBase
    location /api/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Logs
    access_log /var/log/nginx/forge-ia.access.log;
    error_log /var/log/nginx/forge-ia.error.log;
}
EOF

# Activation du site
sudo ln -sf /etc/nginx/sites-available/forge-ia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration Nginx
sudo nginx -t
log_success "Configuration Nginx créée"

# ============================================================================
# 10. SERVICES SYSTEMD
# ============================================================================

log_info "Création des services systemd..."

# Service PocketBase
sudo cat > /etc/systemd/system/pocketbase.service << EOF
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$DB_DIR
ExecStart=/usr/local/bin/pocketbase serve --http=127.0.0.1:8090 --dir=$DB_DIR
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=pocketbase

# Sécurité
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$DB_DIR

[Install]
WantedBy=multi-user.target
EOF

# Service FORGE IA (Frontend)
sudo cat > /etc/systemd/system/forge-ia.service << EOF
[Unit]
Description=FORGE IA Frontend
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=forge-ia

# Variables d'environnement
EnvironmentFile=$PROJECT_DIR/.env

# Sécurité
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$PROJECT_DIR

[Install]
WantedBy=multi-user.target
EOF

# Rechargement systemd
sudo systemctl daemon-reload

log_success "Services systemd créés"

# ============================================================================
# 11. CONFIGURATION FIREWALL
# ============================================================================

log_info "Configuration du firewall..."

sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

log_success "Firewall configuré"

# ============================================================================
# 12. CERTIFICATS SSL
# ============================================================================

log_info "Génération des certificats SSL..."
log_warning "Assurez-vous que votre domaine $DOMAIN pointe vers ce serveur !"

read -p "Voulez-vous générer les certificats SSL maintenant ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    log_success "Certificats SSL générés"
else
    log_warning "Certificats SSL non générés. Lancez manuellement: sudo certbot --nginx -d $DOMAIN"
fi

# ============================================================================
# 13. DÉMARRAGE DES SERVICES
# ============================================================================

log_info "Démarrage des services..."

# Démarrage PocketBase
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Démarrage FORGE IA
sudo systemctl enable forge-ia
sudo systemctl start forge-ia

# Démarrage Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

log_success "Services démarrés"

# ============================================================================
# 14. SCRIPTS DE MAINTENANCE
# ============================================================================

log_info "Création des scripts de maintenance..."

# Script de backup
sudo cat > $PROJECT_DIR/scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/forge-ia"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PocketBase
tar -czf $BACKUP_DIR/pocketbase_$DATE.tar.gz -C /var/lib/pocketbase .

# Backup projet
tar -czf $BACKUP_DIR/project_$DATE.tar.gz -C /var/www/forge-ia --exclude=node_modules --exclude=dist .

# Nettoyage (garde 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup terminé: $BACKUP_DIR"
EOF

# Script de mise à jour
sudo cat > $PROJECT_DIR/scripts/update.sh << 'EOF'
#!/bin/bash
cd /var/www/forge-ia

echo "Mise à jour FORGE IA..."

# Backup avant mise à jour
./scripts/backup.sh

# Pull dernières modifications
sudo -u forge-ia git pull

# Mise à jour dépendances
sudo -u forge-ia npm install

# Build
sudo -u forge-ia npm run build

# Redémarrage services
sudo systemctl restart forge-ia
sudo systemctl restart nginx

echo "Mise à jour terminée"
EOF

# Script de monitoring
sudo cat > $PROJECT_DIR/scripts/status.sh << 'EOF'
#!/bin/bash

echo "=== FORGE IA - STATUS ==="
echo

echo "Services:"
systemctl is-active --quiet pocketbase && echo "✅ PocketBase: Running" || echo "❌ PocketBase: Stopped"
systemctl is-active --quiet forge-ia && echo "✅ FORGE IA: Running" || echo "❌ FORGE IA: Stopped"
systemctl is-active --quiet nginx && echo "✅ Nginx: Running" || echo "❌ Nginx: Stopped"

echo
echo "Ports:"
ss -tlnp | grep :80 > /dev/null && echo "✅ Port 80: Open" || echo "❌ Port 80: Closed"
ss -tlnp | grep :443 > /dev/null && echo "✅ Port 443: Open" || echo "❌ Port 443: Closed"
ss -tlnp | grep :8090 > /dev/null && echo "✅ Port 8090: Open" || echo "❌ Port 8090: Closed"

echo
echo "Disk Usage:"
df -h /var/www/forge-ia
df -h /var/lib/pocketbase

echo
echo "Memory Usage:"
free -h

echo
echo "Recent Logs:"
journalctl -u forge-ia --no-pager -n 5
EOF

# Permissions scripts
sudo chmod +x $PROJECT_DIR/scripts/*.sh
sudo chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_DIR/scripts

log_success "Scripts de maintenance créés"

# ============================================================================
# 15. CRON JOBS
# ============================================================================

log_info "Configuration des tâches cron..."

# Backup quotidien
(sudo crontab -u $SERVICE_USER -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/scripts/backup.sh") | sudo crontab -u $SERVICE_USER -

# Renouvellement SSL
(sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

log_success "Tâches cron configurées"

# ============================================================================
# 16. VÉRIFICATIONS FINALES
# ============================================================================

log_info "Vérifications finales..."

# Vérification des services
sleep 5

if systemctl is-active --quiet pocketbase; then
    log_success "✅ PocketBase fonctionne"
else
    log_error "❌ PocketBase ne fonctionne pas"
fi

if systemctl is-active --quiet forge-ia; then
    log_success "✅ FORGE IA fonctionne"
else
    log_error "❌ FORGE IA ne fonctionne pas"
fi

if systemctl is-active --quiet nginx; then
    log_success "✅ Nginx fonctionne"
else
    log_error "❌ Nginx ne fonctionne pas"
fi

# ============================================================================
# 17. INFORMATIONS FINALES
# ============================================================================

echo
echo "============================================================================"
echo "🎉 INSTALLATION FORGE IA TERMINÉE !"
echo "============================================================================"
echo
echo "📍 URLs d'accès:"
echo "   Frontend: https://$DOMAIN"
echo "   API PocketBase: https://$DOMAIN/api"
echo "   Admin PocketBase: https://$DOMAIN/api/_/"
echo
echo "📁 Répertoires:"
echo "   Projet: $PROJECT_DIR"
echo "   Base de données: $DB_DIR"
echo "   Logs Nginx: /var/log/nginx/"
echo
echo "🔧 Commandes utiles:"
echo "   Status: $PROJECT_DIR/scripts/status.sh"
echo "   Backup: $PROJECT_DIR/scripts/backup.sh"
echo "   Update: $PROJECT_DIR/scripts/update.sh"
echo "   Logs FORGE IA: journalctl -u forge-ia -f"
echo "   Logs PocketBase: journalctl -u pocketbase -f"
echo
echo "⚠️  ACTIONS REQUISES:"
echo "   1. Éditez $PROJECT_DIR/.env avec vos vraies clés API"
echo "   2. Configurez votre DNS pour pointer vers ce serveur"
echo "   3. Accédez à https://$DOMAIN/api/_/ pour configurer PocketBase"
echo "   4. Testez l'application sur https://$DOMAIN"
echo
echo "🔒 Sécurité:"
echo "   - Firewall UFW activé"
echo "   - Certificats SSL configurés"
echo "   - Services isolés avec systemd"
echo "   - Backups automatiques quotidiens"
echo
echo "📚 Documentation:"
echo "   - README: $PROJECT_DIR/README.md"
echo "   - Logs: journalctl -u forge-ia"
echo
echo "🚀 FORGE IA est prêt ! Bon développement !"
echo "============================================================================"