---
name: marketplace_v6_memory
description: Mémoire et contexte global de fin de Version 6 (Logistique, Paiement, Tracking GPS, et Rebranding MSM Hub) pour préparer les futures itérations du projet.
---

# Mémoire du Projet - Fin de Version 6 (Rebranding MSM Hub)

Ce document conserve le contexte de tout ce qui a été réalisé jusqu'au **11 Mars 2026**. 
Ces informations doivent être consultées par tout agent avant de commencer une nouvelle phase de développement pour le backend Supabase ou le Frontend Next.js.

## 1. Changement d'Identité (Rebranding)
- **Ancien nom :** SoukDz
- **Nouveau nom :** MSM Hub
- **Nouveau Slogan :** "MSM Hub — Connecter vendeurs, clients et livraison propulsé par msm-conseils."
- **Nouveau Dépôt GitHub :** `https://github.com/roukaila/msm-hub.git`
- L'application est maintenant orientée vers le marché algérien ET international (Numéros Siret / Siren gérés).

## 2. Fonctionnalités Implémentées (Phase 5 & 6)
### A. Paiement
- Intégration de la simulation de paiement pour les méthodes **Stripe** (Cartes Bancaires) et **PayPal**.
- Les vendeurs n'ont pas accès aux données de cartes bancaires des clients, la sécurité des transactions est isolée et gérée de manière internationale.

### B. Moteur Logistique Mondial & Rôles
- **3 Profils Utilisateurs Principaux gérés :** Clients (Acheteurs), Vendeurs, et Livreurs (Transporteurs).
- Dashboard spécifique implémenté pour les Livreurs (`livreur-dashboard`).
- **Annuaire des Livreurs (`/livreurs`) :** Un client peut chercher un livreur de confiance de manière indépendante.
- **Livraison Indépendante (Custom Deliveries) :** Un client peut commander une expédition de marchandise directement à un transporteur local ou international via un formulaire sans passer par un produit spécifique.

### C. Colisage et Tracking GPS Temps Réel
- Création du système de **Tracking GPS `delivery_tracking`** via Map interactive publique (utilisant **Leaflet** / OpenStreetMap).
- Le client comme le vendeur peuvent suivre le livreur en temps réel sur une carte via les ID de suivi (`/client-dashboard/tracker/[id]`).

### D. Optimisations Base de Données (Supabase)
- Toutes les politiques RLS, triggers de notifications, tables liées à la création de la logistique et au temps réel ont été regroupées en un seul fichier SQL d'initiation.
- **Fichier de référence (SQL) :** `sql_scripts/v6_final_all_updates_today.sql` (Peut être joué sans risque grâce aux conditions `IF NOT EXISTS`).

## 3. Déploiement Vercel & Nettoyage
- Pour économiser les "tokens", les builds TypeScript (`npm run build`)  et le Linting ont été validés localement avant d'être envoyés sur le nouveau dépôt `msm-hub`.
- L'ancien historique Git rempli de tokens a été écrasé. Seule la base de code "msm-hub" finale a été poussée proprement (Sans secret exposé).
- L'application peut être déployée facilement en "one-click" depuis Vercel.

## 4. Prochaines Étapes Suggérées (Post V6)
- Ajouter l'interface d'administration centrale super-admin (Dashboard Administrateur MSM Hub pour récolter les frais de commissions).
- Connexion concrète aux Webhooks Stripe/PayPal pour passer de "Simulation" à "Production" lorsque les clés API officielles de l'entreprise seront prêtes.
- Lancer le projet sur Vercel avec l'URL en .dz.

> ⚠️ Note pour les futurs déploiements: 
> Pensez toujours à exécuter `npm run build` localement pour vérifier les erreurs TypeScript strictes liées aux jointures de tables Supabase (ex: variables contenant des objets imbriqués) avant de redemander un déploiement Vercel.
