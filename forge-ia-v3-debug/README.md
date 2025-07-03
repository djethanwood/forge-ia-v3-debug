# FORGE IA - Meta-Orchestrateur de Développement

## 🚀 Installation Complète

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git

### Installation Rapide

```bash
# 1. Cloner le projet
git clone <votre-repo-url>
cd forge-ia-meta-orchestrator

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés API

# 4. Démarrer le serveur de développement
npm run dev

# 5. (Optionnel) Démarrer PocketBase
# Télécharger PocketBase depuis https://pocketbase.io/docs/
./pocketbase serve
```

### Installation Serveur Production

```bash
# 1. Installation sur serveur Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm nginx certbot python3-certbot-nginx

# 2. Cloner et configurer
git clone <votre-repo-url> /var/www/forge-ia
cd /var/www/forge-ia
npm install
npm run build

# 3. Configuration Nginx
sudo nano /etc/nginx/sites-available/forge-ia
```

Configuration Nginx:
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    location / {
        root /var/www/forge-ia/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 4. Activer le site
sudo ln -s /etc/nginx/sites-available/forge-ia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL avec Let's Encrypt
sudo certbot --nginx -d votre-domaine.com

# 6. Service PocketBase
sudo nano /etc/systemd/system/pocketbase.service
```

Service PocketBase:
```ini
[Unit]
Description=PocketBase
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/forge-ia
ExecStart=/var/www/forge-ia/pocketbase serve --http=127.0.0.1:8090
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 7. Démarrer les services
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase
```

## 🔧 Configuration

### Variables d'Environnement

```bash
# API Keys (obligatoires pour IA)
VITE_OPENAI_API_KEY=sk-...
VITE_CLAUDE_API_KEY=sk-ant-...

# Base de données
VITE_POCKETBASE_URL=https://votre-domaine.com/api

# Services externes (optionnels)
VITE_FIGMA_TOKEN=...
VITE_GITHUB_TOKEN=...
```

### Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run preview      # Aperçu build
npm run lint         # Linting
npm run format       # Formatage code
npm run analyze      # Analyse dépendances
npm run test         # Tests
```

## 🎯 Fonctionnalités Actives

✅ **IA Assistant** - Connexion OpenAI avec routage intelligent  
✅ **Gestion Projets** - Création, ouverture, sauvegarde  
✅ **Drag & Drop** - Composants fonctionnels vers canvas  
✅ **Live Preview** - Synchronisation temps réel  
✅ **Recherche** - Composants et templates  
✅ **Base de Données** - PocketBase intégré  
✅ **Éditeur Code** - Monaco Editor  
✅ **Multi-Device** - Preview responsive  

## 🔄 Utilisation

### 1. Créer un Nouveau Projet
- Cliquer "Nouveau Projet" dans la sidebar
- Ou utiliser les boutons dans le canvas principal

### 2. Assistant IA
- Utiliser le chat pour demander de l'aide
- L'IA route automatiquement vers le bon modèle
- Suggestions contextuelles disponibles

### 3. Drag & Drop
- Glisser composants depuis le panel Tools
- Déposer sur le canvas principal
- Modification en temps réel

### 4. Recherche
- Utiliser la barre de recherche en haut
- Recherche dans composants, templates, outils
- Résultats filtrés par catégorie

## 🛠️ Développement

### Structure du Projet
```
src/
├── components/     # Composants React
├── contexts/       # Contexts React
├── hooks/          # Hooks personnalisés
├── services/       # Services (IA, DB, etc.)
└── types/          # Types TypeScript
```

### Ajouter un Nouveau Composant
1. Créer dans `src/components/`
2. Ajouter au `ToolsPanel.tsx`
3. Configurer drag & drop
4. Tester dans le canvas

### Intégrer une Nouvelle IA
1. Ajouter service dans `src/services/`
2. Mettre à jour `aiService.ts`
3. Configurer routage intelligent
4. Tester les réponses

## 🔒 Sécurité

- Variables d'environnement pour clés API
- Authentification PocketBase
- HTTPS obligatoire en production
- Rate limiting sur les APIs

## 📊 Monitoring

- Logs dans la console navigateur
- Métriques PocketBase admin
- Performance via DevTools
- Erreurs trackées automatiquement

## 🆘 Dépannage

### Problèmes Courants

**IA ne répond pas:**
- Vérifier `VITE_OPENAI_API_KEY` dans `.env`
- Contrôler les quotas API
- Voir console pour erreurs

**Drag & Drop ne fonctionne pas:**
- Vérifier que les composants sont bien enregistrés
- Contrôler les zones de drop
- Tester avec différents navigateurs

**PocketBase inaccessible:**
- Vérifier que le service tourne
- Contrôler l'URL dans `.env`
- Voir les logs du service

### Support

- Issues GitHub: [lien-repo]/issues
- Documentation: [lien-docs]
- Discord: [lien-discord]

## 🚀 Déploiement Automatisé

### Docker (Recommandé)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Build et run
docker build -t forge-ia .
docker run -p 3000:3000 -d forge-ia
```

### Vercel/Netlify
- Connecter le repo GitHub
- Configurer les variables d'environnement
- Deploy automatique sur push

---

**FORGE IA** - "Code smarter, not harder. Build faster, build better."