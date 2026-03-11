-- =========================================================================
-- MISE A JOUR V4 : TABLES DES COMMANDES ET ARTICLES DE COMMANDE
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- 1. Table principale des commandes (orders)
--    Chaque commande appartient à un client (acheteur).
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    total_amount numeric NOT NULL,
    shipping_address text,
    payment_method text DEFAULT 'cod', -- cash on delivery
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. Table des articles de commande (order_items)
--    Relie une commande à plusieurs produits et aux vendeurs respectifs.
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    vendor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE, -- Pour filtrer facilement côté tableau de bord vendeur
    product_name text NOT NULL, -- Sauvegardé au cas où le produit est supprimé plus tard
    quantity integer DEFAULT 1,
    unit_price numeric NOT NULL,
    status text DEFAULT 'en attente', -- 'en attente', 'expédiée', 'livrée', 'annulée' (Géré par le vendeur)
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- POLITIQUES DE SECURITE (RLS)
-- -------------------------------------------------------------------------

-- Les clients peuvent voir uniquement LAURS commandes globales
DROP POLICY IF EXISTS "Clients peuvent voir leurs commandes" ON public.orders;
CREATE POLICY "Clients peuvent voir leurs commandes" ON public.orders FOR SELECT USING (auth.uid() = client_id);

-- Les clients peuvent créer le panier (checkout)
DROP POLICY IF EXISTS "Clients peuvent créer une commande" ON public.orders;
CREATE POLICY "Clients peuvent créer une commande" ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);

-- -------------------------------------------------------------------------

-- Les clients peuvent voir les articles de LEURS commandes
DROP POLICY IF EXISTS "Clients peuvent voir les articles de leurs commandes" ON public.order_items;
CREATE POLICY "Clients peuvent voir les articles de leurs commandes" ON public.order_items FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders WHERE client_id = auth.uid())
);

-- Les clients insèrent les articles lors du checkout
DROP POLICY IF EXISTS "Clients peuvent insérer des détails de commande" ON public.order_items;
CREATE POLICY "Clients peuvent insérer des détails de commande" ON public.order_items FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM public.orders WHERE client_id = auth.uid())
);

-- Les vendeurs peuvent VOIR UNIQUEMENT les articles qui LEUR ont été commandés
DROP POLICY IF EXISTS "Vendeurs voient leurs ventes" ON public.order_items;
CREATE POLICY "Vendeurs voient leurs ventes" ON public.order_items FOR SELECT USING (auth.uid() = vendor_id);

-- Les vendeurs peuvent MODIFIER L'ETAT (status) des articles qui LEUR appartiennent
DROP POLICY IF EXISTS "Vendeurs modifient le statut" ON public.order_items;
CREATE POLICY "Vendeurs modifient le statut" ON public.order_items FOR UPDATE USING (auth.uid() = vendor_id) WITH CHECK (auth.uid() = vendor_id);
