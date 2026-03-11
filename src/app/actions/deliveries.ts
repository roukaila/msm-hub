'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitCustomDeliveryRequest(formData: FormData) {
    const supabase = await createClient()

    // 1. Vérifier l'utilisateur connecté (le client de la course)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Vous devez être connecté pour demander une course.' }
    }

    const transporterId = formData.get('transporterId') as string
    const pickupAddress = formData.get('pickupAddress') as string
    const dropoffAddress = formData.get('dropoffAddress') as string
    const itemDescription = formData.get('itemDescription') as string
    const estimatedWeight = formData.get('estimatedWeight') as string
    const proposedPrice = formData.get('proposedPrice')

    if (!transporterId || !pickupAddress || !dropoffAddress || !itemDescription) {
        return { error: 'Tous les champs obligatoires (Lieu de départ, destination, description) doivent être remplis.' }
    }

    try {
        // 2. Insérer la demande dans la table `custom_deliveries`
        const { error: insertError } = await supabase
            .from('custom_deliveries')
            .insert([
                {
                    client_id: user.id,
                    transporter_id: transporterId,
                    pickup_address: pickupAddress,
                    dropoff_address: dropoffAddress,
                    item_description: itemDescription,
                    estimated_weight: estimatedWeight,
                    proposed_price: proposedPrice ? parseFloat(proposedPrice as string) : null
                }
            ])

        if (insertError) throw insertError

        // 3. Notifier le transporteur (Livreur)
        // Récupérer le nom du client pour le message
        const { data: clientProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

        await supabase.from('notifications').insert([
            {
                user_id: transporterId,
                title: 'Nouvelle demande de transport',
                message: `${clientProfile?.full_name || 'Un client'} vient de vous solliciter pour une nouvelle livraison indépendante.`,
                is_read: false
            }
        ])

        revalidatePath('/livreurs')
        return { success: true }

    } catch (err: any) {
        console.error("Erreur lors de la demande de course:", err.message)
        return { error: "Une erreur est survenue lors de l'enregistrement de votre demande." }
    }
}

export async function updateCustomDeliveryStatus(deliveryId: string, newStatus: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non autorisé' }

    // Obtenir les infos de la delivery
    const { data: delivery } = await supabase.from('custom_deliveries').select('client_id, transporter_id').eq('id', deliveryId).single()
    if (!delivery) return { error: 'Course introuvable' }

    // Mettre à jour
    const { error } = await supabase
        .from('custom_deliveries')
        .update({ status: newStatus })
        .eq('id', deliveryId)

    if (error) {
        return { error: "Erreur lors de la mise à jour." }
    }

    // Notifier le client (ou le livreur si c'est le client qui annule)
    const targetUserId = user.id === delivery.client_id ? delivery.transporter_id : delivery.client_id

    let message = ''
    if (newStatus === 'accepted') message = "Votre demande de transport a été acceptée par le livreur !"
    if (newStatus === 'rejected') message = "Votre demande de transport a été refusée par le livreur."

    if (message) {
        await supabase.from('notifications').insert([
            {
                user_id: targetUserId,
                title: 'Mise à jour de votre course',
                message: message,
                is_read: false
            }
        ])
    }

    revalidatePath('/livreur-dashboard')
    revalidatePath('/client-dashboard')

    return { success: true }
}
