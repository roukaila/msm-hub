'use client'

import React, { useState, useTransition } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitCustomDeliveryRequest } from '@/app/actions/deliveries'

export default function DemandeCoursePage({ params }: { params: { id: string } }) {
    const transporterId = params.id
    const router = useRouter()

    const [isPending, startTransition] = useTransition()
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')

        const formData = new FormData(e.currentTarget)
        formData.append('transporterId', transporterId)

        startTransition(async () => {
            const result = await submitCustomDeliveryRequest(formData)

            if (result?.error) {
                setErrorMsg(result.error)
            } else if (result?.success) {
                setSuccessMsg('Votre demande a bien été envoyée au transporteur !')
                setTimeout(() => {
                    router.push('/client-dashboard') // Rediriger le client vers son tableau de bord
                }, 2000)
            }
        })
    }

    return (
        <main className="min-h-screen bg-dark-bg text-white">
            <Navbar />

            <div className="pt-32 pb-16 px-6 md:px-12 max-w-3xl mx-auto">
                <Link href="/livreurs" className="text-sm text-primary-emerald hover:underline mb-8 inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Retour à l'annuaire
                </Link>

                <div className="glass-morphism rounded-3xl p-8 md:p-12 premium-shadow border border-zinc-800">
                    <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                        Demande de Transport Libre
                    </h1>
                    <p className="text-zinc-400 mb-8">
                        Remplissez ce formulaire pour proposer une course à ce livreur. Il décidera d'accepter ou de négocier le tarif.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {errorMsg && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-primary-emerald text-sm font-medium">
                                {successMsg}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Lieu d'enlèvement (Départ)</label>
                                <input
                                    type="text"
                                    name="pickupAddress"
                                    required
                                    disabled={isPending || !!successMsg}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50"
                                    placeholder="Ex: Alger Centre..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Lieu de livraison (Arrivée)</label>
                                <input
                                    type="text"
                                    name="dropoffAddress"
                                    required
                                    disabled={isPending || !!successMsg}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50"
                                    placeholder="Ex: Oran..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">Description de la marchandise</label>
                            <textarea
                                name="itemDescription"
                                required
                                disabled={isPending || !!successMsg}
                                rows={3}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50"
                                placeholder="Que souhaitez-vous transporter ? Dimensions, fragilité..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Poids estimé (Optionnel)</label>
                                <input
                                    type="text"
                                    name="estimatedWeight"
                                    disabled={isPending || !!successMsg}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50"
                                    placeholder="Ex: Moins de 5kg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix proposé (DA) (Optionnel)</label>
                                <input
                                    type="number"
                                    name="proposedPrice"
                                    disabled={isPending || !!successMsg}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50"
                                    placeholder="Laissez vide pour obtenir un devis"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || !!successMsg}
                            className="w-full mt-6 bg-primary-emerald hover:bg-emerald-400 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                "Envoyer la demande"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
