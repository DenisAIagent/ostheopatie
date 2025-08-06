# 🚀 Configuration Railway - Guide Rapide

## 1. Variables d'Environnement Required

Dans Railway → Settings → Environment Variables, ajoute :

```env
# ✅ OBLIGATOIRE - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anonyme

# ✅ OBLIGATOIRE - App
NEXT_PUBLIC_APP_URL=https://votre-domaine-railway.up.railway.app

# ⚠️ OPTIONNEL - Paiement (Phase 2)
MOLLIE_API_KEY=test_votre-cle-test
```

## 2. Configuration Supabase (5 min)

1. **Créer compte gratuit** → [supabase.com](https://supabase.com)
2. **Nouveau projet** → Choisir nom + mot de passe
3. **Copier les clés** :
   - Settings → API → Project URL = `NEXT_PUBLIC_SUPABASE_URL`
   - Settings → API → anon public = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Base de Données

**Exécuter le SQL** dans Supabase → SQL Editor :
```sql
-- Copier tout le contenu de supabase/schema.sql
```

## 4. Test Déploiement

Une fois les variables configurées, Railway va automatiquement redéployer.

**L'app sera fonctionnelle** avec :
- ✅ Pages multilingues
- ✅ Authentification 
- ✅ Structure booking (sans vraies données encore)
- ✅ Interface admin basique

## 5. Next Steps

1. **Tester l'inscription** sur ton domaine Railway
2. **Configurer Mollie** pour paiements Portugal
3. **Finaliser booking flow** avec vraies disponibilités

---

**Important** : Supabase est un service externe (comme une API), Railway héberge seulement ton app Next.js qui se connecte à Supabase.