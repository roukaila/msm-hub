import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export default async function LivreurDashboardPage() {
    const supabase = await createClient()

    // 1. Vérification de la session et du rôle
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'livreur') {
        redirect('/') // Rediriger si ce n'est pas un livreur
    }

    // 2. Récupérer les commandes marketplace nécessitant une livraison
    // On cherche les orders où requires_delivery = true et delivery_status = 'pending'
    const { data: pendingOrders } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            shipping_address,
            payment_method,
            delivery_fee,
            created_at,
            client_id,
            profiles:client_id (
                full_name,
                phone
            )
        `)
        .eq('requires_delivery', true)
        .eq('delivery_status', 'pending')
        .order('created_at', { ascending: false })

    // 3. Récupérer les commandes déjà acceptées par ce livreur
    const { data: myDeliveries } = await supabase
        .from('orders')
        .select(`
            id,
            shipping_address,
            delivery_status,
            created_at
        `)
        .eq('transporter_id', user.id)
        .order('created_at', { ascending: false })

    // 4. Récupérer les demandes de courses personnalisées (Colisage direct)
    const { data: customDeliveries } = await supabase
        .from('custom_deliveries')
        .select(`
            *,
            client:client_id (
                full_name,
                phone
            )
        `)
        .eq('transporter_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <main className="min-h-screen bg-dark-bg text-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Espace Livreur
                        </h1>
                        <p className="text-zinc-400 mt-2">Bienvenue {profile.full_name}, gérez vos courses et livraisons.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/livreur-dashboard/mes-livraisons" className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors border border-zinc-700">
                            Historique ({myDeliveries?.length || 0})
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Colonne de gauche : Commandes disponibles */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            Nouvelles courses Marketplace
                        </h2>

                        {pendingOrders && pendingOrders.length > 0 ? (
                            <div className="grid gap-4">
                                {pendingOrders.map((order: any) => (
                                    <div key={order.id} className="glass-morphism rounded-2xl p-6 border border-zinc-800/50 hover:border-primary-emerald/50 transition-colors relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-emerald"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-300 rounded-md">
                                                    #{order.id.split('-')[0]}
                                                </span>
                                                <h3 className="font-bold text-lg mt-2">{order.shipping_address.split(',')[1] || 'Adresse non spécifiée'}</h3>
                                                <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{order.shipping_address}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-primary-emerald">+{order.delivery_fee} DA</span>
                                                <span className="text-xs text-zinc-500">Frais de livraison</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-6 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-500">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                            <span className="truncate">{order.profiles?.full_name} • {order.profiles?.phone}</span>
                                        </div>

                                        <form action={async () => {
                                            'use server';
                                            const sub = await createClient()
                                            await sub.from('orders').update({
                                                transporter_id: user.id,
                                                delivery_status: 'assigned'
                                            }).eq('id', order.id)
                                            // TODO: revalidate path
                                        }}>
                                            <button className="w-full bg-zinc-800 hover:bg-primary-emerald hover:text-black text-white font-medium py-3 rounded-xl transition-all duration-300">
                                                Accepter la course
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-morphism rounded-2xl p-10 text-center border border-zinc-800/50">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </div>
                                <h3 className="text-zinc-300 font-medium mb-1">Aucune course disponible</h3>
                                <p className="text-sm text-zinc-500">Toutes les commandes ont été affectées.</p>
                            </div>
                        )}
                    </div>

                    {/* Colonne de droite : C2C (Colisage direct) */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0079C1] animate-pulse"></span>
                            Demandes privées (Colisage)
                        </h2>

                        {customDeliveries && customDeliveries.length > 0 ? (
                            <div className="grid gap-4">
                                {customDeliveries.map((cd: any) => (
                                    <div key={cd.id} className="glass-morphism rounded-2xl p-6 border border-zinc-800/50 hover:border-[#0079C1]/50 transition-colors relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#0079C1]"></div>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-md mb-2 inline-block ${cd.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        cd.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            'bg-zinc-800 text-zinc-400'
                                                    }`}>
                                                    {cd.status === 'pending' ? 'Demande en attente' : cd.status === 'accepted' ? 'Course acceptée' : cd.status}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm mt-1">
                                                    <div className="w-2 h-2 rounded-full border-2 border-[#0079C1]"></div>
                                                    <span className="text-zinc-300">{cd.pickup_address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-[#0079C1]"></div>
                                                    <span className="font-bold text-white">{cd.dropoff_address}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {cd.proposed_price ? (
                                                    <span className="block text-xl font-bold text-[#0079C1]">{cd.proposed_price} DA</span>
                                                ) : (
                                                    <span className="block text-sm font-bold text-zinc-400">À négocier</span>
                                                )}
                                                <span className="text-xs text-zinc-500">{cd.estimated_weight || 'Poids inconnu'}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50 mb-4 line-clamp-2">
                                            "{cd.item_description}"
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                </svg>
                                                <span>{cd.client?.full_name} • {cd.client?.phone}</span>
                                            </div>
                                        </div>

                                        {cd.status === 'pending' && (
                                            <div className="mt-4 flex gap-2">
                                                <form className="flex-1" action={async () => {
                                                    'use server';
                                                    const { updateCustomDeliveryStatus } = await import('@/app/actions/deliveries');
                                                    await updateCustomDeliveryStatus(cd.id, 'accepted');
                                                }}>
                                                    <button className="w-full bg-[#0079C1] hover:bg-[#005a91] text-white font-medium py-2 rounded-xl transition-all duration-300 text-sm">
                                                        Accepter
                                                    </button>
                                                </form>
                                                <form className="flex-1" action={async () => {
                                                    'use server';
                                                    const { updateCustomDeliveryStatus } = await import('@/app/actions/deliveries');
                                                    await updateCustomDeliveryStatus(cd.id, 'rejected');
                                                }}>
                                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 rounded-xl transition-all duration-300 text-sm border border-zinc-700">
                                                        Refuser
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                        {cd.status === 'accepted' && (
                                            <Link href={`/livreur-dashboard/tracker/${cd.id}?type=custom`} className="mt-4 block text-center w-full bg-zinc-800 hover:bg-[#0079C1] hover:text-white text-zinc-300 font-medium py-2 rounded-xl transition-all duration-300 text-sm border border-zinc-700">
                                                Démarrer la course avec GPS
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-morphism rounded-2xl p-10 text-center border border-zinc-800/50">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-zinc-300 font-medium mb-1">Aucune demande privée</h3>
                                <p className="text-sm text-zinc-500">Vous n'avez pas de proposition de colisage direct.</p>
                            </div>
                        )}

                        {/* Courses en cours */}
                        {myDeliveries && myDeliveries.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4 mt-8">Mes courses en cours</h3>
                                <div className="space-y-3">
                                    {myDeliveries.filter(d => d.delivery_status === 'assigned' || d.delivery_status === 'in_transit').map(delivery => (
                                        <div key={delivery.id} className="bg-zinc-800/50 border border-zinc-700/50 p-4 rounded-xl flex justify-between items-center">
                                            <div>
                                                <span className="text-xs text-zinc-500 block mb-1">#{delivery.id.split('-')[0]}</span>
                                                <span className="text-sm font-medium text-white block truncate max-w-[200px]">{delivery.shipping_address}</span>
                                            </div>
                                            <Link href={`/livreur-dashboard/tracker/${delivery.id}`} className="text-xs font-bold text-black bg-primary-emerald px-3 py-1.5 rounded-md hover:bg-emerald-400 transition-colors">
                                                Gérer
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
