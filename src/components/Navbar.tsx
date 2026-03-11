'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import NotificationBell from './NotificationBell'

export default function Navbar() {
    const { items, toggleCart } = useCartStore()
    const [isMounted, setIsMounted] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string>('client')

    useEffect(() => {
        setIsMounted(true)
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setUser(session.user)
                setRole(session.user.user_metadata?.role || 'client')
            }
        }
        checkAuth()
    }, [])

    const itemCount = items.reduce((total, item) => total + item.quantity, 0)

    return (
        <nav className="fixed top-0 w-full z-50 glass-morphism h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/5">
            <div className="flex items-center gap-2">
                <Link href="/" className="text-2xl font-extrabold text-white tracking-tight">
                    MSM <span className="text-primary-emerald">Hub</span>
                </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Accueil
                </Link>
                <Link href="/catalogue" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Catalogue 3D
                </Link>
                <Link href="/livreurs" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                    Livreurs
                </Link>
                {user && (
                    <Link href={role === 'vendeur' || role === 'vendeur_international' ? "/dashboard" : role === 'livreur' ? "/livreur-dashboard" : "/client-dashboard"} className="text-sm font-medium text-zinc-300 hover:text-primary-emerald transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">
                            {role === 'vendeur' || role === 'vendeur_international' ? 'storefront' : role === 'livreur' ? 'local_shipping' : 'person'}
                        </span>
                        {role === 'vendeur' || role === 'vendeur_international' ? 'Espace Vendeur' : role === 'livreur' ? 'Espace Livreur' : 'Mes achats'}
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-4">
                {user && <NotificationBell userId={user.id} />}

                {/* Cart Toggle */}
                <button
                    onClick={toggleCart}
                    className="relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-primary-emerald transition-colors"
                    aria-label="Ouvrir le panier"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-zinc-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    {isMounted && itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-emerald text-[10px] font-bold text-black border-2 border-zinc-950">
                            {itemCount}
                        </span>
                    )}
                </button>

                {/* Auth Links */}
                {!user ? (
                    <>
                        <Link
                            href="/login"
                            className="px-5 py-2.5 text-sm font-medium text-white hover:text-primary-emerald transition-colors hidden sm:inline-block"
                        >
                            Connexion
                        </Link>
                        <Link
                            href="/register"
                            className="hidden md:inline-flex px-5 py-2.5 bg-primary-emerald hover:bg-emerald-400 text-black text-sm font-bold rounded-full transition-all duration-300 emerald-glow premium-shadow md:whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-1">store</span>
                            Vendre / Livrer
                        </Link>
                    </>
                ) : (
                    <Link
                        href={role === 'vendeur' || role === 'vendeur_international' ? "/dashboard" : role === 'livreur' ? "/livreur-dashboard" : "/client-dashboard"}
                        className="hidden md:inline-flex px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-full transition-all duration-300"
                    >
                        Mon Tableau de Bord
                    </Link>
                )}
            </div>
        </nav>
    )
}
