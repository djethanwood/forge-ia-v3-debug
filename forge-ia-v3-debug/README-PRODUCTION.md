# 🚀 FORGE IA - Déploiement Production sur Hetzner

## Installation Automatique

### Prérequis
- Serveur Hetzner Ubuntu 22.04 LTS
- Accès SSH root avec clé publique
- Nom de domaine pointant vers le serveur

### Déploiement Rapide

```bash
# 1. Cloner le repository
git clone <votre-repo-url>
cd forge-ia

# 2. Rendre les scripts exécutables
chmod +x install-hetzner.sh
chmod +x scripts/deploy-hetzner.sh

# 3. Déployer sur votre serveur Hetzner
./scripts/deploy-hetzner.sh <IP_SERVEUR> <DOMAINE> <EMAIL>

# Exemple :
./scripts/deploy-hetzner.sh 192.168.1.100 forge-ia.com admin@forge-ia.com
```

### Installation Manuelle

Si vous préférez installer manuellement :

```bash
# 1. Copier le script sur votre serveur
scp install-hetzner.sh root@<IP_SERVEUR>:/tmp/

# 2. Se connecter au serveur
ssh root@<IP_SERVEUR>

# 3. Exécuter l'installation
chmod +x /tmp/install-hetzner.sh
/tmp/install-hetzner.sh <DOMAINE> <EMAIL>
```

## Configuration Post-Installation

### 1. Configuration des Clés API

Éditez le fichier de configuration :

```bash
ssh root@<IP_SERVEUR>
nano /var/www/forge-ia/.env
```

Configurez vos clés API :

```env
# API Keys pour les services IA (OBLIGATOIRE)
VITE_OPENAI_API_KEY=sk-votre-cle-openai-ici
VITE_CLAUDE_API_KEY=sk-ant-votre-cle-claude-ici

# Services externes (Optionnels)
VITE_FIGMA_TOKEN=votre-token-figma
VITE_GITHUB_TOKEN=votre-token-github
```

Redémarrez les services :

```bash
/var/www/forge-ia/scripts/restart.sh
```

### 2. Configuration PocketBase

1. Accédez à `https://votre-domaine.com/api/_/`
2. Créez le compte administrateur
3. Configurez les collections si nécessaire

### 3. Configuration DNS

Pointez votre domaine vers l'IP de votre serveur :

```
Type A : votre-domaine.com → IP_SERVEUR
Type A : www.votre-domaine.com → IP_SERVEUR
```

## Gestion du Serveur

### Scripts de Maintenance

```bash
# Status des services
/var/www/forge-ia/scripts/status.sh

# Redémarrage des services
/var/www/forge-ia/scripts/restart.sh

# Sauvegarde
/var/www/forge-ia/scripts/backup.sh

# Mise à jour
/var/www/forge-ia/scripts/update.sh
```

### Logs et Monitoring

```bash
# Logs FORGE IA
journalctl -u forge-ia -f

# Logs PocketBase
journalctl -u pocketbase -f

# Logs Nginx
tail -f /var/log/nginx/forge-ia.access.log
tail -f /var/log/nginx/forge-ia.error.log

# Status des services
systemctl status forge-ia
systemctl status pocketbase
systemctl status nginx
```

### Commandes Utiles

```bash
# Redémarrer un service spécifique
systemctl restart forge-ia
systemctl restart pocketbase
systemctl restart nginx

# Voir l'utilisation des ressources
htop
df -h
free -h

# Vérifier les ports ouverts
ss -tlnp

# Tester la connectivité
curl -I https://votre-domaine.com
curl -I https://votre-domaine.com/api/health
```

## Sécurité

### Fonctionnalités Activées

- ✅ Firewall UFW configuré
- ✅ Fail2Ban pour la protection SSH
- ✅ Certificats SSL automatiques (Let's Encrypt)
- ✅ Headers de sécurité Nginx
- ✅ Services isolés avec systemd
- ✅ SSH sécurisé (clés uniquement)
- ✅ Rate limiting sur les APIs

### Recommandations Supplémentaires

1. **Changez les mots de passe par défaut**
2. **Configurez la surveillance** (Prometheus + Grafana)
3. **Mettez en place des alertes** email/SMS
4. **Planifiez des sauvegardes** régulières
5. **Surveillez les logs** de sécurité

## Sauvegarde et Restauration

### Sauvegarde Automatique

Les sauvegardes sont automatiques (quotidiennes à 2h00) :

```bash
# Localisation des sauvegardes
ls -la /var/backups/forge-ia/

# Sauvegarde manuelle
/var/www/forge-ia/scripts/backup.sh
```

### Restauration

```bash
# Arrêter les services
systemctl stop forge-ia pocketbase

# Restaurer PocketBase
cd /var/lib/pocketbase
tar -xzf /var/backups/forge-ia/pocketbase_YYYYMMDD_HHMMSS.tar.gz

# Restaurer le projet
cd /var/www/forge-ia
tar -xzf /var/backups/forge-ia/project_YYYYMMDD_HHMMSS.tar.gz

# Redémarrer les services
systemctl start pocketbase forge-ia
```

## Mise à Jour

### Mise à Jour Automatique

```bash
/var/www/forge-ia/scripts/update.sh
```

### Mise à Jour Manuelle

```bash
cd /var/www/forge-ia

# Sauvegarde avant mise à jour
./scripts/backup.sh

# Mise à jour du code (si Git configuré)
git pull

# Mise à jour des dépendances
sudo -u forge-ia npm install

# Rebuild
sudo -u forge-ia npm run build

# Redémarrage
systemctl restart forge-ia
```

## Dépannage

### Problèmes Courants

**Service ne démarre pas :**
```bash
systemctl status forge-ia
journalctl -u forge-ia --no-pager -n 20
```

**Erreur 502 Bad Gateway :**
```bash
# Vérifier que les services backend fonctionnent
curl http://localhost:3000
curl http://localhost:8090

# Vérifier la configuration Nginx
nginx -t
```

**Problème SSL :**
```bash
# Renouveler les certificats
certbot renew --dry-run
systemctl restart nginx
```

**Base de données inaccessible :**
```bash
# Vérifier PocketBase
systemctl status pocketbase
journalctl -u pocketbase -n 20

# Tester l'API
curl http://localhost:8090/api/health
```

### Logs d'Erreur

```bash
# Erreurs système
dmesg | tail

# Erreurs Nginx
tail -f /var/log/nginx/error.log

# Erreurs application
journalctl -u forge-ia -p err
```

## Performance

### Optimisations Appliquées

- ✅ Gzip compression activée
- ✅ Cache statique configuré
- ✅ HTTP/2 activé
- ✅ Keep-alive optimisé
- ✅ Rate limiting configuré

### Monitoring Performance

```bash
# Utilisation CPU/RAM
htop

# Espace disque
df -h

# Connexions réseau
ss -tuln

# Performance Nginx
tail -f /var/log/nginx/forge-ia.access.log | grep -E "HTTP/[0-9.]+ [0-9]+"
```

## Support

### Informations Système

```bash
# Version du système
cat /etc/os-release

# Versions des services
node --version
npm --version
nginx -v
/usr/local/bin/pocketbase --version
```

### Contacts

- 📧 Support technique : support@forge-ia.com
- 📖 Documentation : https://docs.forge-ia.com
- 🐛 Issues : https://github.com/votre-repo/forge-ia/issues

---

**FORGE IA** - "Code smarter, not harder. Build faster, build better."