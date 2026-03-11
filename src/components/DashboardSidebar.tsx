'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout, deleteAccount } from '@/app/actions/auth'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const [isDeleting, setIsDeleting] = useState(false)
    const [role, setRole] = useState('client')

    useEffect(() => {
        const fetchRole = async () => {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.user_metadata?.role) {
                setRole(session.user.user_metadata.role)
            }
        }
        fetchRole()
    }, [])

    const vendorLinks = [
        { href: '/dashboard', label: 'Vue d\'ensemble', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/dashboard/produits', label: 'Mes Produits', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { href: '/dashboard/commandes', label: 'Commandes', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
        { href: '/dashboard/abonnement', label: 'Mon Abonnement', icon: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
        { href: '/dashboard/publicite', label: 'Publicité', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { href: '/dashboard/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { href: '/dashboard/messagerie', label: 'Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ]

    const clientLinks = [
        { href: '/client-dashboard', label: 'Mon Espace Client', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/dashboard/messagerie', label: 'Mes Messages', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    ]

    const links = role === 'vendeur' ? vendorLinks : clientLinks

    return (
        <aside className="fixed left-0 top-0 h-full w-64 glass-morphism border-r border-zinc-800 z-40 hidden md:flex flex-col pt-20">
            <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                <h3 className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    {role === 'vendeur' ? 'Gestion Vendeur' : 'Menu Client'}
                </h3>

                {links.map((link) => {
                    const isActive = pathname === link.href

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-primary-emerald/10 text-primary-emerald border border-primary-emerald/20 premium-shadow'
                                : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                            </svg>
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-zinc-800 space-y-2">
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20 text-left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </form>

                <form action={async () => {
                    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.")
                    if (confirmed) {
                        setIsDeleting(true)
                        try {
                            await deleteAccount()
                        } catch (e: any) {
                            alert(e.message)
                            setIsDeleting(false)
                        }
                    }
                }}>
                    <button
                        type="submit"
                        disabled={isDeleting}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-600/10 hover:text-red-500 transition-colors border border-transparent hover:border-red-600/20 text-left disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <span className="font-medium font-bold">{isDeleting ? 'Suppression...' : 'Supprimer mon compte'}</span>
                    </button>
                </form>
            </div>
        </aside>
    )
}
