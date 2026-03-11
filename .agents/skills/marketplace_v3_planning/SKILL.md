---
name: marketplace_v3_planning
description: Mémoire et contexte de fin de Version 2 pour préparer le développement de la Version 3 selon le PRD.
---

# Contexte du Projet Stitsh (Marketplace MSM-Conseils)

> **Ce document agit comme mémoire (contexte persistant) pour l'agent Antigravity. À lire avant de commencer toute nouvelle tâche pour la V3.**

## État de l'Art : Version 2 Complétée
La session précédente a permis l'implémentation complète de la **Version 2** de la marketplace. Voici ce qui a été réalisé et validé :

1. **Skill 1 (Commissions & Abonnements) :** Logique de prélèvement et structure DB `vendor_subscriptions` et `profiles.plan_vendeur`.
2. **Skill 2 (Publicité Interne) :** Structure pour sponsoriser des produits (`is_sponsored`, crédits de publicité).
3. **Skill 3 (Analytics Vendeur) :** Pages de statistiques vendeurs avec taux de conversion et vue des revenus.
4. **Skill 4 (Interface 3D Premium) :** Intégration avancée du Design Stitsh (Dark & Emerald), animations de cartes (tilt 3D), glows, et éléments flottants (sans librairie lourde).
5. **Skill 5 (Messagerie) :** Base de la messagerie temps réel et de son historique entre client et vendeur.

## Défis Techniques Surmontés (Important !)
Le site devait être déployé sur **Hostinger (Hébergement Mutualisé pur)** ne supportant pas NodeJS en backend. Nous avons dû exporter l'application en mode **HTML Statique** (`output: 'export'`), ce qui implique :

- **Attribut Next.js :** `trailingSlash: true` ajouté dans `next.config.ts` pour générer des `/index.html` dans les dossiers et éviter les erreurs 404 sur Hostinger.
- **Server Actions Retraits :** Désactivation des fonctions `use server` (ex: `auth.ts`, `supabase/server.ts`) car non supportées par l'export statique. Si besoin d'appels BDD demain, utilisez le client Supabase standard (`supabase/client.ts`).
- **Hydration Errors Zustand :** Le store Zustand (`cartStore.ts`) utilise le cache *LocalStorage*. Cela faisait planter le React au chargement sur un site statique (Mismatch entre le rendu HTML vide et les données chargées côté client).
  * **Solution applicable :** Toujours emballer les renders conditionnels indexés sur le store Zustand dans un `useEffect` (`isMounted`). Code exemple à respecter dans tout ajout futur :
    ```tsx
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    if (!isMounted) return null; // Prévention de l'Hydration Error
    ```

## Objectif pour Demain : Version 3
La méthodologie de travail ("Groupe d'Experts & Robot") continuera. Il faudra procéder exactement de la **même manière** :
1. Lire le PRD (Skill `marketplace_prd`) pour la V3.
2. Découper la V3 en "Skills" (Sous-tâches 1, 2, 3...) documentés dans `task.md`.
3. Valider un Skill, le tester exhaustivement (mockup local, build, RLS, etc.), puis consulter l'utilisateur avant le prochain.

> **MISE À JOUR IMPORTANTE (Préparation V3 du 06 Mars) :**
> - **Changement de Serveur** : Abandon de l'export statique pour Hostinger. Le projet vise désormais **Vercel**. Le fichier `next.config.ts` a été modifié (retrait de `output: 'export'`) pour réactiver toute la puissance de Next.js (Server Actions, SSR).
> - **Dépôt GitHub** : Le projet a été initialisé et poussé de force sur un nouveau dépôt privé nommé `msm-mimouni-marketplace`.
> - **Roadmap V3 (Les 6 Skills à implémenter)** :
>   * **Skill 6 :** Configuration & Déploiement Dynamique (Vercel)
>   * **Skill 7 :** Catalogue & Recherche Avancée (Filtres)
>   * **Skill 8 :** Panier & Processus de Commande (Checkout avec Cash on Delivery)
>   * **Skill 9 :** Dashboard Client (Historique des achats)
>   * **Skill 10 :** Gestion des Commandes Vendeur (Mise à jour des statuts)
>   * **Skill 11 :** Système d'Avis et d'Évaluation (Reviews étoilés)

**Commencez la prochaine session par le *Skill 6* (ou celui demandé par l'utilisateur) en vous basant stricto sensu sur ce document et les 6 compétences définies ci-dessus.**
