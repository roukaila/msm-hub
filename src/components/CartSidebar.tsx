'use client'

import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartSidebar() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity, getCartTotal } = useCartStore()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || !isOpen) return null;

    return (
        <>
            {/* Overlay sombre */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
            />

            {/* Tiroir */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950 border-l border-zinc-800 z-[101] flex flex-col premium-shadow overflow-hidden translate-x-0 transition-transform duration-300">

                {/* Header du panier */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-900">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Panier <span className="bg-primary-emerald text-black text-xs px-2 py-0.5 rounded-full">{items.length}</span>
                    </h2>
                    <button
                        onClick={toggleCart}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        Fermer ✕
                    </button>
                </div>

                {/* Liste des articles */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="text-center text-zinc-500 mt-20">
                            Votre panier est vide.
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 glass-morphism p-4 rounded-2xl">
                                <div className="w-20 h-20 bg-zinc-900 rounded-xl flex-shrink-0 flex items-center justify-center">
                                    <span className="text-xs text-zinc-600">3D</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-medium truncate">{item.name}</h3>
                                    <p className="text-primary-emerald font-bold text-sm my-1">{item.priceDZD.toLocaleString('fr-DZ')} DZD</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-zinc-900 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="text-zinc-400 hover:text-white px-2"
                                            >-</button>
                                            <span className="text-sm text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="text-zinc-400 hover:text-white px-2"
                                            >+</button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500/70 hover:text-red-500 text-sm underline transition-colors"
                                        >
                                            Retirer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pied et Paiement */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-zinc-400 font-medium">Total Estimé</span>
                            <span className="text-2xl font-bold text-white">{getCartTotal().toLocaleString('fr-DZ')} <span className="text-sm text-primary-emerald">DZD</span></span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={toggleCart} // ferme le panier quand on va au checkout
                            className="w-full flex justify-center py-4 bg-primary-emerald hover:bg-emerald-400 text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow"
                        >
                            Commander (Paiement à la livraison)
                        </Link>
                    </div>
                )}
            </div>
        </>
    )
}
