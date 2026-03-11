-- =========================================================================
-- FICHIER GLOBAL DE MISE À JOUR DE LA BASE DE DONNÉES (SUPABASE)
-- VERSION 2 : MARKETPLACE MSM-CONSEILS (Algérie)
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- -------------------------------------------------------------------------
-- 0. CRÉATION DES TABLES DE BASE (Si absentes de la Phase 1)
-- -------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    role text DEFAULT 'client', -- 'admin', 'vendeur', 'client'
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- SKILL 1 : COMMISSIONS & ABONNEMENTS
-- -------------------------------------------------------------------------

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_vendeur') THEN
        ALTER TABLE profiles ADD COLUMN plan_vendeur text DEFAULT 'standard';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='commission_rate') THEN
        ALTER TABLE profiles ADD COLUMN commission_rate numeric DEFAULT 0.10;
    END IF;
END $$;

-- Table d'historique des abonnements
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    price_dzd numeric NOT NULL,
    start_date timestamp with time zone DEFAULT now(),
    end_date timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vendeurs peuvent voir leurs propres abonnements" ON public.vendor_subscriptions;
CREATE POLICY "Vendeurs peuvent voir leurs propres abonnements"
ON public.vendor_subscriptions FOR SELECT
USING ( auth.uid() = vendor_id );


-- -------------------------------------------------------------------------
-- SKILL 2 : PUBLICITÉ INTERNE & MISE EN AVANT
-- -------------------------------------------------------------------------

-- Table pour l'achat de crédits publicitaires
CREATE TABLE IF NOT EXISTS public.vendor_ad_credits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance_dzd numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ajout des champs de sponsorisation aux produits
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_sponsored') THEN
        ALTER TABLE products ADD COLUMN is_sponsored boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sponsor_end_date') THEN
        ALTER TABLE products ADD COLUMN sponsor_end_date timestamp with time zone;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ad_views') THEN
        ALTER TABLE products ADD COLUMN ad_views integer DEFAULT 0;
    END IF;
END $$;


-- -------------------------------------------------------------------------
-- SKILL 5 : MESSAGERIE INTÉGRÉE CLIENT / VENDEUR
-- -------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id uuid, -- optionnel
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres messages" ON public.messages;
CREATE POLICY "Utilisateurs peuvent voir leurs propres messages"
ON public.messages FOR SELECT
USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

DROP POLICY IF EXISTS "Utilisateurs peuvent envoyer un message" ON public.messages;
CREATE POLICY "Utilisateurs peuvent envoyer un message"
ON public.messages FOR INSERT
WITH CHECK ( auth.uid() = sender_id );

-- IMPORTANT : Activez REPLICATION sur la table des messages pour SUPABASE REALTIME
-- (S'assurer que Realtime est activé dans le dashboard Supabase UI pour cette table)
-- Supabase Cloud SQL Editor can sometimes fail if the publication already has the table, so we handle it gracefully:
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
EXCEPTION WHEN OTHERS THEN
   -- Ignore error if publication doesn't exist or already added in some contexts
END;
$$;
