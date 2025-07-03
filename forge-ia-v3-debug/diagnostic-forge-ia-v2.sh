#!/bin/bash
echo "🔍 DIAGNOSTIC FONCTIONNALITÉS FORGE-IA V2"
echo "========================================"

cd /var/www/forge-ia

echo "📁 Structure src/ complète :"
find src -name "*.tsx" -o -name "*.ts" | sort

echo ""
echo "🔧 Services disponibles :"
find src/services -name "*.ts" 2>/dev/null | sort || echo "❌ Dossier services manquant"

echo ""
echo "🪝 Hooks disponibles :"
find src/hooks -name "*.ts" 2>/dev/null | sort || echo "❌ Dossier hooks manquant"

echo ""
echo "📄 Types définis :"
find src/types -name "*.ts" 2>/dev/null | sort || echo "❌ Dossier types manquant"

echo ""
echo "⚙️ Configuration .env :"
if [ -f ".env" ]; then
    echo "✅ Fichier .env présent"
    grep -E "^(VITE_|REACT_)" .env | sed 's/=.*/=***/' || echo "Aucune variable d'environnement Vite détectée"
else
    echo "❌ Fichier .env manquant"
fi

echo ""
echo "🌐 URL d'accès :"
echo "FORGE-IA V2 : http://128.140.116.188:3001/"
echo "PocketBase  : http://128.140.116.188:8090/_/"

echo ""
echo "📊 Statut des ports :"
netstat -tlnp 2>/dev/null | grep -E "(3001|8090)" || echo "Ports non détectés"
