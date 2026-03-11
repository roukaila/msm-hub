-- =========================================================================
-- MISE À JOUR BASE DE DONNÉES (V3) : NOUVELLES FONCTIONNALITÉS
-- A EXECUTER DANS L'EDITEUR SQL DE SUPABASE
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. PROFILES : Ajouter Nom de l'entreprise et Téléphone
-- -------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE profiles ADD COLUMN phone text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company_name') THEN
        ALTER TABLE profiles ADD COLUMN company_name text;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 2. PRODUCTS : Ajouter Tableau d'URLs pour médias multiples
-- -------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='media_urls') THEN
        ALTER TABLE products ADD COLUMN media_urls jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 3. MESSAGES : Ajouter Pièces jointes (Fichiers, Images, Vidéos)
-- -------------------------------------------------------------------------
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='attachment_url') THEN
        ALTER TABLE messages ADD COLUMN attachment_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='attachment_type') THEN
        -- 'image', 'video', 'document'
        ALTER TABLE messages ADD COLUMN attachment_type text;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- 4. STORAGE BUCKETS (product-images & message_attachments)
-- -------------------------------------------------------------------------

-- Create product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'product-images', 'product-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'product-images'
);

-- Policies for product-images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-images' AND auth.uid() = owner );

-- Create message_attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'message_attachments', 'message_attachments', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'message_attachments'
);

-- Policies for message_attachments
DROP POLICY IF EXISTS "Public Access message_attachments" ON storage.objects;
CREATE POLICY "Public Access message_attachments"
ON storage.objects FOR SELECT
USING ( bucket_id = 'message_attachments' );

DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'message_attachments' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users can delete their own attachments" ON storage.objects;
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
USING ( bucket_id = 'message_attachments' AND auth.uid() = owner );
