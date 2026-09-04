import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'

  // Prevent open-redirect attacks: next must be a relative path starting with / and not //
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/'
  }

  // Derive origin safely from forwarded headers if present
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=Could not login with that link`)
}
