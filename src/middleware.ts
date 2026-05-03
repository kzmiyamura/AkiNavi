import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/update-password']

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
      // ログイン済みならロールに応じてリダイレクト
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (profile?.role === 'developer') return NextResponse.redirect(new URL('/select-role', request.url))
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
    .select('is_approved, is_active, role')
    .eq('id', user.id)
    .single()

  // /pending は未承認ユーザー専用
  if (pathname === '/pending') {
    if (profile?.is_approved) {
      return NextResponse.redirect(new URL('/properties', request.url))
    }
    return supabaseResponse
  }

  // /suspended は停止中ユーザー専用
  if (pathname === '/suspended') {
    // admin/developer は停止対象外 → リダイレクト
    if (profile?.role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    if (profile?.role === 'developer') return NextResponse.redirect(new URL('/select-role', request.url))
    // 停止状態でなければリダイレクト（グローバルも確認）
    if (profile?.is_active !== false) {
      const { data: settings } = await adminSupabase
        .from('system_settings').select('users_login_enabled').eq('id', 1).single()
      if (settings?.users_login_enabled !== false) {
        return NextResponse.redirect(new URL('/properties', request.url))
      }
    }
    return supabaseResponse
  }

  // /select-role は developer 専用
  if (pathname === '/select-role') {
    if (!profile?.is_approved) return NextResponse.redirect(new URL('/pending', request.url))
    if (profile?.role !== 'developer') {
      return NextResponse.redirect(new URL(profile?.role === 'admin' ? '/admin' : '/properties', request.url))
    }
    return supabaseResponse
  }

  // 未承認ユーザー → 承認待ち画面へ
  if (!profile?.is_approved) {
    return NextResponse.redirect(new URL('/pending', request.url))
  }

  // 一般ユーザーの停止チェック（admin/developer は対象外）
  if (profile?.role === 'user') {
    if (profile.is_active === false) {
      return NextResponse.redirect(new URL('/suspended', request.url))
    }
    const { data: settings } = await adminSupabase
      .from('system_settings').select('users_login_enabled').eq('id', 1).single()
    if (settings?.users_login_enabled === false) {
      return NextResponse.redirect(new URL('/suspended', request.url))
    }
  }

  // /admin は admin または developer のみ
  if (pathname.startsWith('/admin') && profile?.role !== 'admin' && profile?.role !== 'developer') {
    return NextResponse.redirect(new URL('/properties', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
