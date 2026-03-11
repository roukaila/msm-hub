-- Base de données Supabase - Script de mise à jour pour le Skill 1 (Version 2)
-- Gestion des abonnements et de la commission

-- 1. Ajout de colonnes dans la table 'profiles' ou création de la table si elle n'existe pas.
-- (Assumons que 'profiles' existe pour stocker les infos du vendeur)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan_vendeur') THEN
        ALTER TABLE profiles ADD COLUMN plan_vendeur text DEFAULT 'standard';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='commission_rate') THEN
        ALTER TABLE profiles ADD COLUMN commission_rate numeric DEFAULT 0.10;
    END IF;
END $$;

-- 2. Création de la table 'vendor_subscriptions' pour garder l'historique des abonnements
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

-- RLS pour vendor_subscriptions
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendeurs peuvent voir leurs propres abonnements"
ON public.vendor_subscriptions FOR SELECT
USING ( auth.uid() = vendor_id );

-- Notes: L'insertion dans vendor_subscriptions doit être faite via des requêtes sécurisées ou des triggers.
