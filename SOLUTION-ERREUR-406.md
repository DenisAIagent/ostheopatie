# SOLUTION URGENTE - Erreur 406 Services

## 🚨 Problème identifié
L'API REST de Supabase ne peut pas accéder directement au schéma `app`. L'erreur 406 "Not Acceptable" se produit car l'API REST de Supabase ne supporte que le schéma `public` par défaut.

## ✅ Solution implémentée : Fonctions RPC

J'ai créé des fonctions SQL qui permettent d'accéder aux données du schéma `app` via l'API REST :

### Étapes à suivre IMMÉDIATEMENT :

1. **Exécuter le script SQL pour créer les fonctions RPC :**
   ```bash
   # Connectez-vous à votre base Supabase et exécutez :
   cat fix-services-access.sql
   ```
   
   OU via l'interface Supabase :
   - Allez dans l'éditeur SQL de Supabase
   - Copiez/collez le contenu de `fix-services-access.sql`
   - Exécutez le script

2. **S'assurer que le schéma `app` a des données :**
   ```bash
   # Si nécessaire, exécutez aussi :
   cat init-test-data-app-schema.sql
   ```

3. **Tester la solution :**
   ```bash
   node debug-services.js
   ```

## 🔧 Changements apportés au code

Le fichier `/src/app/[locale]/booking/page.tsx` a été modifié pour :
- Utiliser `supabase.rpc('get_services_from_app')` au lieu de `.schema('app')`
- Utiliser `supabase.rpc('insert_user_to_app')` pour créer des utilisateurs
- Utiliser `supabase.rpc('insert_appointment_to_app')` pour créer des rendez-vous

## 📋 Fonctions RPC créées

1. **`get_services_from_app()`** - Récupère les services actifs du schéma `app`
2. **`insert_user_to_app()`** - Insère/met à jour un utilisateur dans le schéma `app`
3. **`insert_appointment_to_app()`** - Crée un rendez-vous dans le schéma `app`

## 🚀 Test rapide

Après avoir exécuté les scripts SQL, votre application devrait afficher :
```
✅ Services loaded from public schema: X
```
OU
```
⚠️ No data in public schema, trying RPC function...
📊 RPC result: { dataCount: X, error: null }
```

## 🔄 Solution permanente (optionnel)

Pour une solution plus propre à long terme, vous pouvez migrer toutes les données vers le schéma `public` :
```bash
# Exécutez ce script pour migrer définitivement :
cat migrate-to-public-schema.sql
```

## 🆘 En cas de problème

1. **Vérifiez les permissions** : Les fonctions RPC ont besoin d'être accessible aux rôles `anon` et `authenticated`
2. **Vérifiez que le schéma `app` existe** avec des données
3. **Testez avec le script debug** : `node debug-services.js`

## 📞 Status attendu après correction

Logs de succès :
```
🔍 Fetching services from Supabase...
✅ Services loaded from public schema: 5
✅ Services formatted: 5
```

OU (si utilisation RPC) :
```
🔍 Fetching services from Supabase...  
⚠️ No data in public schema, trying RPC function...
📊 RPC result: { dataCount: 5, error: null }
✅ Services formatted: 5
```

L'application devrait maintenant charger les services correctement et permettre les réservations.