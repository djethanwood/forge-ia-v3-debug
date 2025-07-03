# 🚀 FORGE IA - Guide d'Installation Production

## Installation Rapide (Recommandée)

### Option 1: Installation Automatique

```bash
# Télécharger et exécuter le script d'installation
curl -fsSL https://raw.githubusercontent.com/votre-repo/forge-ia/main/install-forge-ia.sh | sudo bash

# Ou télécharger d'abord puis exécuter
wget https://raw.githubusercontent.com/votre-repo/forge-ia/main/install-forge-ia.sh
chmod +x install-forge-ia.sh
sudo ./install-forge-ia.sh
```

### Option 2: Déploiement Docker

```bash
# Cloner le repository
git clone https://github.com/votre-repo/forge-ia.git
cd forge-ia

# Déploiement rapide
chmod +x deploy.sh
./deploy.sh votre-domaine.com admin@votre-domaine.com
```

## Installation Manuelle Détaillée

### 1. Prérequis Système

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget git nginx certbot python3-certbot-nginx firewalld
```

### 2. Installation Node.js

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 3. Installation PocketBase

```bash
# Téléchargement
cd /tmp
wget https://github.com/pocketbase/pocketbase/releases/download/v0.19.4/pocketbase_0.19.4_linux_amd64.zip
unzip pocketbase_0.19.4_linux_amd64.zip
sudo mv pocketbase /usr/local/bin/
sudo chmod +x /usr/local/bin/pocketbase
```

### 4. Configuration du Projet

```bash
# Création utilisateur
sudo useradd -r -s /bin/bash -d /var/www/forge-ia forge-ia
sudo mkdir -p /var/www/forge-ia
sudo chown forge-ia:forge-ia /var/www/forge-ia

# Clonage projet
sudo -u forge-ia git clone https://github.com/votre-repo/forge-ia.git /var/www/forge-ia
cd /var/www/forge-ia

# Installation dépendances
sudo -u forge-ia npm install

# Build production
sudo -u forge-ia npm run build
```

### 5. Configuration Variables d'Environnement

```bash
# Création .env
sudo -u forge-ia cat > /var/www/forge-ia/.env << 'EOF'
# API Keys
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_CLAUDE_API_KEY=sk-ant-your-claude-key

# PocketBase
VITE_POCKETBASE_URL=https://votre-domaine.com/api
VITE_POCKETBASE_ADMIN_EMAIL=admin@votre-domaine.com
VITE_POCKETBASE_ADMIN_PASSWORD=votre-mot-de-passe-securise

# Services externes
VITE_FIGMA_TOKEN=your-figma-token
VITE_GITHUB_TOKEN=your-github-token

# Configuration
NODE_ENV=production
PORT=3000
EOF
```

### 6. Services Systemd

```bash
# Service PocketBase
sudo cat > /etc/systemd/system/pocketbase.service << 'EOF'
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=forge-ia
Group=forge-ia
WorkingDirectory=/var/lib/pocketbase
ExecStart=/usr/local/bin/pocketbase serve --http=127.0.0.1:8090
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Service FORGE IA
sudo cat > /etc/systemd/system/forge-ia.service << 'EOF'
[Unit]
Description=FORGE IA Frontend
After=network.target

[Service]
Type=simple
User=forge-ia
Group=forge-ia
WorkingDirectory=/var/www/forge-ia
ExecStart=/usr/bin/npm run preview
Restart=always
EnvironmentFile=/var/www/forge-ia/.env

[Install]
WantedBy=multi-user.target
EOF

# Activation services
sudo systemctl daemon-reload
sudo systemctl enable pocketbase forge-ia
sudo systemctl start pocketbase forge-ia
```

### 7. Configuration Nginx

```bash
# Configuration site
sudo cat > /etc/nginx/sites-available/forge-ia << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/forge-ia/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Activation
sudo ln -s /etc/nginx/sites-available/forge-ia /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Certificats SSL

```bash
# Génération certificats
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 9. Firewall

```bash
# Configuration UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

## Configuration Post-Installation

### 1. Configuration PocketBase

1. Accédez à `https://votre-domaine.com/api/_/`
2. Créez le compte administrateur
3. Configurez les collections nécessaires

### 2. Test de l'Application

```bash
# Vérification services
sudo systemctl status pocketbase
sudo systemctl status forge-ia
sudo systemctl status nginx

# Test URLs
curl -I https://votre-domaine.com
curl -I https://votre-domaine.com/api/health
```

## Maintenance

### Scripts Utiles

```bash
# Status complet
/var/www/forge-ia/scripts/status.sh

# Backup
/var/www/forge-ia/scripts/backup.sh

# Mise à jour
/var/www/forge-ia/scripts/update.sh
```

### Logs

```bash
# Logs application
journalctl -u forge-ia -f

# Logs PocketBase
journalctl -u pocketbase -f

# Logs Nginx
tail -f /var/log/nginx/forge-ia.access.log
tail -f /var/log/nginx/forge-ia.error.log
```

### Monitoring

```bash
# Utilisation ressources
htop
df -h
free -h

# Connexions réseau
ss -tlnp
```

## Dépannage

### Problèmes Courants

**Service ne démarre pas:**
```bash
sudo systemctl status forge-ia
journalctl -u forge-ia --no-pager
```

**Erreur 502 Bad Gateway:**
```bash
# Vérifier que les services backend fonctionnent
curl http://localhost:3000
curl http://localhost:8090
```

**Problème SSL:**
```bash
sudo certbot renew --dry-run
sudo nginx -t
```

### Support

- 📧 Email: support@forge-ia.com
- 🐛 Issues: https://github.com/votre-repo/forge-ia/issues
- 📖 Documentation: https://docs.forge-ia.com

---

**FORGE IA** - "Code smarter, not harder. Build faster, build better."