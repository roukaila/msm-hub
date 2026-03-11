import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Mock des données analytiques pour l'interface MVP Stitsh
    const kpis = {
        conversionRate: '3.2%',
        conversionGrowth: '+0.5%',
        totalRevenue: '1 250 000',
        revenueGrowth: '+12%',
        totalViews: '84 500',
        viewsGrowth: '+24%',
        activeCustomers: '342'
    }

    const topProduits = [
        { id: 1, name: 'Smartphone Pro X', sales: 45, revenus: '3 600 000', conversion: '4.5%' },
        { id: 2, name: 'Casque Audio 3D', sales: 120, revenus: '1 440 000', conversion: '6.2%' },
        { id: 3, name: 'Montre Connectée Z', sales: 85, revenus: '1 020 000', conversion: '3.8%' }
    ]

    const ventesParWilaya = [
        { wilaya: 'Alger (16)', percentage: 45 },
        { wilaya: 'Oran (31)', percentage: 20 },
        { wilaya: 'Constantine (25)', percentage: 15 },
        { wilaya: 'Sétif (19)', percentage: 10 },
        { wilaya: 'Autres', percentage: 10 },
    ]

    return (
        <main className="min-h-screen w-full p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Analytics Avancés</h1>
                        <p className="text-zinc-400 mt-2">Suivez vos performances, vos taux de conversion et l'origine de vos ventes (Wilayas).</p>
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald">
                            <option>Ces 30 derniers jours</option>
                            <option>Cette année</option>
                            <option>Tout le temps</option>
                        </select>
                        <button className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Exporter CSV
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="glass-morphism rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden">
                        <div className="text-sm font-medium text-zinc-400 mb-1">Revenus Globaux</div>
                        <div className="text-3xl font-extrabold text-white mb-2">{kpis.totalRevenue} <span className="text-sm text-zinc-500 font-normal">DA</span></div>
                        <div className="text-xs text-primary-emerald flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {kpis.revenueGrowth} vs période précédente
                        </div>
                    </div>
                    <div className="glass-morphism rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden">
                        <div className="text-sm font-medium text-zinc-400 mb-1">Vues Boutique & Produits</div>
                        <div className="text-3xl font-extrabold text-white mb-2">{kpis.totalViews}</div>
                        <div className="text-xs text-primary-emerald flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {kpis.viewsGrowth} vs période précédente
                        </div>
                    </div>
                    <div className="glass-morphism rounded-2xl p-6 border border-primary-emerald/30 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-emerald/10 rounded-full blur-2xl group-hover:bg-primary-emerald/20 transition-colors"></div>
                        <div className="text-sm font-medium text-white mb-1">Taux de Conversion</div>
                        <div className="text-3xl font-extrabold text-primary-emerald mb-2">{kpis.conversionRate}</div>
                        <div className="text-xs text-primary-emerald flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            {kpis.conversionGrowth} vs période précédente
                        </div>
                    </div>
                    <div className="glass-morphism rounded-2xl p-6 border border-zinc-800/50 relative overflow-hidden">
                        <div className="text-sm font-medium text-zinc-400 mb-1">Clients Uniques</div>
                        <div className="text-3xl font-extrabold text-white mb-2">{kpis.activeCustomers}</div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1">Donnée mensuelle</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Graphique des ventes / Vues par wilaya (Simulation) */}
                    <div className="lg:col-span-1 glass-morphism rounded-3xl p-8 premium-shadow border border-zinc-800/50">
                        <h2 className="text-lg font-bold text-white mb-6">Répartition par Wilaya</h2>
                        <div className="space-y-6">
                            {ventesParWilaya.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-zinc-300 font-medium">{item.wilaya}</span>
                                        <span className="text-white font-bold">{item.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-900 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${idx === 0 ? 'bg-primary-emerald' : 'bg-zinc-700'}`} style={{ width: `${item.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center text-xs text-zinc-500 italic">
                            Les livraisons (Cash On Delivery) sont majoritairement concentrées sur le centre du pays.
                        </div>
                    </div>

                    {/* Top Produits */}
                    <div className="lg:col-span-2 glass-morphism rounded-3xl p-8 premium-shadow border border-zinc-800/50">
                        <h2 className="text-lg font-bold text-white mb-6">Top Produits (Revenus & Conversion)</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-widest">
                                        <th className="pb-4 font-medium">Produit</th>
                                        <th className="pb-4 font-medium text-center">Ventes</th>
                                        <th className="pb-4 font-medium text-center">Conversion</th>
                                        <th className="pb-4 font-medium text-right">Revenus (DA)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-zinc-300">
                                    {topProduits.map((p, index) => (
                                        <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/40 transition-colors">
                                            <td className="py-5 font-medium text-white flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">{index + 1}</div>
                                                {p.name}
                                            </td>
                                            <td className="py-5 text-center font-bold text-white">{p.sales}</td>
                                            <td className="py-5 text-center">
                                                <span className="px-2 py-1 bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 rounded-lg text-xs font-bold">
                                                    {p.conversion}
                                                </span>
                                            </td>
                                            <td className="py-5 text-right font-extrabold text-white">{p.revenus}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
