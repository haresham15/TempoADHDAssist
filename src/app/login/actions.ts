'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const rawEmail = formData.get('email') as string
  const email = rawEmail?.trim().toLowerCase()

  if (!email || !email.includes('@')) {
    redirect('/login?message=Please enter a valid email address')
  }

  // Dynamically resolve site origin so redirect works locally, on preview, and in production
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000'
  const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`
  const redirectTarget = `${siteUrl.replace(/\/$/, '')}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTarget,
    },
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email for the login link')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
