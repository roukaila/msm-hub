import Link from 'next/link'

export const dynamic = 'force-dynamic';
import Navbar from '@/components/Navbar'
import ClientDashboardActions from '@/components/ClientDashboardActions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
}

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'en attente':
            return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">En attente</span>;
        case 'expédiée':
            return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">Expédiée</span>;
        case 'livrée':
            return <span className="px-3 py-1 bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/30 rounded-full text-xs font-semibold uppercase tracking-wider emerald-glow">Livrée</span>;
        case 'annulée':
            return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">Annulée</span>;
        default:
            return <span className="px-3 py-1 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">{status}</span>;
    }
};

export default async function ClientDashboardPage() {
    const supabase = await createClient()

    // 1. Récupération de l'utilisateur
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Récupération du profil pour le nom complet
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const greetingName = profile?.full_name || user.email?.split('@')[0] || 'Client'

    // 2. Récupération des commandes et de leurs articles (joints)
    const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (
                product_name,
                quantity,
                unit_price,
                status
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Erreur récupération commandes client:", error.message)
    }

    // 3. Mapping vers l'interface Order attendue par l'UI
    const mappedOrders: Order[] = (ordersData || []).map((o: any) => {
        // Déduction d'un "statut global" basé sur les statuts des articles
        const itemStatuses = o.order_items.map((i: any) => i.status)
        let globalStatus = 'en attente'
        if (itemStatuses.length > 0) {
            if (itemStatuses.every((s: string) => s === 'livrée')) globalStatus = 'livrée'
            else if (itemStatuses.every((s: string) => s === 'annulée')) globalStatus = 'annulée'
            else if (itemStatuses.includes('expédiée')) globalStatus = 'expédiée'
        }

        return {
            id: o.id.split('-')[0].toUpperCase(), // Raccourcir l'UUID pour l'affichage (ex: A1B2C3D4)
            date: o.created_at,
            total: Number(o.total_amount),
            status: globalStatus,
            items: o.order_items.map((i: any) => ({
                name: i.product_name,
                quantity: i.quantity,
                price: Number(i.unit_price)
            }))
        }
    })

    return (
        <main className="min-h-screen bg-dark-bg">
            <Navbar />

            <div className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto">
                {/* Header Profil */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-primary-emerald flex items-center justify-center text-primary-emerald">
                            <span className="material-symbols-outlined text-4xl">person</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white mb-2">Mon Profil Client</h1>
                            <p className="text-zinc-400 text-lg mb-1">Bonjour, <span className="text-primary-emerald font-bold">{greetingName}</span></p>
                            <p className="text-zinc-500 text-sm">{user.email}</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <ClientDashboardActions />
                    </div>
                </div>

                {/* Section Historique des Achats */}
                <div className="glass-morphism rounded-3xl p-6 md:p-8 premium-shadow hidden sm:block">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-emerald">receipt_long</span>
                            Historique de mes achats
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-800 text-sm text-zinc-400 uppercase tracking-widest">
                                    <th className="pb-4 font-medium pl-4">Commande</th>
                                    <th className="pb-4 font-medium">Date</th>
                                    <th className="pb-4 font-medium">Articles</th>
                                    <th className="pb-4 font-medium">Statut</th>
                                    <th className="pb-4 font-medium text-right pr-4">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-zinc-300">
                                {mappedOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-zinc-500">
                                            Vous n'avez passé aucune commande pour le moment.
                                        </td>
                                    </tr>
                                ) : mappedOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
                                        <td className="py-5 pl-4 font-bold text-white group-hover:text-primary-emerald transition-colors">{order.id}</td>
                                        <td className="py-5">{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                                        <td className="py-5">
                                            <ul className="list-disc list-inside text-xs text-zinc-400">
                                                {order.items.map((item, idx) => (
                                                    <li key={idx} className="truncate max-w-[200px]">{item.quantity}x {item.name}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="py-5">{getStatusBadge(order.status)}</td>
                                        <td className="py-5 text-right pr-4 font-bold text-white">{order.total.toLocaleString('fr-DZ')} DA</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Version Mobile Cards */}
                <div className="sm:hidden space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Historique des achats</h2>
                    {mappedOrders.length === 0 ? (
                        <div className="text-center py-10 text-zinc-500 border border-zinc-800 rounded-2xl">
                            Aucune commande.
                        </div>
                    ) : mappedOrders.map((order) => (
                        <div key={order.id} className="glass-morphism rounded-2xl p-5 border border-zinc-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold">{order.id}</h3>
                                    <span className="text-xs text-zinc-400">{new Date(order.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-zinc-400 truncate pr-4">{item.quantity}x {item.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                                <span className="text-sm text-zinc-400">Total</span>
                                <span className="text-primary-emerald font-bold">{order.total.toLocaleString('fr-DZ')} DA</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </main>
    )
}
