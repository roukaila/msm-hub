'use client'

import dynamic from 'next/dynamic'
import React from 'react'

// Contournement de l'erreur "window is not defined" pour react-leaflet dans Next.js App Router
const MapTrackerNoSSR = dynamic(() => import('./MapTracker'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-primary-emerald rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-500 font-medium">Chargement de la carte...</p>
        </div>
    )
})

interface MapTrackerWrapperProps {
    referenceId: string;
    initialLat?: number;
    initialLng?: number;
}

export default function MapTrackerWrapper(props: MapTrackerWrapperProps) {
    return <MapTrackerNoSSR {...props} />
}
