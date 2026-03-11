'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/actions/vendorOrders'

export default function OrderStatusSelect({
    orderItemId,
    initialStatus
}: {
    orderItemId: string;
    initialStatus: string;
}) {
    const [status, setStatus] = useState(initialStatus)
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus)
        startTransition(async () => {
            const result = await updateOrderStatus(orderItemId, newStatus)
            if (result?.error) {
                alert(result.error)
                setStatus(initialStatus) // Revert on UI
            }
        })
    }

    const getStatusStyle = (currentStatus: string) => {
        switch (currentStatus) {
            case 'en attente':
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case 'expédiée':
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case 'livrée':
                return "bg-primary-emerald/10 text-primary-emerald border-primary-emerald/30 emerald-glow";
            case 'annulée':
                return "bg-red-500/10 text-red-500 border-red-500/20";
            default:
                return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
        }
    };

    return (
        <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className={`appearance-none px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border cursor-pointer outline-none transition-all disabled:opacity-50 ${getStatusStyle(status)}`}
            style={{ textAlignLast: 'center' }}
        >
            <option value="en attente" className="bg-zinc-900 text-yellow-500">En attente</option>
            <option value="expédiée" className="bg-zinc-900 text-blue-400">Expédiée</option>
            <option value="livrée" className="bg-zinc-900 text-primary-emerald">Livrée</option>
            <option value="annulée" className="bg-zinc-900 text-red-500">Annulée</option>
        </select>
    )
}
