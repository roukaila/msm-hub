-- Mise à jour de la table orders pour la Phase 6.3 (Logistique)

-- 1. Ajout des nouvelles colonnes pour gérer la livraison
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS requires_delivery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled')),
ADD COLUMN IF NOT EXISTS transporter_id UUID REFERENCES public.profiles(id);

-- 2. Ajout de colonnes géospatiales simples (si Maps ajouté plus tard)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_lat NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS delivery_lng NUMERIC(10, 7);

-- Commentaire sur les champs
COMMENT ON COLUMN public.orders.requires_delivery IS 'Indique si le client a demandé la livraison (true) ou un retrait (false)';
COMMENT ON COLUMN public.orders.delivery_fee IS 'Frais de livraison appliqués à la commande';
COMMENT ON COLUMN public.orders.delivery_status IS 'Statut de la livraison';
COMMENT ON COLUMN public.orders.transporter_id IS 'ID du profil Livreur assigné à la commande';
