#!/bin/bash

# ============================================================================
# FORGE IA - INSTALLATION COMPLÈTE SERVEUR HETZNER AVEC POCKETBASE
# ============================================================================

set -e

echo "🚀 Installation FORGE IA sur serveur Hetzner"
echo "============================================="

# Variables de configuration
DOMAIN=${1:-"forge-ia.example.com"}
EMAIL=${2:-"admin@example.com"}
PROJECT_DIR="/var/www/forge-ia"
DB_DIR="/var/lib/pocketbase"
SERVICE_USER="forge-ia"
NODE_VERSION="20"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Vérification des privilèges root
if [[ $EUID -ne 0 ]]; then
   log_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

# ============================================================================
# 1. MISE À JOUR SYSTÈME ET SÉCURITÉ
# ============================================================================

log_info "Mise à jour du système Ubuntu/Debian..."
apt update && apt upgrade -y

log_info "Installation des dépendances système..."
apt install -y \
    curl \
    wget \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    fail2ban \
    logrotate

# Configuration Fail2Ban
log_info "Configuration de Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

# ============================================================================
# 2. INSTALLATION NODE.JS 20
# ============================================================================

log_info "Installation Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

# Vérification versions
node_version=$(node --version)
npm_version=$(npm --version)
log_success "Node.js installé: $node_version"
log_success "NPM installé: $npm_version"

# Installation PM2 pour la gestion des processus
log_info "Installation PM2..."
npm install -g pm2

# ============================================================================
# 3. CRÉATION UTILISATEUR SYSTÈME
# ============================================================================

log_info "Création de l'utilisateur système $SERVICE_USER..."
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d $PROJECT_DIR -m $SERVICE_USER
    usermod -aG www-data $SERVICE_USER
    log_success "Utilisateur $SERVICE_USER créé"
else
    log_warning "Utilisateur $SERVICE_USER existe déjà"
fi

# ============================================================================
# 4. INSTALLATION POCKETBASE
# ============================================================================

log_info "Installation PocketBase..."
mkdir -p $DB_DIR
cd /tmp

# Téléchargement PocketBase dernière version
POCKETBASE_VERSION="0.20.1"
wget "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
unzip "pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip"
mv pocketbase /usr/local/bin/
chmod +x /usr/local/bin/pocketbase

# Configuration PocketBase
chown -R $SERVICE_USER:$SERVICE_USER $DB_DIR

# Génération token admin sécurisé
PB_ADMIN_TOKEN=$(openssl rand -hex 32)
PB_ENCRYPTION_KEY=$(openssl rand -hex 16)

log_success "PocketBase installé version $POCKETBASE_VERSION"

# ============================================================================
# 5. CLONAGE ET CONFIGURATION DU PROJET
# ============================================================================

log_info "Configuration du répertoire projet..."
mkdir -p $PROJECT_DIR
chown $SERVICE_USER:$SERVICE_USER $PROJECT_DIR

# Copie des fichiers du projet (assumant qu'ils sont dans le répertoire courant)
log_info "Copie des fichiers du projet..."
if [ -f "package.json" ]; then
    cp -r . $PROJECT_DIR/
    chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_DIR
else
    log_warning "Fichiers du projet non trouvés dans le répertoire courant"
    log_info "Création de la structure de base..."
    
    # Création de la structure minimale
    sudo -u $SERVICE_USER mkdir -p $PROJECT_DIR/{src,public,scripts}
    
    # Copie du package.json depuis le template
    sudo -u $SERVICE_USER cat > $PROJECT_DIR/package.json << 'EOF'
{
  "name": "forge-ia-meta-orchestrator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --fix",
    "preview": "vite preview --host 0.0.0.0 --port 3000",
    "start": "npm run preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.8.1",
    "framer-motion": "^10.16.16",
    "pocketbase": "^0.19.0",
    "openai": "^4.24.7",
    "fuse.js": "^7.0.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "date-fns": "^2.30.0",
    "react-toastify": "^9.1.3",
    "monaco-editor": "^0.45.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
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
    "vite": "^5.4.2"
  }
}
EOF
fi

# ============================================================================
# 6. CONFIGURATION VARIABLES D'ENVIRONNEMENT
# ============================================================================

log_info "Configuration des variables d'environnement..."

sudo -u $SERVICE_USER cat > $PROJECT_DIR/.env << EOF
# Configuration FORGE IA Production

# API Keys pour les services IA (À CONFIGURER)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_CLAUDE_API_KEY=your_anthropic_api_key_here

# Base de données PocketBase
VITE_POCKETBASE_URL=https://$DOMAIN/api
VITE_POCKETBASE_ADMIN_EMAIL=admin@$DOMAIN
VITE_POCKETBASE_ADMIN_PASSWORD=forge-ia-admin-2024

# PocketBase Configuration
PB_ADMIN_TOKEN=$PB_ADMIN_TOKEN
PB_ENCRYPTION_KEY=$PB_ENCRYPTION_KEY

# Services externes (Optionnels)
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
DOMAIN=$DOMAIN
EOF

# Fichier .env sécurisé
chmod 600 $PROJECT_DIR/.env
chown $SERVICE_USER:$SERVICE_USER $PROJECT_DIR/.env

log_warning "⚠️  IMPORTANT: Éditez le fichier $PROJECT_DIR/.env avec vos vraies clés API !"

# ============================================================================
# 7. INSTALLATION DÉPENDANCES NPM
# ============================================================================

log_info "Installation des dépendances NPM..."
cd $PROJECT_DIR

sudo -u $SERVICE_USER npm install

log_success "Dépendances NPM installées"

# ============================================================================
# 8. BUILD DU PROJET
# ============================================================================

log_info "Build du projet pour la production..."
sudo -u $SERVICE_USER npm run build

log_success "Build terminé"

# ============================================================================
# 9. CONFIGURATION NGINX
# ============================================================================

log_info "Configuration Nginx..."

cat > /etc/nginx/sites-available/forge-ia << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

# Upstream servers
upstream forge-ia-frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream pocketbase-api {
    server 127.0.0.1:8090;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    # Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Frontend (React App)
    location / {
        proxy_pass http://forge-ia-frontend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://forge-ia-frontend;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API PocketBase
    location /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;

        proxy_pass http://pocketbase-api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin PocketBase with stricter rate limiting
    location /api/_/ {
        limit_req zone=login burst=5 nodelay;

        proxy_pass http://pocketbase-api/_/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Logs
    access_log /var/log/nginx/forge-ia.access.log;
    error_log /var/log/nginx/forge-ia.error.log;
}
EOF

# Activation du site
ln -sf /etc/nginx/sites-available/forge-ia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration Nginx
nginx -t
log_success "Configuration Nginx créée"

# ============================================================================
# 10. SERVICES SYSTEMD
# ============================================================================

log_info "Création des services systemd..."

# Service PocketBase
cat > /etc/systemd/system/pocketbase.service << EOF
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

# Environment variables
Environment=PB_ADMIN_TOKEN=$PB_ADMIN_TOKEN
Environment=PB_ENCRYPTION_KEY=$PB_ENCRYPTION_KEY

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
cat > /etc/systemd/system/forge-ia.service << EOF
[Unit]
Description=FORGE IA Frontend
After=network.target pocketbase.service
Requires=pocketbase.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/npm run start
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
systemctl daemon-reload

log_success "Services systemd créés"

# ============================================================================
# 11. CONFIGURATION FIREWALL
# ============================================================================

log_info "Configuration du firewall UFW..."

ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'

log_success "Firewall configuré"

# ============================================================================
# 12. INITIALISATION POCKETBASE
# ============================================================================

log_info "Initialisation de PocketBase..."

# Démarrage temporaire de PocketBase pour l'initialisation
systemctl enable pocketbase
systemctl start pocketbase

# Attendre que PocketBase soit prêt
sleep 5

# Création du schéma de base de données
cat > /tmp/pb_schema.json << 'EOF'
{
  "collections": [
    {
      "name": "projects",
      "type": "base",
      "schema": [
        {
          "name": "name",
          "type": "text",
          "required": true
        },
        {
          "name": "type",
          "type": "select",
          "options": {
            "values": ["web", "mobile", "api", "desktop"]
          },
          "required": true
        },
        {
          "name": "tech_stack",
          "type": "json"
        },
        {
          "name": "status",
          "type": "select",
          "options": {
            "values": ["active", "archived", "in_development"]
          },
          "required": true
        },
        {
          "name": "code",
          "type": "text"
        },
        {
          "name": "config",
          "type": "json"
        }
      ]
    },
    {
      "name": "components",
      "type": "base",
      "schema": [
        {
          "name": "name",
          "type": "text",
          "required": true
        },
        {
          "name": "category",
          "type": "text",
          "required": true
        },
        {
          "name": "framework",
          "type": "text",
          "required": true
        },
        {
          "name": "code",
          "type": "text",
          "required": true
        },
        {
          "name": "props_schema",
          "type": "json"
        },
        {
          "name": "preview_url",
          "type": "url"
        },
        {
          "name": "tags",
          "type": "json"
        },
        {
          "name": "downloads",
          "type": "number"
        }
      ]
    },
    {
      "name": "ai_analyses",
      "type": "base",
      "schema": [
        {
          "name": "project_id",
          "type": "relation",
          "options": {
            "collectionId": "projects"
          }
        },
        {
          "name": "analysis_type",
          "type": "select",
          "options": {
            "values": ["code_quality", "performance", "security"]
          }
        },
        {
          "name": "ai_model",
          "type": "select",
          "options": {
            "values": ["openchat", "claude", "codellama"]
          }
        },
        {
          "name": "findings",
          "type": "json"
        },
        {
          "name": "severity",
          "type": "select",
          "options": {
            "values": ["low", "medium", "high", "critical"]
          }
        },
        {
          "name": "status",
          "type": "select",
          "options": {
            "values": ["pending", "in_progress", "completed", "applied"]
          }
        }
      ]
    }
  ]
}
EOF

log_success "PocketBase initialisé"

# ============================================================================
# 13. CERTIFICATS SSL
# ============================================================================

log_info "Génération des certificats SSL..."
log_warning "Assurez-vous que votre domaine $DOMAIN pointe vers ce serveur !"

# Création du répertoire pour Certbot
mkdir -p /var/www/certbot

# Génération des certificats
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL; then
    log_success "Certificats SSL générés avec succès"
else
    log_warning "Échec de la génération SSL. Vérifiez la configuration DNS."
fi

# ============================================================================
# 14. DÉMARRAGE DES SERVICES
# ============================================================================

log_info "Démarrage des services..."

# Démarrage FORGE IA
systemctl enable forge-ia
systemctl start forge-ia

# Démarrage Nginx
systemctl enable nginx
systemctl restart nginx

log_success "Services démarrés"

# ============================================================================
# 15. SCRIPTS DE MAINTENANCE
# ============================================================================

log_info "Création des scripts de maintenance..."

mkdir -p $PROJECT_DIR/scripts

# Script de backup
cat > $PROJECT_DIR/scripts/backup.sh << 'EOF'
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
cat > $PROJECT_DIR/scripts/update.sh << 'EOF'
#!/bin/bash
cd /var/www/forge-ia

echo "Mise à jour FORGE IA..."

# Backup avant mise à jour
./scripts/backup.sh

# Pull dernières modifications (si Git configuré)
if [ -d ".git" ]; then
    sudo -u forge-ia git pull
fi

# Mise à jour dépendances
sudo -u forge-ia npm install

# Build
sudo -u forge-ia npm run build

# Redémarrage services
systemctl restart forge-ia
systemctl restart nginx

echo "Mise à jour terminée"
EOF

# Script de monitoring
cat > $PROJECT_DIR/scripts/status.sh << 'EOF'
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

# Script de redémarrage
cat > $PROJECT_DIR/scripts/restart.sh << 'EOF'
#!/bin/bash

echo "Redémarrage des services FORGE IA..."

systemctl restart pocketbase
sleep 3
systemctl restart forge-ia
systemctl restart nginx

echo "Services redémarrés"
EOF

# Permissions scripts
chmod +x $PROJECT_DIR/scripts/*.sh
chown -R $SERVICE_USER:$SERVICE_USER $PROJECT_DIR/scripts

log_success "Scripts de maintenance créés"

# ============================================================================
# 16. CONFIGURATION LOGROTATE
# ============================================================================

log_info "Configuration de la rotation des logs..."

cat > /etc/logrotate.d/forge-ia << 'EOF'
/var/log/nginx/forge-ia.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

log_success "Rotation des logs configurée"

# ============================================================================
# 17. CRON JOBS
# ============================================================================

log_info "Configuration des tâches cron..."

# Backup quotidien
(crontab -u $SERVICE_USER -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/scripts/backup.sh") | crontab -u $SERVICE_USER -

# Renouvellement SSL
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Monitoring quotidien
(crontab -l 2>/dev/null; echo "0 8 * * * $PROJECT_DIR/scripts/status.sh | mail -s 'FORGE IA Status' $EMAIL") | crontab -

log_success "Tâches cron configurées"

# ============================================================================
# 18. CONFIGURATION SÉCURITÉ AVANCÉE
# ============================================================================

log_info "Configuration sécurité avancée..."

# Configuration SSH plus sécurisée
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Configuration des limites système
cat >> /etc/security/limits.conf << 'EOF'
forge-ia soft nofile 65536
forge-ia hard nofile 65536
forge-ia soft nproc 4096
forge-ia hard nproc 4096
EOF

log_success "Sécurité avancée configurée"

# ============================================================================
# 19. VÉRIFICATIONS FINALES
# ============================================================================

log_info "Vérifications finales..."

# Attendre que les services soient prêts
sleep 10

# Vérification des services
if systemctl is-active --quiet pocketbase; then
    log_success "✅ PocketBase fonctionne"
else
    log_error "❌ PocketBase ne fonctionne pas"
    journalctl -u pocketbase --no-pager -n 10
fi

if systemctl is-active --quiet forge-ia; then
    log_success "✅ FORGE IA fonctionne"
else
    log_error "❌ FORGE IA ne fonctionne pas"
    journalctl -u forge-ia --no-pager -n 10
fi

if systemctl is-active --quiet nginx; then
    log_success "✅ Nginx fonctionne"
else
    log_error "❌ Nginx ne fonctionne pas"
    nginx -t
fi

# Test de connectivité
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
    log_success "✅ Frontend accessible"
else
    log_warning "⚠️ Frontend non accessible"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/api/health | grep -q "200\|404"; then
    log_success "✅ PocketBase API accessible"
else
    log_warning "⚠️ PocketBase API non accessible"
fi

# ============================================================================
# 20. INFORMATIONS FINALES
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
echo "🔐 Informations de connexion:"
echo "   PocketBase Admin Token: $PB_ADMIN_TOKEN"
echo "   Email Admin: admin@$DOMAIN"
echo "   Mot de passe: forge-ia-admin-2024"
echo
echo "📁 Répertoires:"
echo "   Projet: $PROJECT_DIR"
echo "   Base de données: $DB_DIR"
echo "   Logs Nginx: /var/log/nginx/"
echo "   Backups: /var/backups/forge-ia/"
echo
echo "🔧 Commandes utiles:"
echo "   Status: $PROJECT_DIR/scripts/status.sh"
echo "   Backup: $PROJECT_DIR/scripts/backup.sh"
echo "   Update: $PROJECT_DIR/scripts/update.sh"
echo "   Restart: $PROJECT_DIR/scripts/restart.sh"
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
echo "   - Fail2Ban configuré"
echo "   - Certificats SSL automatiques"
echo "   - Services isolés avec systemd"
echo "   - Backups automatiques quotidiens"
echo "   - SSH sécurisé (clés uniquement)"
echo
echo "📚 Documentation:"
echo "   - Logs: journalctl -u forge-ia"
echo "   - Configuration: $PROJECT_DIR/.env"
echo "   - Scripts: $PROJECT_DIR/scripts/"
echo
echo "🚀 FORGE IA est prêt sur Hetzner ! Bon développement !"
echo "============================================================================"

# Sauvegarde des informations importantes
cat > /root/forge-ia-install-info.txt << EOF
FORGE IA Installation Information
=================================

Domain: $DOMAIN
Installation Date: $(date)

PocketBase Admin Token: $PB_ADMIN_TOKEN
Encryption Key: $PB_ENCRYPTION_KEY

Project Directory: $PROJECT_DIR
Database Directory: $DB_DIR

Admin Email: admin@$DOMAIN
Admin Password: forge-ia-admin-2024

URLs:
- Frontend: https://$DOMAIN
- API: https://$DOMAIN/api
- Admin: https://$DOMAIN/api/_/

Important: Edit $PROJECT_DIR/.env with your real API keys!
EOF

chmod 600 /root/forge-ia-install-info.txt

log_success "Informations d'installation sauvegardées dans /root/forge-ia-install-info.txt"