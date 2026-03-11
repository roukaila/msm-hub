-- Table notifications pour la messagerie système in-app
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS sur les notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs notifications (pour les marquer comme lues)
CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Politique d'insertion pour le service de l'application (les actions serveurs peuvent insérer en contournant la RLS si service_role, ou via le profil courant pour tester)
-- Nous autorisons l'insertion globale pour simplifier, c'est l'API backend qui s'en occupe
CREATE POLICY "Anyone can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- Activer le Realtime pour la table notifications afin que la cloche s'anime instantanément
alter publication supabase_realtime add table public.notifications;
