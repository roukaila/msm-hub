import Link from 'next/link'
import StripeCheckoutForm from './StripeCheckoutForm'

export default function StripeSimulationPage({
    searchParams,
}: {
    searchParams: { order_id?: string; amount?: string }
}) {
    const orderId = searchParams.order_id || 'INCONNUE'
    const amount = parseInt(searchParams.amount || '0', 10)

    // Conversion approximative DZD -> EUR ou USD (Stripe ne supporte pas nativement le DZD de manière optimale partout)
    // Ici on assume un taux fixe fictif pour la démo: 1 EUR = 150 DZD
    const amountEur = (amount / 150).toFixed(2)

    return (
        <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-black relative overflow-hidden">
            {/* Décoration de fond */}
            <div className="absolute top-0 w-full h-80 bg-gradient-to-b from-[#635BFF]/10 to-transparent -z-10" />

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
                {/* Header Stripe-like */}
                <div className="px-8 py-6 bg-white border-b border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Fake Stripe Logo */}
                        <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" className="w-12 h-5 fill-[#635BFF]">
                            <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h5.25c0-1.48-.98-2.58-3.08-2.58zM43 4.24v1l-2.02-.69-.97 10.59c-.06 1.04.5 1.34 1.5 1.34.42 0 .86-.06 1.25-.17v3.31a6.03 6.03 0 0 1-2.43.46c-2.4 0-3.95-1.28-3.95-4.09l1.1-12.22-3.03 2.99-1.99-1.34 8.52-5.46L43 4.24zm-14.75 3.52c1.9 0 3.17.9 3.73 2.22v-2.06h3.87v12.22h-3.87v-1.92c-.59 1.28-1.91 2.06-3.79 2.06-2.9 0-5.45-2.28-5.45-6.26 0-3.96 2.55-6.26 5.51-6.26zm1.18 9.28c1.65 0 2.65-1.39 2.65-3.02 0-1.61-1-3.02-2.65-3.02-1.63 0-2.67 1.38-2.67 3.02 0 1.6 1.05 3.02 2.67 3.02zm-12.76-9.28c1.9 0 3.17.9 3.73 2.22v-2.06h3.87v15.93h-3.87v-5.63c-.59 1.28-1.91 2.06-3.79 2.06-2.9 0-5.45-2.28-5.45-6.26 0-3.96 2.55-6.26 5.51-6.26zm1.18 9.28c1.65 0 2.65-1.39 2.65-3.02 0-1.61-1-3.02-2.65-3.02-1.63 0-2.67 1.38-2.67 3.02 0 1.6 1.05 3.02 2.67 3.02zM11.53 17.5c-1.4 0-2.9-.45-4.22-1.1v3.47c1.3.62 3.03 1.1 4.7 1.1 2.98 0 4.88-1.48 4.88-3.9 0-2.31-1.35-3.23-3.66-3.93-1.64-.52-2.42-.9-2.42-1.62 0-.66.6-1.17 1.63-1.17 1.12 0 2.23.36 3.23.86v-3.2A8.1 8.1 0 0 0 11.55 7c-2.91 0-4.7 1.55-4.7 3.86 0 2.2 1.48 3.14 3.71 3.84 1.76.55 2.52.92 2.52 1.67 0 .68-.68 1.13-1.55 1.13z" />
                        </svg>
                        <span className="text-zinc-400 text-sm font-medium border-l border-zinc-200 pl-2">Checkout</span>
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-zinc-500 font-medium mb-1">Total à payer</p>
                        <h1 className="text-4xl font-extrabold text-[#111116] tracking-tight">{amountEur} €</h1>
                        <p className="text-sm text-zinc-400 mt-2">≈ {amount.toLocaleString('fr-DZ')} DA (Commande #{orderId.substring(0, 8)})</p>
                    </div>

                    {/* Simulation form */}
                    <StripeCheckoutForm orderId={orderId} />
                </div>
            </div>

            <div className="mt-8">
                <Link href="/checkout" className="text-sm font-medium text-zinc-500 hover:text-black hover:underline transition-colors shrink-0">
                    ← Annuler et retourner à la boutique
                </Link>
            </div>
        </main>
    )
}
