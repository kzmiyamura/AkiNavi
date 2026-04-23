import { redirect } from 'next/navigation'

// middleware がルーティングを制御するため、ここには到達しない
// 念のため /login へリダイレクト
export default function RootPage() {
  redirect('/login')
}
