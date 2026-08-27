import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <main className="page-container" style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <LoginForm />
    </main>
  )
}
