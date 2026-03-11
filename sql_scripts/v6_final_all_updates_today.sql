-- ==========================================
-- SCRIPT DE MISE À JOUR GLOBAL - PHASES 5 & 6
-- ==========================================
-- NOTE: Ce script est idempotent, vous pouvez l'exécuter plusieurs fois sans erreur.

-- -----------------------------------------------------------------------------
-- 1. Table des notifications (Phase 5.2)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Anyone can insert notifications') THEN
        -- Autorisation globale d'insertion pour simplifier les notifications depuis le front/back
        CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 2. Mise à jour de la table profiles (Phase 6.1)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Algérie',
ADD COLUMN IF NOT EXISTS company_id TEXT;

-- -----------------------------------------------------------------------------
-- 3. Mise à jour de la table orders pour la livraison (Phase 6.3)
-- -----------------------------------------------------------------------------
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transporter_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC(10, 7);

-- Contournement pour ajouter une contrainte CHECK dynamiquement sur une colonne existante
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_status') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled'));
    END IF;
END
$$;


-- -----------------------------------------------------------------------------
-- 4. Table pour les livraisons indépendantes : Colisage Direct (Phase 6.4)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.custom_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    item_description TEXT NOT NULL,
    estimated_weight TEXT,
    proposed_price NUMERIC(10, 2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_transit', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.custom_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_deliveries' AND policyname = 'Clients can view their custom deliveries') THEN
        CREATE POLICY "Clients can view their custom deliveries" ON public.custom_deliveries FOR SELECT USING (auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_deliveries' AND policyname = 'Transporters can view their custom deliveries') THEN
        CREATE POLICY "Transporters can view their custom deliveries" ON public.custom_deliveries FOR SELECT USING (auth.uid() = transporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_deliveries' AND policyname = 'Clients can insert custom deliveries') THEN
        CREATE POLICY "Clients can insert custom deliveries" ON public.custom_deliveries FOR INSERT WITH CHECK (auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_deliveries' AND policyname = 'Involved parties can update custom deliveries') THEN
        CREATE POLICY "Involved parties can update custom deliveries" ON public.custom_deliveries FOR UPDATE USING (auth.uid() IN (client_id, transporter_id));
    END IF;
END
$$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_custom_deliveries_modtime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_custom_deliveries_modtime ON public.custom_deliveries;
CREATE TRIGGER trigger_custom_deliveries_modtime
    BEFORE UPDATE ON public.custom_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_deliveries_modtime();

-- -----------------------------------------------------------------------------
-- 5. Table de Tracking GPS Temps Réel (Phase 6.5)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reference_id TEXT NOT NULL, 
    reference_type TEXT NOT NULL CHECK (reference_type IN ('marketplace', 'custom')),
    transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_reference ON public.delivery_tracking(reference_id, reference_type);

ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_tracking' AND policyname = 'Les clients voient leur tracking') THEN
        CREATE POLICY "Les clients voient leur tracking" ON public.delivery_tracking FOR SELECT USING (auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_tracking' AND policyname = 'Les transporteurs voient leur tracking') THEN
        CREATE POLICY "Les transporteurs voient leur tracking" ON public.delivery_tracking FOR SELECT USING (auth.uid() = transporter_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_tracking' AND policyname = 'Les transporteurs peuvent mettre a jour') THEN
        CREATE POLICY "Les transporteurs peuvent mettre a jour" ON public.delivery_tracking FOR ALL USING (auth.uid() = transporter_id);
    END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 6. Activation de la synchronisation Temps Réel (Supabase Realtime)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        alter publication supabase_realtime add table public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL; END;
    
    BEGIN
        alter publication supabase_realtime add table public.delivery_tracking;
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL; END;
END
$$;
