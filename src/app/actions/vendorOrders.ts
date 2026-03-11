'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderItemId: string, newStatus: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Non autorisé" }

    // RLS garantit que le vendeur ne peut modifier que SES lignes
    const { data: itemData, error } = await supabase
        .from('order_items')
        .update({ status: newStatus })
        .eq('id', orderItemId)
        .eq('vendor_id', user.id) // Double sécurité
        .select('order_id, product_name')
        .single()

    if (error) {
        console.error("Erreur mise à jour statut:", error.message)
        return { error: "Erreur lors de la mise à jour." }
    }

    // 2. Récupérer le client pour la notification
    if (itemData) {
        const { data: orderData } = await supabase
            .from('orders')
            .select('client_id')
            .eq('id', itemData.order_id)
            .single()

        if (orderData?.client_id) {
            await supabase.from('notifications').insert({
                user_id: orderData.client_id,
                title: 'Suivi de commande',
                message: `L'article "${itemData.product_name}" est passé au statut : ${newStatus}.`,
                is_read: false
            })
        }
    }

    // Rafraîchir la page des commandes du vendeur
    revalidatePath('/dashboard/commandes')
    return { success: true }
}
