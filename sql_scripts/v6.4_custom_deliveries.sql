-- Création de la table pour les livraisons indépendantes (Colisage Direct)

CREATE TABLE IF NOT EXISTS public.custom_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    transporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    item_description TEXT NOT NULL,
    estimated_weight TEXT,
    proposed_price NUMERIC(10, 2), -- Le client peut proposer un prix ou le livreur fixe le sien
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_transit', 'delivered', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.custom_deliveries ENABLE ROW LEVEL SECURITY;

-- Le client peut voir ses propres demandes
CREATE POLICY "Clients can view their custom deliveries"
    ON public.custom_deliveries FOR SELECT
    USING (auth.uid() = client_id);

-- Le livreur peut voir les demandes qui lui sont adressées
CREATE POLICY "Transporters can view their custom deliveries"
    ON public.custom_deliveries FOR SELECT
    USING (auth.uid() = transporter_id);

-- Le client peut créer une demande
CREATE POLICY "Clients can insert custom deliveries"
    ON public.custom_deliveries FOR INSERT
    WITH CHECK (auth.uid() = client_id);

-- Les deux parties peuvent mettre à jour (ex: changer le statut, le prix)
CREATE POLICY "Involved parties can update custom deliveries"
    ON public.custom_deliveries FOR UPDATE
    USING (auth.uid() IN (client_id, transporter_id));

-- Fonction de mise à jour du updated_at (optionnelle mais recommandée)
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

-- On peut aussi injecter une notification automatiquement quand le statut change, mais on le fera via les Server Actions pour l'instant.
