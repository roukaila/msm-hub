'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // 1. Extraction des données
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Veuillez remplir tous les champs.' }
    }

    // 2. Auth avec Supabase
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    // 3. Gestion d'erreur (côté serveur)
    if (error) {
        return { error: error.message }
    }

    // 4. Succès -> redirection rafraîchie
    revalidatePath('/')
    redirect('/catalogue') // Redirection vers l'accueil ou le catalogue
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string // 'client', 'vendeur', 'vendeur_international', 'livreur'
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const company_name = formData.get('company_name') as string
    const country = formData.get('country') as string || 'Algérie'
    const company_id = formData.get('company_id') as string

    if (!email || !password || !role || !full_name || !phone) {
        return { error: 'Veuillez remplir tous les champs obligatoires.' }
    }

    // Auth avec Supabase
    // Note : On sauvegarde le rôle dans les "user_metadata"
    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role,
                full_name,
                phone,
                company_name: company_name || null,
                country: country,
                company_id: company_id || null
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    // Mettre à jour directement le profil pour s'assurer que les nouveaux champs sont là
    if (authData.user) {
        await supabase.from('profiles').update({
            full_name,
            phone,
            company_name: company_name || null,
            country: country,
            company_id: company_id || null,
            role: role // Utile de forcer la synchro de rôle ici en backup du trigger
        }).eq('id', authData.user.id)
    }

    revalidatePath('/')
    // Note: par défaut sur Supabase, s'inscrire connecte l'utilisateur si la confirmation par email est PENDANTE/désactivée.
    redirect('/catalogue')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Veuillez renseigner votre email.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password) {
        return { error: 'Veuillez renseigner un nouveau mot de passe.' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    redirect('/login?message=Mot de passe mis à jour avec succès.')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    revalidatePath('/')
    redirect('/login')
}

export async function deleteAccount() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Non autorisé")
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY or URL")
        throw new Error("Erreur de configuration du serveur.")
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
        console.error("Error deleting user:", error)
        throw new Error("Impossible de supprimer le compte.")
    }

    await supabase.auth.signOut()
    revalidatePath('/')
    redirect('/')
}
