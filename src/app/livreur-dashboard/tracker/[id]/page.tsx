'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import MapTrackerWrapper from '@/components/MapTrackerWrapper'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LivreurGPSPage({ params }: { params: { id: string } }) {
    const referenceId = params.id
    const searchParams = useSearchParams()
    const deliveryType = searchParams.get('type') || 'marketplace' // 'marketplace' ou 'custom'

    const supabase = createClient()
    const [isTracking, setIsTracking] = useState(false)
    const [watchId, setWatchId] = useState<number | null>(null)
    const [error, setError] = useState('')
    const [updateCount, setUpdateCount] = useState(0)
    const [lastLoc, setLastLoc] = useState<{ lat: number, lng: number } | null>(null)
    const [clientName, setClientName] = useState('Chargement...')

    // Récupérer le nom du client ciblé
    useEffect(() => {
        const fetchDetails = async () => {
            if (deliveryType === 'custom') {
                const { data } = await supabase.from('custom_deliveries').select('client:client_id(full_name)').eq('id', referenceId).single()
                if ((data as any)?.client) setClientName((data as any).client.full_name)
            } else {
                const { data } = await supabase.from('orders').select('client:client_id(full_name)').eq('id', referenceId).single()
                if ((data as any)?.client) setClientName((data as any).client.full_name)
            }
        }
        fetchDetails()
    }, [referenceId, deliveryType, supabase])

    const startTracking = async () => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par votre navigateur.")
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        let clientId = ''
        // Récupérer l'ID du client pour remplir table (transporter_id et client_id doivent être corrects)
        if (deliveryType === 'custom') {
            const { data } = await supabase.from('custom_deliveries').select('client_id').eq('id', referenceId).single()
            if (data) clientId = data.client_id
        } else {
            const { data } = await supabase.from('orders').select('client_id').eq('id', referenceId).single()
            if (data) clientId = data.client_id
        }

        setIsTracking(true)
        setError('')

        const id = navigator.geolocation.watchPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLastLoc({ lat: latitude, lng: longitude })

                // Insérer ou mettre à jour la position
                const { error: dbError } = await supabase.from('delivery_tracking').insert([
                    {
                        reference_id: referenceId,
                        reference_type: deliveryType,
                        transporter_id: user.id,
                        client_id: clientId || user.id, // fallback si erreur
                        latitude,
                        longitude,
                        last_updated: new Date().toISOString()
                    }
                ])

                if (dbError) {
                    console.error("Erreur d'insertion GPS:", dbError)
                } else {
                    setUpdateCount(prev => prev + 1)
                }
            },
            (err) => {
                setError(`Erreur GPS : ${err.message}`)
                stopTracking()
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )

        setWatchId(id)
    }

    const stopTracking = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
        }
        setIsTracking(false)
    }

    useEffect(() => {
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId)
        }
    }, [watchId])

    return (
        <main className="min-h-screen bg-dark-bg text-white">
            <Navbar />

            <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/livreur-dashboard" className="text-sm text-zinc-400 hover:text-white mb-2 inline-block">
                            ← Retour au Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold">Course en cours</h1>
                        <p className="text-zinc-400 text-sm mt-1">Livraison pour : {clientName}</p>
                    </div>

                    <div className="flex gap-4 items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                        {isTracking ? (
                            <button
                                onClick={stopTracking}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-bold transition-colors"
                            >
                                Arrêter le GPS
                            </button>
                        ) : (
                            <button
                                onClick={startTracking}
                                className="bg-primary-emerald hover:bg-emerald-400 text-black px-6 py-2 rounded-xl font-bold transition-colors"
                            >
                                Démarrer le GPS
                            </button>
                        )}

                        <div className="text-right">
                            <span className="block text-xs font-medium text-zinc-400 uppercase tracking-widest">Pings envoyés</span>
                            <span className="block text-xl font-bold text-white">{updateCount}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="relative">
                    {/* Affichage de la position locale (fallback sans MapTracker si désiré, ou avec base) */}
                    {lastLoc ? (
                        <MapTrackerWrapper referenceId={referenceId} initialLat={lastLoc.lat} initialLng={lastLoc.lng} />
                    ) : (
                        <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-zinc-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                            </div>
                            <h3 className="text-zinc-300 font-medium text-lg">Position inconnue</h3>
                            <p className="text-zinc-500 text-sm mt-2 max-w-sm">
                                Cliquez sur "Démarrer le GPS" et autorisez le navigateur à accéder à votre position.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
