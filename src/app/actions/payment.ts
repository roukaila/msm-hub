'use server'

import { createClient } from '@/utils/supabase/server'

export async function confirmPayment(orderId: string) {
    const supabase = await createClient()

    try {
        // 1. Mettre à jour la table orders (si on avait un payment_status on le mettrait à 'paid')
        // Ici on suppose que le succès du paiement valide la commande.

        // 2. Mettre à jour order_items de "en attente de paiement" -> "en attente" (prêt à être traité par le vendeur)
        const { error: itemsError } = await supabase
            .from('order_items')
            .update({ status: 'en attente' })
            .eq('order_id', orderId)

        if (itemsError) throw itemsError

        return { success: true }
    } catch (err: any) {
        console.error("Erreur confirmation paiement:", err.message)
        return { error: "Erreur lors de la validation." }
    }
}
