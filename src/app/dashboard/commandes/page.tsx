import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OrderStatusSelect from '@/components/OrderStatusSelect';

export const dynamic = 'force-dynamic';

export default async function VendorOrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: vendorItems, error } = await supabase
        .from('order_items')
        .select(`
            id,
            product_name,
            quantity,
            unit_price,
            status,
            orders!inner (
                shipping_address,
                created_at
            )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erreur récupération commandes vendeur:", error.message);
    }

    return (
        <div className="w-full">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-white mb-2">Gestion des Commandes</h1>
                <p className="text-zinc-400">Gérez l'expédition et le statut des commandes de vos clients.</p>
            </div>

            <div className="glass-morphism rounded-3xl p-6 md:p-8 premium-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-zinc-800 text-sm text-zinc-400 uppercase tracking-widest">
                                <th className="pb-4 font-medium pl-4">Commande</th>
                                <th className="pb-4 font-medium">Client</th>
                                <th className="pb-4 font-medium">Date</th>
                                <th className="pb-4 font-medium">Montant</th>
                                <th className="pb-4 font-medium text-right pr-4">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-zinc-300">
                            {(!vendorItems || vendorItems.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-zinc-500">
                                        Vous n'avez reçu aucune commande pour le moment.
                                    </td>
                                </tr>
                            ) : vendorItems.map((item: any) => {
                                // Extract Client Name from shipping address if possible (format was Name - Phone - Address)
                                const shippingInfo = item.orders?.shipping_address || "Client inconnu";
                                const clientName = shippingInfo.split(' - ')[0] || "Client";
                                const itemTotal = Number(item.quantity) * Number(item.unit_price);

                                return (
                                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors group">
                                        {/* Informations Commande */}
                                        <td className="py-5 pl-4">
                                            <div className="font-bold text-white group-hover:text-primary-emerald transition-colors mb-1">{item.id.split('-')[0].toUpperCase()}</div>
                                            <div className="text-xs text-zinc-500 max-w-[200px] truncate">
                                                {item.quantity}x {item.product_name}
                                            </div>
                                        </td>

                                        {/* Client */}
                                        <td className="py-5 font-medium max-w-[150px] truncate" title={shippingInfo}>
                                            {clientName}
                                        </td>

                                        {/* Date */}
                                        <td className="py-5 text-zinc-400">{new Date(item.orders?.created_at).toLocaleDateString('fr-FR')}</td>

                                        {/* Montant (Calculé: Quantité * Prix Unitaire) */}
                                        <td className="py-5 font-bold text-white">{itemTotal.toLocaleString('fr-DZ')} DA</td>

                                        {/* Selecteur de Statut Interactif (Client Component) */}
                                        <td className="py-5 text-right pr-4">
                                            <OrderStatusSelect orderItemId={item.id} initialStatus={item.status} />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
