'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createClient } from '@/utils/supabase/client'

// Création d'un marqueur personnalisé avec SVG (évite les problèmes de chemin d'image par défaut Leaflet)
const customMarkerIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981" style="width: 32px; height: 32px; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.5));">
          <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
         </svg>`,
    className: 'bg-transparent border-none',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
})

interface MapTrackerProps {
    referenceId: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MapTracker({ referenceId, initialLat = 36.7538, initialLng = 3.0588 }: MapTrackerProps) {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng])
    const supabase = createClient()
    const [isLive, setIsLive] = useState(false)

    useEffect(() => {
        // 1. Charger la dernière position connue depuis la BDD au montage
        const fetchInitialPosition = async () => {
            const { data } = await supabase
                .from('delivery_tracking')
                .select('latitude, longitude')
                .eq('reference_id', referenceId)
                .order('last_updated', { ascending: false })
                .limit(1)
                .single()

            if (data) {
                setPosition([data.latitude, data.longitude])
                setIsLive(true)
            }
        }

        fetchInitialPosition()

        // 2. S'abonner aux changements en temps réel
        const channel = supabase
            .channel(`tracking_${referenceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // ou UPDATE selon la façon dont on pousse les données
                    schema: 'public',
                    table: 'delivery_tracking',
                    filter: `reference_id=eq.${referenceId}`
                },
                (payload) => {
                    const newRecord = payload.new as { latitude: number, longitude: number }
                    setPosition([newRecord.latitude, newRecord.longitude])
                    setIsLive(true)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [referenceId, supabase])

    return (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-zinc-800">
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-[400] bg-zinc-900/90 backdrop-blur border border-zinc-800 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-primary-emerald animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs font-medium text-white">
                    {isLive ? 'En direct' : 'En attente du signal GPS'}
                </span>
            </div>

            <MapContainer
                center={position}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Utilisation de couches de tuiles sombres (Dark mode Leaflet) via CartoDB */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <Marker position={position} icon={customMarkerIcon}>
                    <Popup className="text-black">
                        <strong>Livreur en route</strong><br />
                        Dernière mise à jour : {new Date().toLocaleTimeString()}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}
