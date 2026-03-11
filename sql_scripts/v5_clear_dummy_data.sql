-- =========================================================================
-- NETTOYAGE DES DONNEES FICTIVES (PREPARATION PRODUCTION)
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- Cette commande vide toutes les tables liées aux produits et commandes
-- Le mot-clé CASCADE permet de vider également les tables dépendantes
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.products CASCADE;

-- Optionnel: Si vous souhaitez retirer les abonnements et pubs des vendeurs fictifs
-- TRUNCATE TABLE public.vendor_subscriptions CASCADE;
-- TRUNCATE TABLE public.advertising_credits CASCADE;

-- Note : Nous ne supprimons pas les utilisateurs (auth.users) ni les profils (public.profiles)
-- pour que vous puissiez garder votre compte admin/vendeur de test. 
-- Si vous souhaitez VRAIMENT tout supprimer (y compris les utilisateurs), exécutez la ligne ci-dessous (ATTENTION!)
-- TRUNCATE TABLE auth.users CASCADE;
