import { http, HttpResponse } from 'msw'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://mock.supabase.co'

export const handlers = [
  // properties テーブル
  http.get(`${SUPABASE_URL}/rest/v1/properties`, () => {
    return HttpResponse.json([])
  }),

  // rooms テーブル
  http.get(`${SUPABASE_URL}/rest/v1/rooms`, () => {
    return HttpResponse.json([])
  }),

  // profiles テーブル
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
    return HttpResponse.json([])
  }),
]
