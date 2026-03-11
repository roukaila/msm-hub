'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { confirmPayment } from '@/app/actions/payment'
import { useRouter } from 'next/navigation'

export default function PayPalSimulationPage({
    searchParams,
}: {
    searchParams: { order_id?: string; amount?: string }
}) {
    const orderId = searchParams.order_id || 'INCONNUE'
    const amount = parseInt(searchParams.amount || '0', 10)

    // Taux de conversion fictif (1 EUR = 150 DZD)
    const amountEur = (amount / 150).toFixed(2)

    const [isPending, startTransition] = useTransition()
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const router = useRouter()

    const handlePayPalPayer = () => {
        setErrorMsg('')

        startTransition(async () => {
            // Fake delay pour simuler l'authentification et le paiement PayPal
            await new Promise((resolve) => setTimeout(resolve, 2500))

            const result = await confirmPayment(orderId)

            if (result?.error) {
                setErrorMsg(result.error)
            } else if (result?.success) {
                setSuccessMsg('Paiement PayPal effectué avec succès !')
                setTimeout(() => {
                    router.push('/checkout/success?status=paid_paypal')
                }, 1500)
            }
        })
    }

    return (
        <main className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center p-6 text-black">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-zinc-200 overflow-hidden">
                <div className="p-8 text-center border-b border-zinc-100">
                    <svg viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" className="h-8 mx-auto mb-6">
                        <path d="M18.8 33.3c-1.6 0-3-1.4-3-3V11.8c0-1.6 1.4-3 3-3H49c12 0 17 6.1 14.8 15.6-.8 3.5-2.8 6.4-5.6 8.2-3.2 2-7.4 2.8-12 2.8h-7.6l-3 18.2c-.3 1.5-1.5 2.6-3 2.6H17l4.4-26z" fill="#003087" />
                        <path d="M30.6 8.8h30.2c12 0 17 6.1 14.8 15.6-.8 3.5-2.8 6.4-5.6 8.2-3.2 2-7.4 2.8-12 2.8h-7.6l1.2-7h6.4c8 0 12.4-3.6 13.6-9.8 1-6.2-2.8-9.8-10.4-9.8H34z" fill="#0079C1" />
                        <circle cx="11.4" cy="18.2" r="11.4" fill="#009CDE" />
                        <path d="M22.8 18.2c0-3.1-1.2-5.9-3.2-8C17 7.7 14 6.6 10.6 6.8c-2.4.2-4.6 1.2-6.2 2.8C2 12.2.8 16 .8 20.2c0 3.1 1.2 5.9 3.2 8 2.6 2.5 5.6 3.6 9 3.4 2.4-.2 4.6-1.2 6.2-2.8 2.4-2.6 3.6-6.4 3.6-10.6z" fill="#012169" />
                    </svg>

                    <h1 className="text-3xl font-medium text-[#003087] mb-2">{amountEur} €</h1>
                    <p className="text-sm text-zinc-500">Paiement via PayPal pour la commande #{orderId.substring(0, 8)}</p>
                </div>

                <div className="p-8">
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                            </svg>
                            {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-6 p-3 bg-[#0079C1]/10 text-[#003087] rounded-lg text-sm border border-[#0079C1]/20 flex items-center gap-2 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 text-[#0079C1]">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                            {successMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handlePayPalPayer}
                            disabled={isPending || !!successMsg}
                            className="w-full bg-[#0079C1] hover:bg-[#003087] text-white font-bold py-3.5 px-4 rounded-full transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Connexion en cours...
                                </>
                            ) : (
                                "Payer avec PayPal"
                            )}
                        </button>

                        <button
                            disabled={isPending || !!successMsg}
                            className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed border border-black"
                        >
                            Payer par carte bancaire
                        </button>
                    </div>
                </div>
            </div>

            <Link href="/checkout" className="mt-8 text-sm font-medium text-[#0079C1] hover:text-[#003087] hover:underline transition-colors shrink-0">
                Annuler et retourner sur MSM Hub
            </Link>
        </main>
    )
}
