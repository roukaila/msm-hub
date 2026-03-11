-- Script SQL pour la Phase 6.5 (Tracking GPS)

-- 1. Création de la table de tracking
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reference_id TEXT NOT NULL, -- UUID pour custom_deliveries, ou chaîne 'ORD-...' pour orders
    reference_type TEXT NOT NULL CHECK (reference_type IN ('marketplace', 'custom')),
    transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour accélérer la recherche par référence
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_reference ON public.delivery_tracking(reference_id, reference_type);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS

-- Les clients peuvent voir le tracking de leurs propres courses
CREATE POLICY "Les clients voient leur tracking"
    ON public.delivery_tracking
    FOR SELECT
    USING (auth.uid() = client_id);

-- Les transporteurs peuvent voir leur propre tracking (utile pour debug)
CREATE POLICY "Les transporteurs voient leur tracking"
    ON public.delivery_tracking
    FOR SELECT
    USING (auth.uid() = transporter_id);

-- Seul le transporteur de la course peut insérer/mettre à jour sa position
CREATE POLICY "Les transporteurs peuvent mettre à jour la position"
    ON public.delivery_tracking
    FOR ALL
    USING (auth.uid() = transporter_id);

-- 4. Activer Supabase Realtime pour la table `delivery_tracking`
-- Cela permet aux clients d'écouter les variations de (latitude, longitude) en direct
alter publication supabase_realtime add table public.delivery_tracking;
