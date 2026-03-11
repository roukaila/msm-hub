'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { signup } from '@/app/actions/auth'

export default function RegisterPage() {
    const [errorMsg, setErrorMsg] = useState('')
    const [role, setRole] = useState('client')
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')
        const formData = new FormData(e.currentTarget)
        formData.set('role', role)

        startTransition(async () => {
            const result = await signup(formData)
            if (result?.error) {
                if (result.error.includes("already registered")) {
                    setErrorMsg("Un compte existe déjà avec cette adresse email.")
                } else if (result.error.includes("Password should be")) {
                    setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.")
                } else {
                    setErrorMsg(result.error)
                }
            }
        })
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-[10%] right-[30%] w-[300px] h-[300px] bg-primary-emerald rounded-full opacity-10 blur-[120px] pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                <div className="glass-morphism rounded-3xl p-8 premium-shadow">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white mb-2">Inscription</h1>
                        <p className="text-zinc-400">Rejoignez la Marketplace 3D algérienne</p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {errorMsg && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                                {errorMsg}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="role">
                                Je suis un...
                            </label>
                            <select
                                name="role"
                                id="role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald appearance-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-2"
                            >
                                <option value="client">Client & Acheteur</option>
                                <option value="vendeur">Vendeur Local (Algérie)</option>
                                <option value="vendeur_international">Vendeur International</option>
                                <option value="livreur">Livreur / Transporteur</option>
                            </select>

                            {(role === 'vendeur' || role === 'vendeur_international' || role === 'livreur') && (
                                <p className="text-xs text-primary-emerald mb-4">
                                    {role === 'vendeur' && "→ Vous pourrez vendre vos produits en Algérie."}
                                    {role === 'vendeur_international' && "→ Vous pourrez vendre depuis l'étranger. Un numéro d'enregistrement est requis."}
                                    {role === 'livreur' && "→ Vous pourrez proposer vos services de livraison sur la marketplace et en direct."}
                                </p>
                            )}
                        </div>

                        {(role === 'vendeur_international' || role === 'vendeur' || role === 'livreur') && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="country">
                                    Pays de résidence / d'activité
                                </label>
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    required
                                    defaultValue={role === 'vendeur' ? "Algérie" : ""}
                                    readOnly={role === 'vendeur'}
                                    disabled={isPending}
                                    className={`w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${role === 'vendeur' ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    placeholder={role === 'vendeur_international' ? "Ex: France, Canada..." : "Algérie"}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="full_name">
                                Nom complet
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                required
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="Votre nom et prénom"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="phone">
                                Numéro de téléphone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                disabled={isPending}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="0555 12 34 56"
                            />
                        </div>

                        {(role === 'vendeur' || role === 'vendeur_international') && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="company_name">
                                        Nom de l'entreprise / boutique
                                    </label>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        required
                                        disabled={isPending}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l-4 border-l-primary-emerald"
                                        placeholder="Ma Boutique 3D"
                                    />
                                </div>

                                {role === 'vendeur_international' && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="company_id">
                                            Numéro d'enregistrement (SIRET, SIREN, RC...) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="company_id"
                                            name="company_id"
                                            type="text"
                                            required
                                            disabled={isPending}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l-4 border-l-[#ffdb58]"
                                            placeholder="Obligatoire pour l'international"
                                        />
                                    </div>
                                )}
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
                            <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="password">
                                Mot de passe (Min 6 caractères)
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

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow mt-2 flex justify-center items-center gap-2 disabled:bg-emerald-800 disabled:text-zinc-400 disabled:cursor-wait"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Création en cours...
                                </>
                            ) : (
                                "Créer mon compte"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-zinc-400">
                        Déjà inscrit ?{' '}
                        <Link href="/login" className="text-primary-emerald hover:underline font-medium">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
