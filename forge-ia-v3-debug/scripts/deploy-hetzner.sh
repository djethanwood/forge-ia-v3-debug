#!/bin/bash

# ============================================================================
# FORGE IA - SCRIPT DE DÉPLOIEMENT RAPIDE HETZNER
# ============================================================================

set -e

echo "🚀 Déploiement FORGE IA sur Hetzner"
echo "===================================="

# Variables
SERVER_IP=${1:-""}
DOMAIN=${2:-"forge-ia.example.com"}
EMAIL=${3:-"admin@example.com"}

if [ -z "$SERVER_IP" ]; then
    echo "Usage: $0 <SERVER_IP> [DOMAIN] [EMAIL]"
    echo "Exemple: $0 192.168.1.100 forge-ia.com admin@forge-ia.com"
    exit 1
fi

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

# Vérification des prérequis
if ! command -v ssh &> /dev/null; then
    log_error "SSH n'est pas installé"
    exit 1
fi

if ! command -v scp &> /dev/null; then
    log_error "SCP n'est pas installé"
    exit 1
fi

# Test de connexion SSH
log_info "Test de connexion SSH vers $SERVER_IP..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes root@$SERVER_IP exit 2>/dev/null; then
    log_error "Impossible de se connecter au serveur $SERVER_IP"
    log_info "Assurez-vous que :"
    log_info "1. Le serveur est accessible"
    log_info "2. Votre clé SSH est configurée"
    log_info "3. L'utilisateur root est autorisé"
    exit 1
fi

log_success "Connexion SSH établie"

# Copie du script d'installation
log_info "Copie du script d'installation sur le serveur..."
scp install-hetzner.sh root@$SERVER_IP:/tmp/

# Copie des fichiers du projet
log_info "Copie des fichiers du projet..."
if [ -f "package.json" ]; then
    # Création d'une archive temporaire
    tar -czf /tmp/forge-ia-project.tar.gz \
        --exclude=node_modules \
        --exclude=dist \
        --exclude=.git \
        --exclude=*.log \
        .
    
    scp /tmp/forge-ia-project.tar.gz root@$SERVER_IP:/tmp/
    rm /tmp/forge-ia-project.tar.gz
    
    log_success "Fichiers du projet copiés"
else
    log_warning "Fichiers du projet non trouvés, installation avec template de base"
fi

# Exécution de l'installation sur le serveur
log_info "Démarrage de l'installation sur le serveur..."
ssh root@$SERVER_IP << EOF
    set -e
    
    # Extraction des fichiers du projet si disponibles
    if [ -f "/tmp/forge-ia-project.tar.gz" ]; then
        mkdir -p /tmp/forge-ia-source
        cd /tmp/forge-ia-source
        tar -xzf /tmp/forge-ia-project.tar.gz
        cd /tmp
    fi
    
    # Exécution du script d'installation
    chmod +x /tmp/install-hetzner.sh
    /tmp/install-hetzner.sh "$DOMAIN" "$EMAIL"
    
    # Nettoyage
    rm -f /tmp/install-hetzner.sh /tmp/forge-ia-project.tar.gz
    rm -rf /tmp/forge-ia-source
EOF

if [ $? -eq 0 ]; then
    log_success "Installation terminée avec succès !"
    
    echo
    echo "============================================================================"
    echo "🎉 FORGE IA DÉPLOYÉ AVEC SUCCÈS !"
    echo "============================================================================"
    echo
    echo "📍 Informations de déploiement :"
    echo "   Serveur : $SERVER_IP"
    echo "   Domaine : $DOMAIN"
    echo "   Email : $EMAIL"
    echo
    echo "📱 URLs d'accès :"
    echo "   Frontend : https://$DOMAIN"
    echo "   API : https://$DOMAIN/api"
    echo "   Admin : https://$DOMAIN/api/_/"
    echo
    echo "⚠️  ACTIONS REQUISES :"
    echo "   1. Configurez votre DNS pour pointer $DOMAIN vers $SERVER_IP"
    echo "   2. Éditez /var/www/forge-ia/.env avec vos clés API"
    echo "   3. Accédez à l'interface d'administration PocketBase"
    echo "   4. Testez l'application"
    echo
    echo "🔧 Commandes de gestion à distance :"
    echo "   Status : ssh root@$SERVER_IP '/var/www/forge-ia/scripts/status.sh'"
    echo "   Logs : ssh root@$SERVER_IP 'journalctl -u forge-ia -f'"
    echo "   Restart : ssh root@$SERVER_IP '/var/www/forge-ia/scripts/restart.sh'"
    echo
    echo "🚀 FORGE IA est maintenant en ligne !"
    echo "============================================================================"
else
    log_error "Erreur lors de l'installation"
    exit 1
fi