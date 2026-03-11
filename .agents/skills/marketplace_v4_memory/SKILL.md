---
description: Mémoire et contexte de fin de Version 4 (Backend Supabase Intégré) pour préparer les futures itérations du projet.
---

# État du Projet "Stitsh" - Fin de Version 4 (Backend Supabase Intégré)

## 📌 Objectif de ce document
Ce document sert de mémoire centrale au groupe de développeurs experts. Il résume l'état exact du projet "Stitsh" (Nafcity / Marketplace MSM-Conseils) à la fin de la **Version 4**, après l'intégration complète de Supabase et la suppression de toutes les données factices (mocks). Il doit être lu comme **première étape** avant d'entamer la Version 5 ou toute nouvelle fonctionnalité.

---

## 🏗️ Architecture Actuelle

*   **Frontend :** Next.js 14+ (App Router), React 18, Server Components & Client Components.
*   **Styling :** Tailwind CSS, Design System "Stitsh" (Premium Dark & Emerald, Glassmorphism).
*   **State Management (Local) :** Zustand (pour le panier global).
*   **Backend & DB :** Supabase (PostgreSQL, Auth, Storage, Realtime).
*   **Hébergement cible :** Vercel (Frontend), Supabase (Backend).

---

## ✅ Fonctionnalités Implémentées (100% Dynamiques)

Toutes ces fonctionnalités lisent et écrivent désormais dans la base de données Supabase, sans **aucune donnée mockée** :

1.  **Authentification (Supabase Auth) :**
    *   Inscription Vendeur / Client (insertion automatique dans la table `profiles`).
    *   Connexion par Email/Mot de passe.
    *   Gestion de session sécurisée (cookies via SSR).

2.  **Dashboard Vendeur (`/dashboard/*`) :**
    *   **Abonnement :** Lecture du plan actuel depuis `profiles` (temporairement affiché Gratuit en attendant la logique de paiement, mais lit la bonne table).
    *   **Création de Produits (`/dashboard/produits/nouveau`) :** Upload multi-fichiers (images/vidéos) vers le Storage `product-images`, puis insertion dans la table `products` avec l'ID du vendeur.
    *   **Liste de Produits (`/dashboard/produits`) :** Récupération de la liste des produits spécifiques au vendeur connecté.
    *   **Gestion des Commandes (`/dashboard/commandes`) :** Visualisation des commandes reçues (table `order_items`), avec possibilité de changer le statut (En attente -> Expédiée -> Livrée) avec mise à jour temps réel.
    *   **Analytics (`/dashboard/analytics`) :** Calcul dynamique des KPI (Ventes, Revenus, Vues) basés sur `orders` et `order_items` du vendeur connecté.
    *   **Messagerie (`/dashboard/messagerie`) :** Système de discussion instantanée (table `messages`) entre Vendeur et Client.

3.  **Expérience Client :**
    *   **Accueil (`/page.tsx`) :** Affichage dynamique des 3 derniers produits ajoutés à la plateforme.
    *   **Catalogue Public (`/catalogue`) :** Affichage de tous les produits, avec système de filtre (Recherche textuelle) et tri opérationnel sur les vraies données.
    *   **Panier Global (Zustand) :** Ajout de produits, modification des quantités, calcul du total (persistant via LocalStorage).
    *   **Checkout (`/checkout`) :** Formulaire de paiement (Cash on Delivery actif). À la soumission, crée une entrée dans `orders` (panier client) et dispatche les produits dans `order_items` avec les IDs des vendeurs respectifs.
    *   **Dashboard Client (`/client-dashboard`) :** Historique des commandes passées avec suivi détaillé des statuts de chaque article.

4.  **Qualité et Déploiement :**
    *   Le projet compile avec succès (`npm run build`).
    *   Aucune erreur TypeScript bloquante.
    *   Prêt pour un déploiement Vercel.

---

## 🚧 Prochaines Étapes (Version 5 - "Scaling & Paiement")

Voici les priorités pour la prochaine itération :

1.  **Paiement en ligne :** Intégration d'une API de paiement algérienne (ex: CIB / Edahabia via un prestataire) ou internationale (Stripe) pour remplacer/compléter le "Cash on Delivery".
2.  **Gestion des Abonnements Vendeurs :** Lier les abonnements à un système de paiement. Restreindre certaines actions (ex: nombre de produits) selon le plan.
3.  **Supabase Realtime (Websockets) :**
    *   Activer les abonnements Realtime sur la table `messages` pour que la messagerie soit instantanée sans rafraîchissement.
    *   Notification en temps réel au vendeur lors d'une nouvelle commande.
4.  **Avis et Notations (Reviews) :** Implémenter la table `reviews` pour que les clients puissent noter les produits et les vendeurs.
5.  **Performance & SEO :** Optimisation des images (Next/Image avec Supabase Loader), génération de sitemap dynamique.

---

## 🔒 Variables d'environnement requises (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

> **Note au groupe d'experts :** La transition vers le Backend as a Service (BaaS) Supabase est **terminée et validée**. Le socle technique est robuste. Conservez la rigueur de l'architecture Server/Client Components de Next.js.
## 5. Mise à jour critique (10 Mars 2026) - Finalisation UX V4
Aujourd'hui, de nombreux correctifs et fonctionnalités critiques ont été apportés pour solidifier la V4 :
- **Séparation Stricte des Rôles (Navbar & Sidebar)** : Le menu de navigation central (Navbar) et le menu latéral (Sidebar) distinguent dynamiquement le rôle `client` et `vendeur`. Un acheteur ne verra jamais les onglets de gestion de produits.
- **Messagerie Avancée** : Intégration de l'upload de pièces jointes (images, vidéos, docs) sécurisé par un bucket `message_attachments`. Liens WhatsApp et Telegram dynamiques basés sur le numéro du vendeur.
- **Produits Multi-médias** : Upload multiple (photos/vidéos) pour le vendeur via un champ `media_urls` en JSONB dans PostgreSQL, caméra mobile prise en charge via `capture="environment"`.
- **Gestion de Compte** : Boutons "Déconnexion" et "Supprimer mon compte" 100% fonctionnels et placés intelligemment dans les Dashboards.
- **Résolution Déploiement Vercel** : L'environnement `.env.production` (avec variables Supabase) est désormais forcé sur GitHub. De plus, les règles de sécurité Vercel bloquaient les pushs de l'adresse "deploy@msm-conseils.dz". L'auteur Git a été réinitialisé *localement* sur "elkhayerroukaila@gmail".
