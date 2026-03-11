/* import { createClient } from '@/utils/supabase/server' */
import { redirect } from 'next/navigation'

export default async function PublicitePage() {
    /* const supabase = await createClient() */
    /* const { data: { user } } = await supabase.auth.getUser() */
    const user = { id: 'test-user', user_metadata: { full_name: 'Vendeur Test' } };

    if (!user) {
        redirect('/login')
    }

    // Mock des produits pour la démo UI
    const myProducts = [
        { id: 1, name: 'Smartphone Pro X', is_sponsored: true, sponsor_end: '2026-04-01', views: 1250 },
        { id: 2, name: 'Casque Audio 3D', is_sponsored: false, sponsor_end: null, views: 340 },
        { id: 3, name: 'Sneakers Premium', is_sponsored: false, sponsor_end: null, views: 560 }
    ]

    return (
        <main className="min-h-screen w-full p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Publicité & Mise en avant</h1>
                        <p className="text-zinc-400 mt-2">Boostez la visibilité de vos produits avec le sponsoring en haut de catalogue.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group border border-primary-emerald/20">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-emerald/10 rounded-full blur-2xl"></div>
                        <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Crédit Publicitaire</div>
                        <div className="text-4xl font-extrabold text-white mb-2">15 000 <span className="text-lg text-primary-emerald">DZD</span></div>
                        <button className="mt-4 text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors">Recharger mon solde</button>
                    </div>

                    <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Produits Sponsorisés Actifs</div>
                        <div className="text-4xl font-extrabold text-white mb-2">1</div>
                        <div className="text-sm text-zinc-400">Sur votre catalogue</div>
                    </div>

                    <div className="glass-morphism rounded-3xl p-6 premium-shadow relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
                        <div className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wide">Vues générées (Ads)</div>
                        <div className="text-4xl font-extrabold text-white mb-2">+ 2 450</div>
                        <div className="text-sm text-primary-emerald font-medium">Ce mois-ci</div>
                    </div>
                </div>

                {/* Liste des produits pour sponsorisation */}
                <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                    <h2 className="text-xl font-bold text-white mb-6">Sponsoriser un produit</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-sm text-zinc-400 uppercase tracking-widest">
                                    <th className="pb-4 font-medium">Produit</th>
                                    <th className="pb-4 font-medium text-center">Vues</th>
                                    <th className="pb-4 font-medium text-center">Statut Sponsor</th>
                                    <th className="pb-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {myProducts.map((p) => (
                                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4 font-medium text-white flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-lg"></div>
                                            {p.name}
                                        </td>
                                        <td className="py-4 text-center">{p.views}</td>
                                        <td className="py-4 text-center">
                                            {p.is_sponsored ? (
                                                <span className="px-2 py-1 bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-primary-emerald animate-pulse"></span>
                                                    Actif jusqu'au {p.sponsor_end}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-full text-xs">Non sponsorisé</span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            {p.is_sponsored ? (
                                                <button className="px-4 py-2 text-xs font-bold text-red-400 border border-red-400/20 hover:bg-red-500/10 rounded-lg transition-colors">Arrêter</button>
                                            ) : (
                                                <button className="px-4 py-2 text-xs font-bold text-black bg-primary-emerald hover:bg-emerald-400 rounded-lg transition-colors emerald-glow cursor-pointer">Sponsoriser (500 DA/j)</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
