#!/bin/bash
echo "🖥️  TEST INTERFACE FORGE-IA V2"
echo "============================="

echo "🌐 URLs d'accès :"
echo "• FORGE-IA V2 : http://128.140.116.188:3001/"
echo "• PocketBase   : http://128.140.116.188:8090/_/"

echo ""
echo "📋 Composants disponibles :"
ls src/components/*.tsx | sed 's/src\/components\///g' | sed 's/\.tsx//g' | sort

echo ""
echo "⚙️ Services actifs :"
ls src/services/*.ts | sed 's/src\/services\///g' | sed 's/\.ts//g' | sort

echo ""
echo "🔗 Connexions détaillées :"
echo "📄 Composants utilisant aiService :"
grep -l "aiService" src/components/*.tsx | sed 's/src\/components\///g' | sed 's/\.tsx//g'

echo ""
echo "📄 Composants utilisant pocketbaseService :"
grep -l "pocketbaseService" src/components/*.tsx | sed 's/src\/components\///g' | sed 's/\.tsx//g'

echo ""
echo "📄 Composants utilisant realAIOrchestrator :"
grep -l "realAIOrchestrator" src/components/*.tsx | sed 's/src\/components\///g' | sed 's/\.tsx//g'

echo ""
echo "🧪 Test des endpoints API :"
echo "• Claude API    :" $(if [ -n "$VITE_CLAUDE_API_KEY" ]; then echo "Configuré"; else echo "Non configuré"; fi)
echo "• OpenAI API    :" $(if [ -n "$VITE_OPENAI_API_KEY" ]; then echo "Configuré"; else echo "Non configuré"; fi)
echo "• PocketBase    :" $(curl -s http://127.0.0.1:8090/api/health > /dev/null && echo "Accessible" || echo "Inaccessible")

echo ""
echo "📊 Analyse des erreurs potentielles :"
# Rechercher les TODO et FIXME dans le code
echo "🔧 TODO/FIXME trouvés :"
grep -r "TODO\|FIXME\|XXX" src/ | wc -l | xargs echo "Nombre :"

echo ""
echo "⚠️  Fonctions mockées (à connecter) :"
grep -r "mock\|fake\|simulate\|dummy" src/ | wc -l | xargs echo "Nombre :"

echo ""
echo "🎯 Prochaines étapes recommandées :"
echo "1. Tester l'interface sur http://128.140.116.188:3001/"
echo "2. Identifier les boutons qui ne répondent pas"
echo "3. Vérifier les erreurs dans la console du navigateur (F12)"
echo "4. Connecter les vraies APIs si nécessaire"
