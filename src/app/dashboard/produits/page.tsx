import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation'

export default async function ProduitsPage() {
    const supabase = await createClient();

    // 1. Récupération de l'utilisateur (vendeur)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // 2. Récupération de ses produits
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erreur récupération produits:", error);
    }
    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Mes Produits</h1>
                    <p className="text-zinc-400 mt-2">Gérez votre catalogue de produits 3D</p>
                </div>
                <Link
                    href="/dashboard/produits/nouveau"
                    className="px-6 py-3 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow"
                >
                    + Nouveau Produit
                </Link>
            </div>

            <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 w-72 text-sm text-white focus:outline-none focus:border-primary-emerald transition-colors"
                    />
                    <div className="flex gap-2">
                        <select className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none appearance-none">
                            <option>Catégorie</option>
                            <option>Électronique</option>
                            <option>Meubles</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 text-sm text-zinc-400 uppercase tracking-widest">
                                <th className="pb-4 font-medium">Produit</th>
                                <th className="pb-4 font-medium">Catégorie</th>
                                <th className="pb-4 font-medium">Prix</th>
                                <th className="pb-4 font-medium">Stock</th>
                                <th className="pb-4 font-medium">Statut</th>
                                <th className="pb-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-zinc-300">
                            {(!products || products.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                                        Vous n'avez aucun produit dans votre catalogue.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500">3D</div>
                                                )}
                                                <span className="font-medium text-white">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">{product.category || 'Non classée'}</td>
                                        <td className="py-4 font-bold text-primary-emerald">{Number(product.price).toLocaleString('fr-DZ')} DA</td>
                                        <td className="py-4">{product.stock || 0}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 rounded-full text-xs">Actif</span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="text-zinc-500 hover:text-white transition-colors">Modifier</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
