#!/bin/bash

# ============================================================================
# FORGE IA - DÉPLOIEMENT RAPIDE AVEC DOCKER
# ============================================================================

set -e

echo "🚀 Déploiement FORGE IA avec Docker"
echo "===================================="

# Variables
DOMAIN=${1:-"localhost"}
EMAIL=${2:-"admin@example.com"}

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

# Configuration du domaine
log_info "Configuration pour le domaine: $DOMAIN"

# Mise à jour des fichiers de configuration
sed -i "s/votre-domaine.com/$DOMAIN/g" docker-compose.yml
sed -i "s/votre-domaine.com/$DOMAIN/g" nginx.conf
sed -i "s/admin@votre-domaine.com/$EMAIL/g" docker-compose.yml

# Création des répertoires nécessaires
mkdir -p ssl
mkdir -p pocketbase/migrations

# Variables d'environnement
if [ ! -f .env ]; then
    log_info "Création du fichier .env..."
    cat > .env << EOF
# Configuration FORGE IA
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_CLAUDE_API_KEY=your_anthropic_api_key_here
VITE_POCKETBASE_URL=https://$DOMAIN/api
PB_ENCRYPTION_KEY=$(openssl rand -hex 16)
NODE_ENV=production
EOF
    log_warning "Éditez le fichier .env avec vos vraies clés API"
fi

# Build et démarrage
log_info "Build de l'application..."
npm run build

log_info "Démarrage des services Docker..."
docker-compose up -d

# Attendre que les services soient prêts
log_info "Attente du démarrage des services..."
sleep 10

# Vérification des services
if docker-compose ps | grep -q "Up"; then
    log_info "✅ Services démarrés avec succès"
else
    log_error "❌ Erreur lors du démarrage des services"
    docker-compose logs
    exit 1
fi

# Génération SSL si domaine réel
if [ "$DOMAIN" != "localhost" ]; then
    log_info "Génération des certificats SSL..."
    docker-compose run --rm certbot
    docker-compose restart nginx
fi

echo
echo "============================================================================"
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "============================================================================"
echo
echo "📍 URLs d'accès:"
if [ "$DOMAIN" = "localhost" ]; then
    echo "   Frontend: http://localhost"
    echo "   API: http://localhost/api"
    echo "   Admin PocketBase: http://localhost/api/_/"
else
    echo "   Frontend: https://$DOMAIN"
    echo "   API: https://$DOMAIN/api"
    echo "   Admin PocketBase: https://$DOMAIN/api/_/"
fi
echo
echo "🔧 Commandes utiles:"
echo "   Logs: docker-compose logs -f"
echo "   Status: docker-compose ps"
echo "   Arrêt: docker-compose down"
echo "   Redémarrage: docker-compose restart"
echo
echo "⚠️  ACTIONS REQUISES:"
echo "   1. Éditez le fichier .env avec vos vraies clés API"
echo "   2. Accédez à l'admin PocketBase pour la configuration initiale"
echo "   3. Testez l'application"
echo
echo "🚀 FORGE IA est prêt !"
echo "============================================================================"