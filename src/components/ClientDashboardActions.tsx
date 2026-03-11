'use client'

import { logout, deleteAccount } from '@/app/actions/auth'
import { useState } from 'react'
import Link from 'next/link'

export default function ClientDashboardActions() {
    const [isDeleting, setIsDeleting] = useState(false)

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link
                href="/dashboard/messagerie"
                className="px-4 py-2 rounded-xl text-sm font-bold text-primary-emerald bg-primary-emerald/10 hover:bg-primary-emerald/20 transition-colors border border-primary-emerald/30 inline-flex items-center gap-2"
            >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Ma Messagerie
            </Link>
            <form action={logout}>
                <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700"
                >
                    Se déconnecter
                </button>
            </form>
            <form action={async () => {
                const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte  ? Cette action est irréversible.")
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
                    className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-transparent hover:border-red-500/30 disabled:opacity-50"
                >
                    {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
                </button>
            </form>
        </div>
    )
}
