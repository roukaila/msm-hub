'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { updatePassword } from '@/app/actions/auth'

export default function UpdatePasswordPage() {
    const [msg, setMsg] = useState({ text: '', isError: false })
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMsg({ text: '', isError: false })
        const formData = new FormData(e.currentTarget)

        const password = formData.get('password') as string
        const confirmResult = formData.get('confirm_password') as string

        if (password !== confirmResult) {
            setMsg({ text: 'Les mots de passe ne correspondent pas.', isError: true })
            return
        }

        startTransition(async () => {
            const result = await updatePassword(formData)
            if (result?.error) {
                setMsg({ text: result.error, isError: true })
            }
            // Si pas d'erreur, updatePassword redirigera vers /login
        })
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-[10%] left-[30%] w-[300px] h-[300px] bg-primary-emerald rounded-full opacity-10 blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Nouveau mot de passe</h1>
                        <p className="text-zinc-400">Veuillez entrer votre nouveau mot de passe.</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {msg.text && (
                            <div className={`p-3 border rounded-xl text-sm justify-center flex items-center ${msg.isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary-emerald/10 border-primary-emerald/20 text-primary-emerald'}`}>
                                {msg.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="password">
                                Nouveau mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="confirm_password">
                                Confirmer le mot de passe
                            </label>
                            <input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                required
                                minLength={6}
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow mt-2 flex justify-center items-center gap-2 disabled:bg-emerald-800 disabled:text-zinc-400 disabled:cursor-wait"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Mise à jour...
                                </>
                            ) : (
                                "Mettre à jour"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
