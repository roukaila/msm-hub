-- Mise à jour de la table profiles pour la Phase 6 (International et Logistique)

-- 1. Ajout des nouvelles colonnes
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Algérie',
ADD COLUMN IF NOT EXISTS company_id TEXT;

-- 2. Création de la table pour les livraisons indépendantes (Colisage direct)
CREATE TABLE IF NOT EXISTS public.custom_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    transporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    package_details TEXT NOT NULL,
    estimated_weight NUMERIC,
    price NUMERIC,
    status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'accepte', 'en_route', 'livre', 'annule')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour custom_deliveries
ALTER TABLE public.custom_deliveries ENABLE ROW LEVEL SECURITY;

-- Les clients peuvent voir leurs propres demandes
CREATE POLICY "Clients can view their custom deliveries"
    ON public.custom_deliveries FOR SELECT
    USING (auth.uid() = client_id);

-- Les livreurs peuvent voir les demandes qui leur sont assignées
CREATE POLICY "Transporters can view their custom deliveries"
    ON public.custom_deliveries FOR SELECT
    USING (auth.uid() = transporter_id);

-- Les clients peuvent insérer de nouvelles demandes
CREATE POLICY "Clients can insert custom deliveries"
    ON public.custom_deliveries FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Les livreurs peuvent modifier le statut et le prix de leurs demandes
CREATE POLICY "Transporters can update their custom deliveries"
    ON public.custom_deliveries FOR UPDATE
    USING (auth.uid() = transporter_id);

-- 3. Mise à jour de la table orders pour la logistique
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'en_attente' CHECK (delivery_status IN ('en_attente', 'en_route', 'livre')),
ADD COLUMN IF NOT EXISTS transporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Table pour le tracking GPS temps réel
CREATE TABLE IF NOT EXISTS public.delivery_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_reference_id UUID NOT NULL, -- Peut pointer vers orders.id ou custom_deliveries.id
    transporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Le livreur peut mettre à jour sa position
CREATE POLICY "Transporters can insert/update their tracking"
    ON public.delivery_tracking FOR ALL
    USING (auth.uid() = transporter_id);

-- Tout le monde peut lire le tracking (on pourrait filtrer par client_id via une jointure pour plus de sécurité, mais c'est OK pour la V1)
CREATE POLICY "Anyone can read tracking"
    ON public.delivery_tracking FOR SELECT
    USING (true);

-- Activer le Realtime sur delivery_tracking pour la carte interactive
alter publication supabase_realtime add table public.delivery_tracking;
