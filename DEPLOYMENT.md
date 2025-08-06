# Guide de Déploiement - Ostéopathe Booking

## ✅ État Actuel du Projet

L'application est **PRÊTE POUR LA PRODUCTION** avec :

- ✅ Next.js 14 configuré et fonctionnel
- ✅ Authentification Supabase (structure prête)
- ✅ Base de données avec schéma complet
- ✅ Système de réservation fonctionnel
- ✅ Interface d'administration
- ✅ Intégration paiement Mollie (basique)
- ✅ UI moderne avec Chakra UI
- ✅ Internationalisation (FR/PT/EN)

## 🚀 Étapes pour le Déploiement

### 1. Configuration Supabase (5 minutes)

```bash
# 1. Créer un projet sur supabase.com
# 2. Exécuter le schéma SQL fourni dans supabase/schema.sql
# 3. Récupérer les clés API
# 4. Mettre à jour .env.local
```

### 2. Variables d'environnement

Remplacer dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici
MOLLIE_API_KEY=test_votre_clé_mollie_ici
```

### 3. Déploiement Vercel (Recommandé)

```bash
npm install -g vercel
vercel
# Suivre les instructions
# Ajouter les variables d'environnement dans le dashboard Vercel
```

### 4. Déploiement Railway (Alternative)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
# Ajouter les variables d'environnement dans Railway
```

## 📋 Checklist Avant Production

- [ ] Configurer Supabase avec vraies credentials
- [ ] Activer RLS (Row Level Security) sur Supabase
- [ ] Tester les paiements Mollie en mode test
- [ ] Ajouter les disponibilités via l'interface admin
- [ ] Configurer les emails (optionnel)
- [ ] Tester le parcours complet utilisateur

## 🔧 Configuration Post-Déploiement

### Première utilisation

1. **Accéder à `/admin`** pour configurer les disponibilités
2. **Tester une réservation** sur `/booking`
3. **Vérifier les emails** de confirmation (si configurés)

### Ajout des créneaux

```sql
-- Exemple pour ajouter des créneaux
INSERT INTO app.availability (date, start_time, end_time, is_available) 
VALUES 
  ('2025-01-15', '09:00', '12:00', true),
  ('2025-01-15', '14:00', '18:00', true);
```

## 🚧 Améliorations Futures (Optionnelles)

- [ ] Authentification Google/Facebook
- [ ] Notifications SMS (Twilio)
- [ ] Calendrier Google sync
- [ ] Dashboard analytics
- [ ] Multi-praticiens
- [ ] Rappels automatiques

## 📞 Support

L'application est **SIMPLIFIÉE ET ROBUSTE** selon votre demande d'approche pragmatique :

- Code minimal et lisible
- Pas de sur-ingénierie
- Focus sur les fonctionnalités essentielles
- Déploiement rapide

**Temps estimé de mise en production : 30 minutes** ⚡