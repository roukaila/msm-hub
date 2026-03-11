"use client";

import { useCartStore } from '@/store/cartStore'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { useState, useEffect, useTransition } from 'react'
import { placeOrder } from '@/app/actions/order'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
    const { items, getCartTotal, clearCart } = useCartStore()
    const [isSuccess, setIsSuccess] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const [isPending, startTransition] = useTransition()
    const [errorMsg, setErrorMsg] = useState('')
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'cib' | 'stripe' | 'paypal'>('cod')
    const [requiresDelivery, setRequiresDelivery] = useState<boolean>(true)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await placeOrder(formData, items, getCartTotal(), requiresDelivery)
            if (result?.error) {
                setErrorMsg(result.error)
            } else if (result?.checkoutUrl) {
                // Redirection vers la passerelle de paiement (simulation ou réelle)
                clearCart() // Vider le panier avant de partir
                router.push(result.checkoutUrl)
            } else if (result?.success) {
                setIsSuccess(true)
                clearCart()
            }
        })
    }

    if (!isMounted) {
        return (
            <main className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-zinc-800 border-t-primary-emerald rounded-full animate-spin"></div>
                    <p className="text-zinc-400 font-medium tracking-wide">Chargement du panier...</p>
                </div>
            </main>
        )
    }

    if (isSuccess) {
        return (
            <main className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
                <div className="glass-morphism rounded-3xl p-8 premium-shadow text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-primary-emerald/20 flex items-center justify-center rounded-full mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-primary-emerald">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Commande Réussie !</h1>
                    <p className="text-zinc-400 mb-8">
                        Votre commande a bien été enregistrée. Vous paierez {getCartTotal().toLocaleString('fr-DZ')} DZD à la livraison.
                    </p>
                    <Link href="/" className="w-full inline-flex justify-center py-4 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow">
                        Retour à l'accueil
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-dark-bg">
            <Navbar />

            <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Formulaire de livraison */}
                <div className="flex-1">
                    <div className="glass-morphism rounded-3xl p-6 md:p-8 premium-shadow">
                        <h2 className="text-2xl font-bold text-white mb-6">Informations de Livraison</h2>

                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            {errorMsg && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="requiresDelivery"
                                        value="true"
                                        checked={requiresDelivery === true}
                                        onChange={() => setRequiresDelivery(true)}
                                        className="w-4 h-4 text-primary-emerald bg-zinc-800 border-zinc-700 focus:ring-primary-emerald focus:ring-1"
                                    />
                                    <span className="text-white font-medium">Je souhaite être livré</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="requiresDelivery"
                                        value="false"
                                        checked={requiresDelivery === false}
                                        onChange={() => setRequiresDelivery(false)}
                                        className="w-4 h-4 text-primary-emerald bg-zinc-800 border-zinc-700 focus:ring-primary-emerald focus:ring-1"
                                    />
                                    <span className="text-white font-medium">Je récupère ma commande moi-même (Pickup)</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nom Complet</label>
                                    <input type="text" name="fullName" required disabled={isPending} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50" placeholder="Ex: Ali Ben..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Téléphone</label>
                                    <input type="tel" name="phone" required disabled={isPending} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50" placeholder="0550..." />
                                </div>
                            </div>

                            {requiresDelivery && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">Wilaya</label>
                                            <select name="wilaya" required={requiresDelivery} disabled={isPending} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald appearance-none disabled:opacity-50">
                                                <option value="">Sélectionner une Wilaya</option>
                                                <option value="16">16 - Alger</option>
                                                <option value="31">31 - Oran</option>
                                                <option value="25">25 - Constantine</option>
                                                <option value="other">Autre Wilaya...</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-300 mb-2">Commune</label>
                                            <input type="text" name="commune" required={requiresDelivery} disabled={isPending} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50" placeholder="Votre commune" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Adresse détaillée</label>
                                        <textarea name="address" required={requiresDelivery} disabled={isPending} rows={3} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50" placeholder="N° de rue, Bâtiment, etc..."></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="text-lg font-bold text-white mb-4">Moyen de paiement</h3>
                                <div className="space-y-3">
                                    <label className={`p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary-emerald bg-primary-emerald/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary-emerald' : 'bg-transparent border border-zinc-500'}`}>
                                                {paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                            </div>
                                            <span className={`font-medium ${paymentMethod === 'cod' ? 'text-white' : 'text-zinc-400'}`}>Paiement à la livraison (Cash)</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-primary-emerald' : 'text-zinc-600'}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </label>

                                    <label className={`p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'cib' ? 'border-primary-emerald bg-primary-emerald/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="paymentMethod" value="cib" checked={paymentMethod === 'cib'} onChange={() => setPaymentMethod('cib')} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${paymentMethod === 'cib' ? 'bg-primary-emerald' : 'bg-transparent border border-zinc-500'}`}>
                                                {paymentMethod === 'cib' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                            </div>
                                            <span className={`font-medium ${paymentMethod === 'cib' ? 'text-white' : 'text-zinc-400'}`}>Paiement en ligne (CIB / Edahabia)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-6 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-bold text-zinc-400 border border-zinc-700">CIB</div>
                                            <div className="w-10 h-6 bg-[#ffdb58]/20 rounded flex items-center justify-center text-[8px] font-bold text-[#ffdb58] border border-[#ffdb58]/50">EDAHABIA</div>
                                        </div>
                                    </label>

                                    <label className={`p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'stripe' ? 'border-primary-emerald bg-primary-emerald/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="paymentMethod" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${paymentMethod === 'stripe' ? 'bg-primary-emerald' : 'bg-transparent border border-zinc-500'}`}>
                                                {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                            </div>
                                            <span className={`font-medium ${paymentMethod === 'stripe' ? 'text-white' : 'text-zinc-400'}`}>Carte Bancaire (Internationale)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-6 bg-[#635BFF]/20 rounded flex items-center justify-center text-[8px] font-bold text-[#635BFF] border border-[#635BFF]/30">STRIPE</div>
                                        </div>
                                    </label>

                                    <label className={`p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-primary-emerald bg-primary-emerald/5' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="paymentMethod" value="paypal" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="hidden" />
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${paymentMethod === 'paypal' ? 'bg-primary-emerald' : 'bg-transparent border border-zinc-500'}`}>
                                                {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                                            </div>
                                            <span className={`font-medium ${paymentMethod === 'paypal' ? 'text-white' : 'text-zinc-400'}`}>PayPal</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-10 h-6 bg-[#00457C]/20 rounded flex items-center justify-center text-[8px] font-bold text-[#0079C1] border border-[#00457C]/30">PAYPAL</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Récapitulatif Panier */}
                <aside className="w-full lg:w-96 shrink-0">
                    <div className="glass-morphism rounded-3xl p-6 md:p-8 premium-shadow sticky top-28">
                        <h2 className="text-xl font-bold text-white mb-6">Récapitulatif</h2>

                        <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 text-sm">
                                    <div className="flex items-center gap-3 w-2/3">
                                        <span className="bg-zinc-800 text-zinc-300 w-6 h-6 rounded flex items-center justify-center text-xs">{item.quantity}x</span>
                                        <span className="text-white truncate">{item.name}</span>
                                    </div>
                                    <span className="text-primary-emerald font-bold shrink-0">{(item.priceDZD * item.quantity).toLocaleString('fr-DZ')} DA</span>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <p className="text-zinc-500 text-sm">Votre panier est vide.</p>
                            )}
                        </div>

                        <div className="border-t border-zinc-800 pt-4 space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Sous-total</span>
                                <span className="text-white font-medium">{getCartTotal().toLocaleString('fr-DZ')} DA</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Frais de livraison</span>
                                <span className="text-zinc-500 italic">Calculé à l'étape suivante</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-zinc-800">
                                <span className="text-lg font-bold text-white">Total</span>
                                <span className="text-2xl font-bold text-primary-emerald">{getCartTotal().toLocaleString('fr-DZ')} DA</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={items.length === 0 || isPending}
                            className="w-full py-4 bg-primary-emerald hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow flex justify-center items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Traitement...
                                </>
                            ) : (
                                "Confirmer la commande"
                            )}
                        </button>
                    </div>
                </aside>

            </div>
        </main>
    )
}
