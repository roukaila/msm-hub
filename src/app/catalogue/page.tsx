"use client";

import ProductCard, { Product } from '@/components/ProductCard'
import Navbar from '@/components/Navbar'
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

type CatalogProduct = Product & { marketType: 'b2c' | 'b2b' | 'both', createdAt: string };

const CATEGORIES = ['Toutes', 'Électronique', 'Mode', 'Maison', 'Informatique', 'Audio', 'Accessoires'];

export default function CataloguePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtres & Recherche
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Toutes');
    const [marketB2C, setMarketB2C] = useState(true);
    const [marketB2B, setMarketB2B] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        setIsMounted(true);
        // Simulation d'un fetch Backend (Supabase)
        const fetchProducts = async () => {
            setIsLoading(true);
            const supabase = createClient();

            const { data, error } = await supabase
                .from('products')
                .select(`
                    id,
                    name,
                    description,
                    price,
                    category,
                    market_type,
                    rating,
                    reviews_count,
                    created_at,
                    image_url,
                    profiles:vendor_id(full_name, company_name)
                `);

            if (error) {
                console.error("Error fetching products:", error.message);
                setProducts([]);
            } else if (data) {
                // Mapping des champs DB vs Interface
                const formattedProducts: CatalogProduct[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    priceDZD: Number(p.price),
                    category: p.category,
                    vendorId: p.vendor_id,
                    sellerName: p.profiles?.company_name || p.profiles?.full_name || 'Vendeur Inconnu',
                    marketType: p.market_type || 'both',
                    createdAt: p.created_at,
                    imageUrl: p.image_url,
                    rating: Number(p.rating) || undefined,
                    reviewsCount: Number(p.reviews_count) || undefined
                }));
                setProducts(formattedProducts);
            }
            setIsLoading(false);
        };
        fetchProducts();
    }, []);

    // Filtrage et Tri dynamiques
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Recherche par nom
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());

            // 2. Filtre Catégorie
            const matchesCategory = selectedCategory === 'Toutes' || product.category === selectedCategory;

            // 3. Filtre Marché
            let matchesMarket = false;
            // Si le produit est 'both', il apparait toujours si un des deux est coché
            if (product.marketType === 'both' && (marketB2C || marketB2B)) matchesMarket = true;
            else if (product.marketType === 'b2c' && marketB2C) matchesMarket = true;
            else if (product.marketType === 'b2b' && marketB2B) matchesMarket = true;
            // Si rien n'est coché, on n'affiche rien ou tout (ici on décide que si rien n'est coché, c'est comme si on voulait tout voir par défaut)
            if (!marketB2C && !marketB2B) matchesMarket = true;

            return matchesSearch && matchesCategory && matchesMarket;
        }).sort((a, b) => {
            // Tri
            if (sortBy === 'price_asc') return a.priceDZD - b.priceDZD;
            if (sortBy === 'price_desc') return b.priceDZD - a.priceDZD;
            if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
    }, [products, searchQuery, selectedCategory, marketB2C, marketB2B, sortBy]);

    if (!isMounted) return null; // Hydration safe

    return (
        <main className="min-h-screen bg-dark-bg">
            <Navbar />

            <div className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Sidebar / Filtres */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="glass-morphism rounded-3xl p-6 sticky top-28">
                        <h2 className="text-xl font-bold text-white mb-6">Filtres</h2>

                        <div className="space-y-6">
                            {/* Catégories */}
                            <div>
                                <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Catégories</h3>
                                <ul className="space-y-2">
                                    {CATEGORIES.map(cat => (
                                        <li key={cat}>
                                            <button
                                                onClick={() => setSelectedCategory(cat)}
                                                className={`text-sm w-full text-left transition-colors ${selectedCategory === cat
                                                    ? 'text-primary-emerald font-semibold'
                                                    : 'text-zinc-300 hover:text-primary-emerald'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Type de marché */}
                            <div className="border-t border-zinc-800 pt-6">
                                <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Type de marché</h3>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-700 text-primary-emerald focus:ring-primary-emerald bg-zinc-900 accent-primary-emerald"
                                            checked={marketB2C}
                                            onChange={(e) => setMarketB2C(e.target.checked)}
                                        />
                                        B2C (Particuliers)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors">
                                        <input
                                            type="checkbox"
                                            className="rounded border-zinc-700 text-primary-emerald focus:ring-primary-emerald bg-zinc-900 accent-primary-emerald"
                                            checked={marketB2B}
                                            onChange={(e) => setMarketB2B(e.target.checked)}
                                        />
                                        B2B (Grossistes)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content: Recherche & Grille Produits */}
                <div className="flex-1">

                    {/* Header: Titre & Barre de recherche */}
                    <div className="mb-8 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white mb-2">Catalogue Immersif</h1>
                                <p className="text-zinc-400">Découvrez nos produits en vue 3D interactive.</p>
                            </div>

                            {/* Tri */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary-emerald focus:border-primary-emerald outline-none w-full sm:w-auto cursor-pointer"
                            >
                                <option value="newest">Trier par: Nouveautés</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                            </select>
                        </div>

                        {/* Barre de recherche */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-zinc-500">search</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Rechercher un produit, une marque..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald/50 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 outline-none transition-all glass-morphism"
                            />
                        </div>
                    </div>

                    {/* Grille Produits */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-12 h-12 border-4 border-primary-emerald border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-morphism rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-zinc-800/50 mt-8">
                            <span className="material-symbols-outlined text-6xl text-zinc-600 mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-white mb-2">Aucun produit trouvé</h3>
                            <p className="text-zinc-400">Essayez de modifier vos filtres ou votre recherche.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('Toutes'); setMarketB2C(true); setMarketB2B(false); }}
                                className="mt-6 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-sm font-medium transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}
