create extension if not exists "pgcrypto";

create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- 결제 상태: pending(생성됨) -> paid(승인완료) -> interpreted(AI 해석 완료)
  -- failed/canceled는 결제 실패·취소
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'canceled', 'interpreted')),

  -- 토스페이먼츠에 전달하는 주문번호 (우리 쪽에서 발급, orders.id와 별개로 6~64자 제약 대응)
  toss_order_id text not null unique,
  amount integer not null default 2990,
  payment_key text,
  paid_at timestamptz,

  -- 사주 계산 입력값 (KST 기준 양력)
  birth_year integer not null,
  birth_month integer not null,
  birth_day integer not null,
  birth_hour integer not null,
  birth_minute integer not null,
  gender text not null check (gender in ('male', 'female')),
  privacy_agreed boolean not null default false,

  -- AI 해석 결과 (완료 후 채워짐)
  interpretation jsonb,
  interpreted_at timestamptz
);

create index orders_toss_order_id_idx on orders (toss_order_id);

-- 서버(API route)에서 서비스 롤 키로만 접근한다. 클라이언트(anon 키)의 직접 접근은 차단.
alter table orders enable row level security;
