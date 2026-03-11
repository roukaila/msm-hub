"use client"
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Profile {
    full_name: string;
    phone?: string;
    company_name?: string;
}

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    product_id?: string;
    content: string;
    is_read: boolean;
    attachment_url?: string;
    attachment_type?: string;
    created_at: string;
    sender?: Profile;
    receiver?: Profile;
}

interface Contact {
    id: string;
    name: string;
    phone: string | null;
    company: string | null;
    lastMessage: string;
    updatedAt: string;
    unread: number;
}

export default function MessageriePage() {
    const router = useRouter()
    const supabase = createClient()

    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [activeContactId, setActiveContactId] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [attachment, setAttachment] = useState<File | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const attachmentInputRef = useRef<HTMLInputElement>(null)

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (activeContactId) {
            scrollToBottom()
            // Marquer les messages comme lus (Optionnel)
        }
    }, [messages, activeContactId])

    useEffect(() => {
        const fetchUserAndMessages = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setCurrentUser({ id: user.id })

            // Fetch messages with profiles
            const { data, error } = await supabase
                .from('messages')
                .select(`*, sender:sender_id(full_name, phone, company_name), receiver:receiver_id(full_name, phone, company_name)`)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: true })

            if (error) {
                console.error("Error fetching messages:", error)
            } else if (data) {
                setMessages(data)
                processContacts(data, user.id)
            }
            setIsLoading(false)
        }

        fetchUserAndMessages()

        // Realtime Subscription
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                async (payload) => {
                    const newMsg = payload.new as Message;

                    // Fetch nested profile data for the new message to keep consistency
                    const { data: enrichedMsg } = await supabase
                        .from('messages')
                        .select(`*, sender:sender_id(full_name, phone, company_name), receiver:receiver_id(full_name, phone, company_name)`)
                        .eq('id', newMsg.id)
                        .single();

                    if (enrichedMsg) {
                        setMessages(prev => {
                            const updatedMessages = [...prev, enrichedMsg]
                            // We need current user id to process contacts, so we use a ref or await state
                            return updatedMessages;
                        });
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    // Re-process contacts whenever messages change
    useEffect(() => {
        if (currentUser && messages.length > 0) {
            processContacts(messages, currentUser.id);
        }
    }, [messages, currentUser])

    const processContacts = (allMessages: Message[], userId: string) => {
        const contactsMap = new Map<string, Contact>()

        allMessages.forEach(m => {
            const isMeSender = m.sender_id === userId
            const otherId = isMeSender ? m.receiver_id : m.sender_id
            const otherProfile = isMeSender ? m.receiver : m.sender
            const otherName = otherProfile?.full_name || 'Utilisateur inconnu'
            const otherPhone = otherProfile?.phone || null
            const otherCompany = otherProfile?.company_name || null

            const existing = contactsMap.get(otherId)

            if (!existing) {
                contactsMap.set(otherId, {
                    id: otherId,
                    name: otherName,
                    phone: otherPhone,
                    company: otherCompany,
                    lastMessage: m.content || (m.attachment_url ? 'Pièce jointe' : ''),
                    updatedAt: m.created_at,
                    unread: (!isMeSender && !m.is_read) ? 1 : 0
                })
            } else {
                // Update with latest message
                existing.lastMessage = m.content || (m.attachment_url ? 'Pièce jointe' : '')
                existing.updatedAt = m.created_at
                if (!isMeSender && !m.is_read) {
                    existing.unread += 1
                }
            }
        })

        const sortedContacts = Array.from(contactsMap.values()).sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        setContacts(sortedContacts)

        // Auto-select first contact if none selected
        if (!activeContactId && sortedContacts.length > 0) {
            setActiveContactId(sortedContacts[0].id)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!newMessage.trim() && !attachment) || !activeContactId || !currentUser) return

        setIsSending(true)
        let attachmentUrl = null
        let attachmentType = null

        if (attachment) {
            const fileExt = attachment.name.split('.').pop()
            const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('message_attachments')
                .upload(fileName, attachment)

            if (!uploadError) {
                const { data } = supabase.storage.from('message_attachments').getPublicUrl(fileName)
                attachmentUrl = data.publicUrl

                if (attachment.type.startsWith('image/')) attachmentType = 'image'
                else if (attachment.type.startsWith('video/')) attachmentType = 'video'
                else attachmentType = 'document'
            }
        }

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: currentUser.id,
                receiver_id: activeContactId,
                content: newMessage.trim(),
                is_read: false,
                attachment_url: attachmentUrl,
                attachment_type: attachmentType
            })

        if (error) {
            console.error("Error sending message:", error)
        } else {
            setNewMessage("")
            setAttachment(null)
        }
        setIsSending(false)
    }

    const activeMessages = messages.filter(m =>
        (m.sender_id === activeContactId && m.receiver_id === currentUser?.id) ||
        (m.sender_id === currentUser?.id && m.receiver_id === activeContactId)
    )

    const activeContactData = contacts.find(c => c.id === activeContactId)

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-12 h-12 border-4 border-primary-emerald border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <main className="min-h-[calc(100vh-80px)] w-full p-4 lg:p-8 pt-24 text-white">
            <div className="max-w-7xl mx-auto h-[80vh] flex flex-col glass-morphism rounded-3xl premium-shadow overflow-hidden border border-zinc-800">

                {/* Header global Messagerie */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Messagerie</h1>
                        <p className="text-sm text-primary-emerald font-medium">Réponses rapides = Clients fidèles</p>
                    </div>
                </div>

                {/* Conteneur principal: Liste Gauche / Chat Droite */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar Conversations */}
                    <div className="w-full md:w-1/3 border-r border-zinc-800 bg-zinc-900/20 overflow-y-auto hidden md:flex flex-col">
                        <div className="p-4 border-b border-zinc-800/50">
                            <input
                                type="text"
                                placeholder="Rechercher une discussion..."
                                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-primary-emerald transition-colors"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {contacts.length === 0 ? (
                                <p className="text-center text-zinc-500 text-sm mt-10">Aucune conversation</p>
                            ) : contacts.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveContactId(conv.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${activeContactId === conv.id ? 'bg-primary-emerald/10 border-l-2 border-primary-emerald' : 'hover:bg-zinc-800/50 border-l-2 border-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-bold ${activeContactId === conv.id ? 'text-white' : 'text-zinc-300'}`}>{conv.name}</h3>
                                        <span className="text-[10px] text-zinc-500">
                                            {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-zinc-400 truncate pr-4">{conv.lastMessage}</p>
                                        {conv.unread > 0 && (
                                            <span className="w-5 h-5 flex items-center justify-center bg-primary-emerald text-black text-xs font-bold rounded-full">{conv.unread}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone de Chat Active */}
                    <div className="flex-1 flex flex-col bg-zinc-950/30">
                        {activeContactId ? (
                            <>
                                {/* Header de la discussion active */}
                                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setActiveContactId(null)}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <div className="w-10 h-10 rounded-full bg-zinc-700 font-bold flex items-center justify-center text-white">
                                            {activeContactData?.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-white">{activeContactData?.name}</h2>
                                            <p className="text-xs text-primary-emerald">
                                                {activeContactData?.company ? `${activeContactData.company} • En ligne` : 'En ligne'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeContactData?.phone && (
                                            <>
                                                <a href={`https://wa.me/${activeContactData.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 hover:bg-[#25D366]/20 hover:text-[#25D366] text-zinc-400 rounded-full transition-colors" title="WhatsApp">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                                                </a>
                                                <a href={`https://t.me/+${activeContactData.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 hover:bg-[#0088cc]/20 hover:text-[#0088cc] text-zinc-400 rounded-full transition-colors" title="Telegram">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Historique Messages */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                                    {activeMessages.map(msg => {
                                        const isMe = msg.sender_id === currentUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-3 md:p-4 premium-shadow ${isMe
                                                    ? 'bg-primary-emerald/20 border border-primary-emerald/30 text-emerald-50 rounded-tr-sm'
                                                    : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                                                    }`}>
                                                    <div className="space-y-2">
                                                        {msg.attachment_url && (
                                                            <div className="rounded-lg overflow-hidden border border-zinc-700/50 mb-2">
                                                                {msg.attachment_type === 'image' && (
                                                                    <img src={msg.attachment_url} alt="Attachment" className="max-w-full h-auto max-h-48 object-cover" />
                                                                )}
                                                                {msg.attachment_type === 'video' && (
                                                                    <video src={msg.attachment_url} controls className="max-w-full h-auto max-h-48" />
                                                                )}
                                                                {msg.attachment_type === 'document' && (
                                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-zinc-900/50 text-emerald-400 hover:underline">
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                                        Télécharger le fichier
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.content && <p className="text-sm break-words">{msg.content}</p>}
                                                    </div>
                                                    <span className={`text-[10px] mt-2 block ${isMe ? 'text-emerald-500/50 text-right' : 'text-zinc-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input d'envoi */}
                                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 shrink-0">
                                    {attachment && (
                                        <div className="mb-3 px-4 py-2 bg-zinc-800 rounded-xl flex items-center justify-between text-sm">
                                            <span className="truncate flex-1 text-zinc-300">{attachment.name}</span>
                                            <button onClick={() => setAttachment(null)} className="text-zinc-500 hover:text-red-400 p-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2 bg-zinc-950 rounded-full border border-zinc-800 focus-within:border-primary-emerald/50 transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={attachmentInputRef}
                                            onChange={(e) => setAttachment(e.target.files ? e.target.files[0] : null)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => attachmentInputRef.current?.click()}
                                            className="p-2 text-zinc-400 hover:text-white rounded-full transition-colors shrink-0"
                                            title="Joindre un fichier (Photo, Vidéo...)"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Écrivez votre message..."
                                            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none px-2"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSending || (!newMessage.trim() && !attachment)}
                                            className="p-3 bg-primary-emerald text-black rounded-full hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all emerald-glow premium-shadow shrink-0"
                                        >
                                            {isSending ? (
                                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 mb-4 opacity-50">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                <p>Sélectionnez une discussion pour commencer</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
