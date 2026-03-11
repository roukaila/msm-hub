"use client";

import Link from 'next/link'
import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function NouveauProduitPage() {
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...selectedFiles])

            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newPreviews])
        }
    }

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg('')
        setSuccessMsg('')
        setIsLoading(true)

        if (files.length === 0) {
            setErrorMsg("Veuillez sélectionner au moins un média pour le produit.")
            setIsLoading(false)
            return
        }
        if (!formData.name || !formData.category || !formData.price || !formData.stock) {
            setErrorMsg("Veuillez remplir tous les champs obligatoires.")
            setIsLoading(false)
            return
        }

        try {
            // 1. Get authenticated user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // 2. Upload Images to Supabase Storage
            const uploadedUrls: string[] = []

            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}/${Math.random()}.${fileExt}`

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file)

                if (uploadError) {
                    console.error("Storage Error:", uploadError)
                    throw new Error("Erreur lors de l'upload d'un média. Avez-vous exécuté le script SQL V6 ?")
                }

                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName)

                uploadedUrls.push(publicUrlData.publicUrl)
            }

            const imageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null

            // 4. Insert Product into Database
            const { error: insertError } = await supabase
                .from('products')
                .insert({
                    vendor_id: user.id,
                    name: formData.name,
                    category: formData.category,
                    description: formData.description,
                    price: Number(formData.price),
                    stock: Number(formData.stock),
                    image_url: imageUrl,
                    media_urls: uploadedUrls,
                    market_type: 'both' // Default visible everywhere
                })

            if (insertError) {
                console.error("Insert Error:", insertError)
                throw new Error("Erreur lors de l'enregistrement du produit en base de données.")
            }

            setSuccessMsg("Produit ajouté avec succès !")
            setTimeout(() => {
                router.push('/dashboard/produits')
                router.refresh()
            }, 1500)

        } catch (err: any) {
            setErrorMsg(err.message || "Une erreur inattendue s'est produite.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-10 flex items-center gap-4">
                <Link
                    href="/dashboard/produits"
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 transition-colors text-zinc-400 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Ajouter un produit</h1>
                    <p className="text-zinc-400 mt-1">Créez une nouvelle fiche produit pour votre catalogue</p>
                </div>
            </div>

            <div className="glass-morphism rounded-3xl p-8 premium-shadow max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {errorMsg && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-4 bg-primary-emerald/10 border border-primary-emerald/30 rounded-xl text-primary-emerald text-sm emerald-glow">
                            {successMsg}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Nom du produit <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors"
                                    placeholder="Ex: iPhone 15 Pro Max"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Catégorie <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald appearance-none"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    <option value="Électronique">Électronique</option>
                                    <option value="Meubles & Déco">Meubles & Déco</option>
                                    <option value="Mode">Mode</option>
                                    <option value="Beauté & Santé">Beauté & Santé</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors"
                                    placeholder="Décrivez votre produit en détail..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Prix (DZD) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Quantité en stock <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-emerald focus:ring-1 focus:ring-primary-emerald transition-colors"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">Médias du Produit (Photos & Vidéos) <span className="text-red-500">*</span></label>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    capture="environment"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-900/30 hover:border-primary-emerald/50 hover:text-primary-emerald transition-colors cursor-pointer group mb-4"
                                >
                                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-emerald">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-white mb-1">Cliquez pour ajouter des médias (ou prendre une photo/vidéo)</span>
                                    <span className="text-xs text-zinc-500">Formats: JPG, PNG, MP4, etc.</span>
                                </div>

                                {previewUrls.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative group rounded-xl overflow-hidden border border-zinc-800 aspect-square">
                                                {files[index]?.type.startsWith('video/') ? (
                                                    <video src={url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                                                    className="absolute top-2 right-2 bg-black/50 hover:bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-800 flex justify-end gap-4">
                        <Link
                            href="/dashboard/produits"
                            className="px-6 py-3 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors flex items-center"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-primary-emerald hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none text-black font-bold rounded-xl transition-all duration-300 emerald-glow premium-shadow flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                    Publication...
                                </>
                            ) : (
                                "Publier le produit"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
