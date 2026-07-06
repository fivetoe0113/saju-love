const RESEND_API_URL = "https://api.resend.com/emails";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://saju-love.vercel.app";
}

function resultUrl(orderId: string): string {
  return `${siteUrl()}/result/${orderId}`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn("RESEND_API_KEY 또는 RESEND_FROM_EMAIL이 설정되지 않아 이메일을 보내지 않았습니다.");
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend 이메일 발송 실패 (${res.status}): ${body}`);
  }
}

export async function sendResultReadyEmail(to: string, orderId: string, nickname: string): Promise<void> {
  const url = resultUrl(orderId);
  await sendEmail(
    to,
    "라떼여우 - 연애운 해석이 도착했어요",
    `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>${nickname}님, 기다리셨죠? 🦊</p>
      <p>라떼여우가 준비한 연애운 해석이 완성됐어요.</p>
      <p><a href="${url}" style="color: #e8547a; font-weight: bold;">지금 결과 확인하기 →</a></p>
      <p style="color: #888; font-size: 0.85rem;">이 링크는 언제든 다시 눌러서 볼 수 있어요.</p>
    </div>`
  );
}

export async function sendResultLinksEmail(
  to: string,
  orders: { orderId: string; nickname: string; createdAt: string }[]
): Promise<void> {
  const items = orders
    .map(
      (o) =>
        `<li><a href="${resultUrl(o.orderId)}" style="color: #e8547a; font-weight: bold;">${o.nickname}님의 결과 (${new Date(
          o.createdAt
        ).toLocaleDateString("ko-KR")})</a></li>`
    )
    .join("");

  await sendEmail(
    to,
    "라떼여우 - 결과 다시 보기 링크",
    `<div style="font-family: sans-serif; line-height: 1.6;">
      <p>요청하신 결과 링크를 보내드려요.</p>
      <ul>${items}</ul>
      <p style="color: #888; font-size: 0.85rem;">본인이 요청하지 않았다면 이 메일은 무시해주세요.</p>
    </div>`
  );
}
