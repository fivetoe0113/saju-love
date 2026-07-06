import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 클라이언트. service role 키는 RLS를 우회하므로 API 라우트 등
 * 서버 코드에서만 import 해야 하며, 클라이언트 번들에 노출되면 안 된다.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type OrderRow = {
  id: string;
  created_at: string;
  status: "pending" | "paid" | "processing" | "failed" | "canceled" | "interpreted";
  toss_order_id: string;
  amount: number;
  nickname: string;
  email: string;
  source: "direct" | "share";
  payment_key: string | null;
  paid_at: string | null;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  birth_minute: number;
  gender: "male" | "female";
  privacy_agreed: boolean;
  interpretation: unknown | null;
  interpreted_at: string | null;
};
