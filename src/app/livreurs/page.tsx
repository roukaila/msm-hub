import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LivreursDirectoryPage() {
    const supabase = await createClient()

    // Récupérer tous les utilisateurs ayant le rôle "livreur"
    const { data: livreurs, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, country, company_id, created_at')
        .eq('role', 'livreur')
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen bg-dark-bg text-white">
            <Navbar />

            <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                        Annuaire des Transporteurs
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Trouvez un livreur de confiance pour vos expéditions locales ou internationales, indépendamment de la marketplace MSM Hub.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center mb-8">
                        Une erreur est survenue lors de la récupération des livreurs.
                    </div>
                )}

                {livreurs && livreurs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {livreurs.map((livreur) => (
                            <div key={livreur.id} className="glass-morphism rounded-3xl p-6 border border-zinc-800 hover:border-primary-emerald/50 transition-all duration-300 group premium-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold text-primary-emerald group-hover:scale-110 transition-transform">
                                        {livreur.full_name?.charAt(0) || 'L'}
                                    </div>
                                    <span className="bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 px-3 py-1 rounded-full text-xs font-medium">
                                        {livreur.country || 'International'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-emerald transition-colors">{livreur.full_name}</h3>

                                <div className="space-y-2 mt-4 text-sm text-zinc-400">
                                    <p className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                        </svg>
                                        {livreur.phone || 'Non renseigné'}
                                    </p>
                                    {livreur.company_id && (
                                        <p className="flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                                            </svg>
                                            SIRET/RC: {livreur.company_id}
                                        </p>
                                    )}
                                </div>

                                <Link
                                    href={`/livreurs/${livreur.id}/demande`}
                                    className="mt-6 block w-full text-center py-3 bg-zinc-800 hover:bg-primary-emerald hover:text-black text-white font-medium rounded-xl transition-all duration-300"
                                >
                                    Demander une course
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-morphism rounded-3xl p-12 text-center max-w-2xl mx-auto border border-zinc-800">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-zinc-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Aucun transporteur trouvé</h2>
                        <p className="text-zinc-400">Il n'y a actuellement aucun livreur inscrit sur la plateforme. Revenez plus tard !</p>
                    </div>
                )}
            </div>
        </main>
    )
}
