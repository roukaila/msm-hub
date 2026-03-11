'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { resetPassword } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
    const [msg, setMsg] = useState({ text: '', isError: false })
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMsg({ text: '', isError: false })
        const formData = new FormData(e.currentTarget)

        startTransition(async () => {
            const result = await resetPassword(formData)
            if (result?.error) {
                setMsg({ text: result.error, isError: true })
            } else if (result?.success) {
                setMsg({ text: 'Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.', isError: false })
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
                        <h1 className="text-3xl font-extrabold text-white mb-2">Mot de passe oublié</h1>
                        <p className="text-zinc-400">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {msg.text && (
                            <div className={`p-3 border rounded-xl text-sm justify-center flex items-center ${msg.isError ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary-emerald/10 border-primary-emerald/20 text-primary-emerald'}`}>
                                {msg.text}
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
                                disabled={isPending || (!msg.isError && msg.text !== '')}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="vous@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isPending || (!msg.isError && msg.text !== '')}
                            className="w-full py-4 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow mt-2 flex justify-center items-center gap-2 disabled:bg-emerald-800 disabled:text-zinc-400 disabled:cursor-wait"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                "Envoyer le lien"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-zinc-800/50 pt-6 text-center">
                        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
