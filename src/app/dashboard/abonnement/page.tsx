import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AbonnementPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Ici, nous pourrions récupérer le plan du vendeur depuis la base de données (ex: "profiles")
    // Pour l'interface MVP, nous fixons la donnée par défaut.
    const currentPlan = "Gratuit" // "Gratuit" ou "Premium"

    return (
        <main className="min-h-screen w-full p-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <div>
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-white">Mon Abonnement & Commissions</h1>
                        <p className="text-zinc-400 mt-2">Gérez votre offre vendeur, augmentez votre visibilité et réduisez vos frais de commission.</p>
                    </div>

                    {/* État actuel */}
                    <div className="glass-morphism rounded-3xl p-6 premium-shadow mb-10 Emerald-glow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-emerald/10 rounded-full blur-3xl"></div>
                        <h2 className="text-xl font-bold text-white mb-2">Votre plan actuel : <span className="text-primary-emerald">{currentPlan}</span></h2>
                        <p className="text-zinc-400">Commission appliquée sur vos ventes : <strong className="text-white">10%</strong></p>
                    </div>

                    {/* Offres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Plan Gratuit */}
                        <div className="glass-morphism rounded-3xl p-8 border border-zinc-800 relative premium-shadow flex flex-col">
                            <h3 className="text-2xl font-bold text-white mb-2">Vendeur Standard</h3>
                            <div className="text-4xl font-extrabold text-white mb-6">0 <span className="text-xl text-zinc-500 font-medium">DA / mois</span></div>
                            <ul className="space-y-4 text-zinc-400 font-medium flex-1">
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Boutiques et produits illimités</li>
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Commission à <strong className="text-white">10%</strong> par vente</li>
                                <li className="flex items-center gap-2 text-zinc-600"><svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg> Pas de mise en avant</li>
                            </ul>
                            <button className="mt-8 w-full py-3 px-6 rounded-xl border border-zinc-700 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors" disabled>
                                Plan Actuel
                            </button>
                        </div>

                        {/* Plan Premium */}
                        <div className="glass-morphism rounded-3xl p-8 border border-primary-emerald/30 relative premium-shadow perspective-card flex flex-col">
                            <div className="absolute -top-4 -right-4 bg-primary-emerald text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.5)]">Recommandé</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Vendeur Premium <span className="inline-block hover:animate-spin">⭐</span></h3>
                            <div className="text-4xl font-extrabold text-white mb-6">4500 <span className="text-xl text-primary-emerald font-medium">DA / mois</span></div>
                            <ul className="space-y-4 text-zinc-300 font-medium flex-1">
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Commission réduite à <strong className="text-white text-lg">5%</strong> par vente</li>
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Mise en avant de 3 produits / mois</li>
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Support prioritaire WhatsApp</li>
                                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-primary-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Analytics de conversion avancés</li>
                            </ul>
                            <button className="mt-8 w-full py-3 px-6 rounded-xl bg-primary-emerald text-black font-bold hover:bg-emerald-400 emerald-glow transition-all duration-300 transform hover:scale-[1.02]">
                                Passer au Premium
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}
