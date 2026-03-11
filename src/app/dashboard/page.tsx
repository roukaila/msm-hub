import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single()

    const greetingName = profile?.full_name || user.email?.split('@')[0] || 'Vendeur'
    const companyDisplay = profile?.company_name ? ` (${profile.company_name})` : ''

    return (
        <main className="min-h-screen w-full p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white">Vue d'overview</h1>
                            <p className="text-zinc-400 mt-2 text-lg">
                                Bonjour, <span className="text-primary-emerald font-bold">{greetingName}</span>{companyDisplay}
                            </p>
                        </div>
                        <Link
                            href="/dashboard/produits/nouveau"
                            className="px-6 py-3 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow hidden sm:block"
                        >
                            + Nouveau Produit
                        </Link>
                    </div>

                    {/* Widgets Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Widget 1 */}
                        <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-emerald/10 rounded-full blur-2xl group-hover:bg-primary-emerald/20 transition-colors"></div>
                            <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Chiffre d'affaires (Mois)</div>
                            <div className="text-4xl font-extrabold text-white mb-2">145 000 <span className="text-lg text-primary-emerald">DZD</span></div>
                            <div className="text-sm text-primary-emerald font-medium flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.94.3%" /></svg>
                                +12.5% par rapport au mois dernier
                            </div>
                        </div>

                        {/* Widget 2 */}
                        <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors"></div>
                            <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Commandes en attente</div>
                            <div className="text-4xl font-extrabold text-white mb-2">12</div>
                            <div className="text-sm text-zinc-400 flex items-center gap-1">
                                3 commandes à expédier aujourd'hui
                            </div>
                        </div>

                        {/* Widget 3 */}
                        <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                            <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Produits Actifs</div>
                            <div className="text-4xl font-extrabold text-white mb-2">8</div>
                            <div className="text-sm text-zinc-400 flex items-center gap-1">
                                Sur votre catalogue
                            </div>
                        </div>
                    </div>

                    {/* Activité récente */}
                    <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                        <h2 className="text-xl font-bold text-white mb-6">Dernières commandes</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-sm text-zinc-400 uppercase tracking-widest">
                                        <th className="pb-4 font-medium">Commande</th>
                                        <th className="pb-4 font-medium">Client</th>
                                        <th className="pb-4 font-medium">Date</th>
                                        <th className="pb-4 font-medium">Statut</th>
                                        <th className="pb-4 font-medium text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-zinc-300">
                                    <tr className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4 font-medium text-white">#CMD-001</td>
                                        <td className="py-4">Karim R. (Alger)</td>
                                        <td className="py-4">Aujourd'hui, 10:23</td>
                                        <td className="py-4"><span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs">En préparation</span></td>
                                        <td className="py-4 text-right font-bold text-white">45 000 DA</td>
                                    </tr>
                                    <tr className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4 font-medium text-white">#CMD-002</td>
                                        <td className="py-4">Amina B. (Oran)</td>
                                        <td className="py-4">Hier, 15:45</td>
                                        <td className="py-4"><span className="px-2 py-1 bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 rounded-full text-xs">Expédiée</span></td>
                                        <td className="py-4 text-right font-bold text-white">12 500 DA</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
