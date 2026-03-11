'use server'

import { createClient } from '@/utils/supabase/server'
import { CartItem } from '@/store/cartStore'

export async function placeOrder(formData: FormData, cartItems: CartItem[], totalAmount: number, requiresDelivery: boolean = true) {
    const supabase = await createClient()

    // 1. Récupérer l'utilisateur connecté (le client)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Vous devez être connecté pour passer une commande.' }
    }

    if (!cartItems || cartItems.length === 0) {
        return { error: 'Votre panier est vide.' }
    }

    // Extraction de l'adresse et de la méthode de paiement depuis le formData
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const wilaya = formData.get('wilaya') as string
    const commune = formData.get('commune') as string
    const addressDetails = formData.get('address') as string
    const paymentMethod = formData.get('paymentMethod') as string || 'cod'

    const fullAddress = `${fullName} - ${phone} - ${addressDetails}, ${commune}, Wilaya: ${wilaya}`

    try {
        // Calcul "fictif" des frais de livraison si demandé (ex: 500 DA, 0 sinon)
        const deliveryFee = requiresDelivery ? 500 : 0
        const finalAmount = totalAmount + deliveryFee

        // 2. Insérer dans la table `orders` (Panier global du client)
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    client_id: user.id,
                    total_amount: finalAmount,
                    shipping_address: requiresDelivery ? fullAddress : 'Retrait en magasin / Point relais',
                    payment_method: paymentMethod, // 'cod' ou 'cib'
                    requires_delivery: requiresDelivery,
                    delivery_fee: deliveryFee
                }
            ])
            .select('id')
            .single()

        if (orderError) throw orderError

        const orderId = orderData.id

        // 3. Préparer les articles pour la table `order_items`
        const orderItemsToInsert = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.id,
            vendor_id: item.vendorId, // Important pour le Dashboard Vendeur
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.priceDZD,
            status: paymentMethod !== 'cod' ? 'en attente de paiement' : 'en attente'
        }))

        // 4. Insérer dans la table `order_items`
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert)

        if (itemsError) throw itemsError

        // 4.5. Générer une notification pour chaque vendeur
        const notificationsToInsert = cartItems.map(item => ({
            user_id: item.vendorId, // Le destinataire est le vendeur
            title: 'Nouvelle Commande !',
            message: `Vous avez reçu une commande pour : ${item.name} (${item.quantity}x) d'une valeur de ${item.priceDZD * item.quantity} DA.`,
            is_read: false
        })).filter(n => n.user_id) // Sécurité si un produit n'a pas de vendorId

        if (notificationsToInsert.length > 0) {
            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notificationsToInsert)

            if (notifError) console.error("Erreur insertion notifications vendeurs:", notifError)
        }

        // 5. Logique de paiement
        // 5. Logique de paiement
        if (paymentMethod === 'cib') {
            // C'est ici que l'appel API Chargily V2 "réel" est censé être fait :
            // const chargilyResponse = await fetch('https://pay.chargily.net/test/api/v2/checkouts', { ... })
            // return { checkoutUrl: chargilyResponse.checkout_url }

            // Redirection vers notre simulation locale en attentant les vraies clés
            return { checkoutUrl: `/checkout/paiement/simulation?order_id=${orderId}&amount=${totalAmount}` }
        } else if (paymentMethod === 'stripe') {
            // Logique Stripe (idéalement via @stripe/stripe-js)
            // Pour l'instant, on redirige vers une simulation UI Stripe
            return { checkoutUrl: `/checkout/paiement/stripe?order_id=${orderId}&amount=${totalAmount}` }
        } else if (paymentMethod === 'paypal') {
            // Logique PayPal (via @paypal/checkout-server-sdk ou direct API)
            // Simulation PayPal UI
            return { checkoutUrl: `/checkout/paiement/paypal?order_id=${orderId}&amount=${totalAmount}` }
        }

        return { success: true }
    } catch (err: any) {
        console.error("Erreur lors de la création de la commande:", err.message)
        return { error: "Une erreur est survenue lors de l'enregistrement de votre commande." }
    }
}
