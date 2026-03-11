import Navbar from '@/components/Navbar'
import ProductCard, { Product } from '@/components/ProductCard'
import { createClient } from '@/utils/supabase/server'

type CatalogProduct = Product & { marketType: 'b2c' | 'b2b' | 'both', createdAt: string };

export default async function Home() {
  const supabase = await createClient()

  // Fetch up to 3 recent products from the database
  const { data: dbProducts, error } = await supabase
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
    `)
    .order('created_at', { ascending: false })
    .limit(3);

  let featuredProducts: CatalogProduct[] = [];

  if (!error && dbProducts) {
    featuredProducts = dbProducts.map((p: any) => ({
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
  } else {
    console.error("Error fetching featured products:", error);
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden pt-20 bg-dark-bg">
      <Navbar />

      {/* Background Ambient Lights */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-primary-emerald rounded-full opacity-20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-emerald-700 rounded-full opacity-10 blur-[150px] pointer-events-none" />

      {/* Hero Content */}
      <div className="z-10 text-center max-w-5xl mx-auto space-y-8 flex flex-col items-center mt-12 md:mt-24 relative">
        {/* Floating 3D Elements Decorative */}
        <div className="absolute -left-20 top-0 w-32 h-32 rounded-3xl bg-primary-emerald/10 border border-primary-emerald/30 premium-shadow animate-[spin_10s_linear_infinite] hidden lg:block backdrop-blur-md" style={{ transform: 'perspective(500px) rotateX(45deg) rotateY(45deg)' }}></div>
        <div className="absolute -right-20 top-20 w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 premium-shadow animate-[bounce_4s_ease-in-out_infinite] hidden lg:block"></div>
        <div className="absolute left-10 bottom-0 w-16 h-16 bg-gradient-to-br from-primary-emerald to-emerald-800 rounded-lg premium-shadow animate-[pulse_3s_ease-in-out_infinite] hidden lg:block" style={{ transform: 'perspective(400px) rotateX(-20deg) rotateY(30deg)' }}></div>

        <div className="inline-flex glass-morphism rounded-full px-6 py-2 text-sm text-primary-emerald font-bold uppercase tracking-widest mb-4 border border-primary-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          Nouveau sur le marché Algérien
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 mb-6 drop-shadow-2xl">
          MSM Hub <br />
          <span className="text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-primary-emerald to-emerald-300 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">Propulsé par msm-conseils</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed">
          Découvrez une nouvelle dimension du e-commerce en Algérie.
          Vendez et achetez grâce à une <strong className="text-white">interface immersive premium</strong> conçue pour maximiser l'interaction.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 w-full justify-center">
          <a href="/catalogue" className="w-full sm:w-auto px-10 py-5 bg-primary-emerald hover:bg-emerald-400 text-black font-extrabold rounded-2xl transition-all duration-300 emerald-glow premium-shadow hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-3">
            Découvrir le Catalogue
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>

          <a href="/register" className="w-full sm:w-auto px-10 py-5 glass-morphism text-white font-bold rounded-2xl hover:bg-white/10 transition-all duration-300 border border-zinc-700 hover:border-zinc-500 premium-shadow hover:-translate-y-1 text-center">
            Devenir Vendeur Pro
          </a>
        </div>
      </div>

      {/* Database Driven Products */}
      <div className="mt-32 mb-16 z-10 w-full max-w-6xl">
        <h2 className="text-2xl font-bold text-white mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">Dernières Nouveautés</h2>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="glass-morphism rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-zinc-800/50 mt-8">
            <span className="material-symbols-outlined text-4xl text-zinc-600 mb-4">inventory_2</span>
            <h3 className="text-lg font-bold text-white mb-2">Catalogue en préparation</h3>
            <p className="text-zinc-400 text-sm">Les vendeurs ajoutent actuellement leurs produits.</p>
          </div>
        )}
      </div>
    </main>
  );
}
