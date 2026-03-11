'use client'

import React, { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import MapTrackerWrapper from '@/components/MapTrackerWrapper'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ClientGPSPage({ params }: { params: { id: string } }) {
    const referenceId = params.id
    const supabase = createClient()
    const [transporterName, setTransporterName] = useState('Chargement...')

    // Tenter de récupérer les infos de la course pour afficher le livreur
    useEffect(() => {
        const fetchDetails = async () => {
            // Check in custom_deliveries first
            let { data: customData } = await supabase.from('custom_deliveries').select('transporter:transporter_id(full_name, phone)').eq('id', referenceId).single()
            if ((customData as any)?.transporter) {
                setTransporterName(`${(customData as any).transporter.full_name} (${(customData as any).transporter.phone})`)
                return
            }

            // Check in orders
            let { data: orderData } = await supabase.from('orders').select('transporter:transporter_id(full_name, phone)').eq('id', referenceId).single()
            if ((orderData as any)?.transporter) {
                setTransporterName(`${(orderData as any).transporter.full_name} (${(orderData as any).transporter.phone})`)
                return
            }

            setTransporterName('Livreur en approche')
        }
        fetchDetails()
    }, [referenceId, supabase])

    return (
        <main className="min-h-screen bg-dark-bg text-white">
            <Navbar />

            <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Link href="/client-dashboard" className="text-sm text-primary-emerald hover:underline mb-2 inline-block">
                            ← Retour à mes commandes
                        </Link>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                            Suivi de Livraison en Direct
                        </h1>
                        <p className="text-zinc-400 mt-1">Livreur : <span className="text-white font-medium">{transporterName}</span></p>
                    </div>
                </div>

                <div className="glass-morphism rounded-3xl p-4 md:p-6 border border-zinc-800">
                    {/* La position initiale d'Alger par défaut, MapTracker la mettra à jour à la première ping GPS reçue */}
                    <MapTrackerWrapper referenceId={referenceId} initialLat={36.7538} initialLng={3.0588} />
                </div>
            </div>
        </main>
    )
}
