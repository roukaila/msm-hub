'use client'

import { useCartStore } from '@/store/cartStore'
import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export interface Product {
    id: string;
    name: string;
    description: string;
    priceDZD: number;
    imageUrl?: string;
    category: string;
    sellerName?: string;
    vendorId?: string;
    rating?: number;
    reviewsCount?: number;
}

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem)
    const cardRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)
    const [isContacting, setIsContacting] = useState(false)
    const router = useRouter()

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Calculate rotation angles (max 15 degrees)
        // Reverse calculation for X because moving mouse down should tilt card UP (rotateX positive)
        const rotateX = -(y / (rect.height / 2)) * 10;
        const rotateY = (x / (rect.width / 2)) * 10;

        setRotation({ x: rotateX, y: rotateY });
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
    }

    const handleReviewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Fonctionnalité d'avis (Reviews) bientôt disponible avec l'intégration backend Supabase.");
    }

    const handleContactClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!product.vendorId) {
            alert("Vendeur inconnu.");
            return;
        }

        setIsContacting(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Veuillez vous connecter pour contacter le vendeur.");
            router.push('/login');
            return;
        }

        // Send an initial automated message
        const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: product.vendorId,
            product_id: product.id,
            content: `Bonjour, je suis intéressé par votre produit : ${product.name}`,
            is_read: false
        });

        setIsContacting(false);
        if (!error) {
            router.push('/dashboard/messagerie');
        } else {
            console.error("Error sending message:", error);
            alert("Erreur lors de l'envoi du message.");
        }
    }

    // Calcul visuel des étoiles (ex: rating 4.5 -> 4 pleines, 1 vide)
    const renderStars = () => {
        const rating = product.rating || 0;
        const maxStars = 5;
        const stars = [];

        for (let i = 1; i <= maxStars; i++) {
            if (i <= rating) {
                // Étoile pleine
                stars.push(
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                );
            } else {
                // Étoile vide (ou grise)
                stars.push(
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-700">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                );
            }
        }
        return stars;
    }

    return (
        <div
            ref={cardRef}
            className="perspective-[1500px] h-full"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`glass-morphism rounded-3xl p-5 premium-shadow flex flex-col h-full transform-gpu transition-all ${isHovered ? 'duration-100 ease-out z-20' : 'duration-500 ease-in-out'}`}
                style={{
                    transform: isHovered
                        ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.05, 1.05, 1.05)`
                        : 'rotateX(2deg) rotateY(0deg) scale3d(1, 1, 1)',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Image or 3D Mockup */}
                <div
                    className="w-full aspect-square bg-zinc-800 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center cursor-pointer transition-shadow duration-300"
                    style={{
                        transform: 'translateZ(30px)', // Effet de profondeur pop-out
                        boxShadow: isHovered ? '0 0 30px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/50 to-transparent z-10" />

                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover relative z-0"
                        />
                    ) : (
                        /* Objet 3D simulé flottant */
                        <div
                            className="w-3/4 h-3/4 bg-primary-emerald/20 rounded-xl relative border border-primary-emerald/30 premium-shadow flex items-center justify-center transition-transform duration-300 z-0"
                            style={{
                                transform: isHovered ? `translateZ(50px) rotateZ(${rotation.x * 2}deg)` : 'translateZ(0) rotateZ(0)'
                            }}
                        >
                            <span className="text-primary-emerald/80 text-sm font-bold tracking-widest uppercase z-10 block text-center break-words px-2">
                                Visuel 3D
                            </span>
                            {/* Lueur d'ambiance 3D */}
                            <div className="absolute inset-0 -z-10 bg-primary-emerald/30 blur-2xl rounded-full opacity-50"></div>
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div className="flex-1 flex flex-col" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-xs text-primary-emerald font-medium uppercase tracking-wider">
                            {product.category}
                        </div>

                        {/* Reviews System */}
                        {(product.rating !== undefined && product.reviewsCount !== undefined) && (
                            <button
                                onClick={handleReviewClick}
                                className="flex items-center gap-1.5 hover:bg-zinc-800/80 px-2 py-1 rounded-lg transition-colors group cursor-pointer"
                                aria-label="Voir les avis"
                            >
                                <div className="flex gap-0.5">
                                    {renderStars()}
                                </div>
                                <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors">
                                    {product.rating} ({product.reviewsCount})
                                </span>
                            </button>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                    <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-end">
                        <div>
                            <span className="text-xs text-zinc-500 block mb-1">{product.sellerName || 'Vendeur Local'}</span>
                            <span className="text-xl text-primary-emerald font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                {product.priceDZD.toLocaleString('fr-DZ')} DZD
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleContactClick}
                                disabled={isContacting}
                                className="relative w-10 h-10 rounded-xl glass-morphism flex items-center justify-center text-zinc-400 hover:text-white transition-colors group/msg overflow-hidden disabled:opacity-50"
                                aria-label="Contacter le vendeur"
                            >
                                <div className="absolute inset-0 bg-zinc-800 opacity-0 group-hover/msg:opacity-100 transition-opacity"></div>
                                {isContacting ? (
                                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin relative z-10"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 relative z-10 group-hover/msg:scale-110 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addItem(product);
                                }}
                                className="relative w-10 h-10 rounded-xl glass-morphism flex items-center justify-center text-white hover:bg-primary-emerald hover:text-black transition-colors overflow-hidden group/btn"
                                aria-label="Ajouter au panier"
                            >
                                <div className="absolute inset-0 bg-primary-emerald opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
