-- =========================================================================
-- MISE A JOUR V6 : CREATION PRODUITS (IMAGE ET STOCK)
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- 1. Ajout des colonnes image_url et stock à la table products
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
        ALTER TABLE products ADD COLUMN image_url text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
        ALTER TABLE products ADD COLUMN stock integer DEFAULT 0;
    END IF;
END $$;

-- La table messages existe déjà (créée dans V2) et Realtime est activé.

-- 2. Création du Bucket de Stockage pour les images produits
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politiques RLS (Row Level Security) sur le Storage pour les Vendeurs
-- Tout le monde peut lire les images
DROP POLICY IF EXISTS "Public avatars are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Tout le monde peut lire les images produits" ON storage.objects;
CREATE POLICY "Tout le monde peut lire les images produits" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Seuls les utilisateurs authentifiés (les vendeurs dans notre cas) peuvent uploader une image
DROP POLICY IF EXISTS "Les vendeurs peuvent uploader des images" ON storage.objects;
CREATE POLICY "Les vendeurs peuvent uploader des images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- Les vendeurs peuvent supprimer ou modifier les images qu'ils ont uploadées
DROP POLICY IF EXISTS "Les vendeurs peuvent modifier leurs images" ON storage.objects;
CREATE POLICY "Les vendeurs peuvent modifier leurs images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Les vendeurs peuvent supprimer leurs images" ON storage.objects;
CREATE POLICY "Les vendeurs peuvent supprimer leurs images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'product-images' AND auth.uid() = owner);
