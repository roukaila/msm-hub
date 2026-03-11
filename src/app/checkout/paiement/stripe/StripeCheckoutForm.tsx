'use client'

import { useState, useTransition } from 'react'
import { confirmPayment } from '@/app/actions/payment'
import { useRouter } from 'next/navigation'

export default function StripeCheckoutForm({ orderId }: { orderId: string }) {
    const [isPending, startTransition] = useTransition()
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')

        // Simulation d'un traitement Stripe
        startTransition(async () => {
            // Fake delay pour le réalisme
            await new Promise((resolve) => setTimeout(resolve, 2000))

            const result = await confirmPayment(orderId)

            if (result?.error) {
                setErrorMsg(result.error)
            } else if (result?.success) {
                setSuccessMsg('Paiement Stripe réussi ! Redirection...')
                setTimeout(() => {
                    router.push('/checkout/success?status=paid_stripe')
                }, 1500)
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100 flex items-center gap-2 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    {successMsg}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail</label>
                <input
                    type="email"
                    required
                    disabled={isPending || !!successMsg}
                    className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF] transition-all disabled:opacity-50"
                    placeholder="vous@exemple.com"
                />
            </div>

            <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Informations de la carte</label>
                <div className="bg-white border text-black border-zinc-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#635BFF]/50 focus-within:border-[#635BFF] transition-all">
                    <div className="border-b border-zinc-200">
                        <input
                            type="text"
                            required
                            disabled={isPending || !!successMsg}
                            className="w-full px-3 py-2 text-black focus:outline-none bg-transparent disabled:opacity-50"
                            placeholder="Numéro de carte"
                        />
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            required
                            disabled={isPending || !!successMsg}
                            className="w-1/2 px-3 py-2 text-black focus:outline-none bg-transparent border-r border-zinc-200 disabled:opacity-50"
                            placeholder="MM / AA"
                        />
                        <input
                            type="text"
                            required
                            disabled={isPending || !!successMsg}
                            className="w-1/2 px-3 py-2 text-black focus:outline-none bg-transparent disabled:opacity-50"
                            placeholder="CVC"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nom sur la carte</label>
                <input
                    type="text"
                    required
                    disabled={isPending || !!successMsg}
                    className="w-full bg-white border border-zinc-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#635BFF]/50 focus:border-[#635BFF] transition-all disabled:opacity-50"
                />
            </div>

            <button
                type="submit"
                disabled={isPending || !!successMsg}
                className="w-full mt-6 bg-[#635BFF] hover:bg-[#5851e5] text-white font-semibold py-3 px-4 rounded-md transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
            >
                {isPending ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Traitement...
                    </>
                ) : (
                    "Payer"
                )}
            </button>
            <p className="text-xs text-center text-zinc-500 mt-4 flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
                Paiement sécurisé par simulation Stripe
            </p>
        </form>
    )
}
