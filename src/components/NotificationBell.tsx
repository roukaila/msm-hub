'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function NotificationBell({ userId }: { userId: string }) {
    const supabase = createClient()
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (!userId) return;

        // 1. Fetch initial unread count & latest
        const fetchNotifications = async () => {
            const { data, count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) {
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.is_read).length) // simplification
            }
        }

        fetchNotifications()

        // 2. Subscribe to Realtime inserts/updates
        const subscription = supabase
            .channel(`notifications:user_id=eq.${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    fetchNotifications() // Refresh on any change
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [userId])

    const markAsRead = async () => {
        if (unreadCount === 0) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length > 0) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .in('id', unreadIds)

            setUnreadCount(0)
            setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAsRead();
                }}
                className="relative p-2 text-zinc-300 hover:text-white transition-colors hover:bg-zinc-800/50 rounded-full"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>

                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
                        <h3 className="font-bold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-zinc-500 text-sm">
                                Aucune notification.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-zinc-800/50 flex flex-col gap-1 hover:bg-zinc-800/50 transition-colors ${!n.is_read ? 'bg-primary-emerald/5' : ''}`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-sm ${!n.is_read ? 'text-primary-emerald font-semibold' : 'text-zinc-300'}`}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                            {new Date(n.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 line-clamp-2">
                                        {n.message}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
