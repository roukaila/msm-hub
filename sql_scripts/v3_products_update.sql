-- =========================================================================
-- MISE A JOUR V3 : AJOUT DES NOUVEAUX CHAMPS AU CATALOGUE
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- 1. Ajout du Type de Marché (B2B / B2C / BOTH)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='market_type') THEN
        ALTER TABLE products ADD COLUMN market_type text DEFAULT 'both';
    END IF;
END $$;

-- 2. Ajout du Système d'Évaluation (Skill 11)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='rating') THEN
        ALTER TABLE products ADD COLUMN rating numeric(3,2) DEFAULT 0.00;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='reviews_count') THEN
        ALTER TABLE products ADD COLUMN reviews_count integer DEFAULT 0;
    END IF;
END $$;

-- 3. (Optionnel) Ajout d'une table pour stocker les vrais avis clients liés à Skill 11
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent lire tous les avis
DROP POLICY IF EXISTS "Tout le monde peut lire les avis" ON public.product_reviews;
CREATE POLICY "Tout le monde peut lire les avis" ON public.product_reviews FOR SELECT USING (true);

-- Les clients connectés peuvent laisser un avis
DROP POLICY IF EXISTS "Clients connectés peuvent insérer un avis" ON public.product_reviews;
CREATE POLICY "Clients connectés peuvent insérer un avis" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
