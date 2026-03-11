'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
    const [errorMsg, setErrorMsg] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await login(formData)
            if (result?.error) {
                // Traduction basique ou affichage brutal
                if (result.error.includes('Invalid login credentials')) {
                    setErrorMsg("Email ou mot de passe incorrect.")
                } else {
                    setErrorMsg(result.error)
                }
            }
        })
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Background Ambient Lights */}
            <div className="absolute top-[10%] left-[30%] w-[300px] h-[300px] bg-primary-emerald rounded-full opacity-10 blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Connectez-vous</h1>
                        <p className="text-zinc-400">Bienvenue sur la Marketplace 3D</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {errorMsg && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                                {errorMsg}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="email">
                                Adresse Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="vous@email.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-zinc-300" htmlFor="password">
                                    Mot de passe
                                </label>
                                <Link href="/forgot-password" className="text-xs text-primary-emerald hover:underline">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
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
                                    Connexion...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Pas encore de compte ?{' '}
                        <Link href="/register" className="text-primary-emerald hover:underline font-medium">
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
