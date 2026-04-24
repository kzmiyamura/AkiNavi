import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 公開ルート（未ログインでもアクセス可）
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL('/properties', request.url))
    }
    return supabaseResponse
  }

  // 未ログイン → ログインへ
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // プロフィール取得（RLS バイパスのため service role を使用）
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('is_approved, role')
    .eq('id', user.id)
    .single()

  // /pending は未承認ユーザー専用
  if (pathname === '/pending') {
    if (profile?.is_approved) {
      return NextResponse.redirect(new URL('/properties', request.url))
    }
    return supabaseResponse
  }

  // 未承認ユーザー → 承認待ち画面へ
  if (!profile?.is_approved) {
    return NextResponse.redirect(new URL('/pending', request.url))
  }

  // /admin は admin ロール専用
  if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/properties', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
