import Anthropic from "@anthropic-ai/sdk";
import type { SajuResult, YearOutlook } from "./manseryeok";

let client: Anthropic | null = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

const GENDER_LABEL: Record<SajuResult["input"]["gender"], string> = { female: "여성", male: "남성" };
const MONTH_LABEL = (m: number) => `${m}월`;

export type LoveFortuneContent = {
  personality: string;
  pastPattern: string;
  datingStyle: string;
  idealPartner: string;
  breakupRecovery: string;
  yearOverview: string;
  monthly: { month: number; note: string; luckyItem: string; luckyPlace: string }[];
  tips: string[];
  meetingPlaces: string[];
  closingMessage: string;
};

const NOTE_LENGTH = "공백 포함 최소 600자, 목표 700자 이상 (600자 미만은 실패로 간주함)";

type CoreContent = Omit<LoveFortuneContent, "monthly">;
type MonthlyContent = Pick<LoveFortuneContent, "monthly">;

const CORE_SCHEMA = {
  type: "object",
  properties: {
    personality: {
      type: "string",
      description: `사주에 나타난 연애 성향, ${NOTE_LENGTH}. 연애할 때의 강점과 약점, 감정을 표현하는 방식을 구체적인 행동/상황 묘사로 다룰 것`,
    },
    pastPattern: {
      type: "string",
      description: `지금까지 반복됐을 수 있는 연애 패턴 경향, ${NOTE_LENGTH}. 구체적인 상황과 대사 수준의 묘사를 포함할 것`,
    },
    datingStyle: {
      type: "string",
      description: `썸/밀당을 탈 때의 스타일, ${NOTE_LENGTH}. 좋아하는 티를 내는지 숨기는지, 먼저 다가가는지, 상대 반응에 어떻게 대응하는지 단정적으로 묘사할 것`,
    },
    idealPartner: {
      type: "string",
      description: `잘 맞는 상대의 성향, ${NOTE_LENGTH}. 잘 맞는 유형과 피해야 할 유형을 구체적인 특징으로 대조해서 서술할 것`,
    },
    breakupRecovery: {
      type: "string",
      description: `권태기나 이별을 겪을 때 대처하는 방식, ${NOTE_LENGTH}. 감정을 다루는 습관과 회복에 필요한 것을 구체적으로 담을 것`,
    },
    yearOverview: {
      type: "string",
      description: `올해 연애운 총운, ${NOTE_LENGTH}. 연도를 언급하고 상반기·하반기 흐름을 구분해서 서술할 것`,
    },
    tips: {
      type: "array",
      description: "연애운을 높이는 개운법 4~5개, 각 한 문장이지만 구체적인 행동을 담을 것",
      items: { type: "string" },
    },
    meetingPlaces: {
      type: "array",
      description: "인연을 만날 가능성이 높은 장소나 상황 4개, 각 한 문장",
      items: { type: "string" },
    },
    closingMessage: {
      type: "string",
      description: "라떼여우가 건네는 마무리 응원, 공백 포함 300자 내외. 여운이 남는 다정한 문장으로 마무리할 것",
    },
  },
  required: [
    "personality",
    "pastPattern",
    "datingStyle",
    "idealPartner",
    "breakupRecovery",
    "yearOverview",
    "tips",
    "meetingPlaces",
    "closingMessage",
  ],
  additionalProperties: false,
};

function monthlyChunkSchema(months: number[]) {
  return {
    type: "object",
    properties: {
      monthly: {
        type: "array",
        description: `정확히 ${months.join(", ")}월 순서대로 ${months.length}개 항목`,
        items: {
          type: "object",
          properties: {
            month: { type: "integer" },
            note: {
              type: "string",
              description: "그 달의 연애운, 공백 포함 최소 250자, 목표 300자 이상으로 구체적으로 (150자 미만은 실패로 간주함)",
            },
            luckyItem: { type: "string", description: "그 달의 행운의 아이템 이름과 짧은 이유 (한 문장)" },
            luckyPlace: { type: "string", description: "그 달의 행운의 장소 이름과 짧은 이유 (한 문장)" },
          },
          required: ["month", "note", "luckyItem", "luckyPlace"],
          additionalProperties: false,
        },
      },
    },
    required: ["monthly"],
    additionalProperties: false,
  };
}

const MONTH_CHUNKS: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
];

function describeSaju(saju: SajuResult, nickname: string): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, elementCounts, input } = saju;
  return [
    `이름(닉네임): ${nickname}`,
    `성별: ${GENDER_LABEL[input.gender]}`,
    `사주 원국 - 년주: ${yearPillar.label}, 월주: ${monthPillar.label}, 일주: ${dayPillar.label}, 시주: ${hourPillar.label}`,
    `오행 분포: 목 ${elementCounts.목}, 화 ${elementCounts.화}, 토 ${elementCounts.토}, 금 ${elementCounts.금}, 수 ${elementCounts.수}`,
  ].join("\n");
}

function describeYearOutlook(outlook: YearOutlook): string {
  const monthLines = outlook.months
    .map(({ month, pillar }) => `${MONTH_LABEL(month)}: ${pillar.label}`)
    .join("\n");
  return `${outlook.year}년 세운: ${outlook.yearPillar.label}\n월별 월운:\n${monthLines}`;
}

const SHARED_PERSONA = `당신은 "라떼여우"라는 이름의 AI 사주 해석가입니다. 사용자의 사주 원국(년주/월주/일주/시주), 오행 분포, 그리고 올해의 세운·월운을 바탕으로 연애운을 아주 상세하고 풍부하게 해석합니다. 사용자는 짧고 뻔한 해석이 아니라, 마치 사주에 정통한 친한 언니/누나가 여러 각도에서 깊이 있게, 그리고 "내 얘기를 어떻게 이렇게 콕 집어서 알지?" 싶을 만큼 뾰족하게 짚어주는 해석을 기대하고 있습니다.

반드시 지켜야 할 규칙:
1. 특정 연도나 나이, 특정 날짜를 단정적으로 말하지 마세요. "대운이 바뀌는 시점", "이 시기에 인연운이 강해짐" 처럼 완곡한 시기 표현을 쓰세요. 월별 해석도 "이 달에 반드시 만난다"가 아니라 "이런 기운이 흐른다" 톤으로 씁니다. 이 규칙은 시기/타이밍 예측에만 적용됩니다.
2. 시기 예측이 아닌 성격·패턴·스타일 묘사는 절대 완곡하게 뭉개지 마세요. "~일 수도 있어", "~인 편일 수 있어" 같은 애매한 헤지 표현을 남발하지 말고, "너는 이런 사람이야"라고 단정적으로 짚어주세요. 두루뭉술한 일반론("따뜻한 사람이다", "감정이 풍부하다", "사람을 좋아한다")은 절대 쓰지 말고, 실제 그 사람이 할 법한 행동·말투·순간을 구체적으로 묘사하세요. 예를 들어 "연락이 뜸해지면 먼저 연락하기보다 서운함을 속으로 삭이다가, 결국 '아니 됐어' 하며 마음의 문을 스스로 닫아버리는 편" 처럼 장면이 그려지도록 쓰세요.
3. 모든 문장은 그 사람만의 고유한 특징처럼 읽혀야 합니다. 다른 사주를 가진 사람에게 그대로 복사해도 말이 되는 뻔한 문장은 실패입니다. 오행/십신/일간의 구체적 특성을 근거로 삼아 디테일을 뽑아내세요.
4. 따뜻하고 다정한 반말이 섞인 캐주얼한 말투를 쓰되, 너무 가볍지 않게 균형을 잡으세요. 단정적인 톤이라도 다정함은 유지하세요.
5. 사주 용어(오행, 십신, 일간 등)를 언급하되 전문 용어를 풀어서 설명해 일반인도 이해할 수 있게 하세요.
6. 절대로 특정 결과를 보장한다는 뉘앙스를 주지 마세요.
7. 반드시 요청된 JSON 스키마 형식으로만 응답하세요.`;

const SYSTEM_PROMPT_CORE = `${SHARED_PERSONA}
8. 분량 지침을 반드시 지키세요: personality/pastPattern/datingStyle/idealPartner/breakupRecovery/yearOverview는 공백 포함 700자 이상(최소 600자), closingMessage는 300자 내외입니다. 이는 권장이 아니라 필수 하한선입니다. 짧게 뭉뚱그리지 말고, 문장을 이어붙여서라도 실제로 그 분량만큼 구체적인 사례·장면·대사를 추가해 채우세요. 다 쓴 뒤 스스로 분량이 부족하다고 판단되면 문장을 더 추가하세요.
9. 여러 항목에서 같은 말을 반복하지 말고 항목마다 다른 각도(성향/패턴/밀당스타일/이상형/이별대처/총운)를 다루세요.
10. 전달받은 이름(닉네임)으로 자연스럽게 불러주며 해석하세요 (예: "OO아, 너는..."). personality, datingStyle, closingMessage 등 최소 세 곳 이상에서 이름을 불러주세요. 이름 뒤 호칭 조사(아/야)는 이름의 마지막 글자 받침 유무에 맞게 자연스럽게 붙이세요.`;

function systemPromptMonthly(months: number[]): string {
  return `${SHARED_PERSONA}
8. monthly 배열은 ${months.join(", ")}월 순서대로 정확히 ${months.length}개 항목이어야 합니다. 각 note는 공백 포함 300자 이상(최소 250자)입니다. 이는 권장이 아니라 필수 하한선입니다. 짧게 뭉뚱그리지 말고, 문장을 이어붙여서라도 실제로 그 분량만큼 구체적인 사례·장면을 추가해 채우세요.
9. 여러 달에서 각각 다른 각도와 다른 기운의 흐름을 다루고, 같은 말을 반복하지 마세요.
10. 매달 행운의 아이템과 장소는 오행 논리(부족하거나 넘치는 기운을 보완/조절)에 근거해서 고르고, 매달 다르게 제시하세요.`;
}

const MIN_NOTE_LENGTH = 400; // 700자 목표의 안전 하한선 (이보다 짧으면 생성 실패로 간주)
const MIN_MONTH_NOTE_LENGTH = 150;

/** 모든 필드가 실제로 채워졌는지 검사한다. 모델이 일부 필드를 빈 문자열로 "형식만" 채우고
 * 끝내버리는 실패 모드를 감지하기 위함 (json_schema는 minLength를 강제하지 못한다). */
function validateCore(c: CoreContent): string | null {
  const longFields: (keyof CoreContent)[] = [
    "personality",
    "pastPattern",
    "datingStyle",
    "idealPartner",
    "breakupRecovery",
    "yearOverview",
  ];
  for (const field of longFields) {
    const value = c[field];
    if (typeof value !== "string" || value.length < MIN_NOTE_LENGTH) {
      return `${field} 분량 부족 (${typeof value === "string" ? value.length : "타입 오류"}자)`;
    }
  }
  if (typeof c.closingMessage !== "string" || c.closingMessage.length < 100) return "closingMessage 분량 부족";
  if (!Array.isArray(c.tips) || c.tips.length === 0) return "tips 비어있음";
  if (!Array.isArray(c.meetingPlaces) || c.meetingPlaces.length === 0) return "meetingPlaces 비어있음";
  return null;
}

function validateMonthlyChunk(months: number[]) {
  return (m: MonthlyContent): string | null => {
    if (!Array.isArray(m.monthly) || m.monthly.length !== months.length) return "monthly 개수 오류";
    for (const item of m.monthly) {
      if (typeof item.note !== "string" || item.note.length < MIN_MONTH_NOTE_LENGTH) {
        return `${item.month}월 note 분량 부족`;
      }
      if (!item.luckyItem || !item.luckyPlace) return `${item.month}월 luckyItem/luckyPlace 누락`;
    }
    return null;
  };
}

async function callClaude<T>(system: string, schema: Record<string, unknown>, userContent: string): Promise<T> {
  // 분량이 많아 응답이 길어지므로(수천 토큰) 스트리밍으로 호출해 연결 타임아웃을 피한다
  const stream = getClient().messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    system,
    thinking: { type: "adaptive" },
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: userContent }],
  });

  const response = await stream.finalMessage();
  if (response.stop_reason === "max_tokens") {
    throw new Error("AI 응답이 max_tokens 한도에 도달해 잘렸습니다.");
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) throw new Error("AI 응답에서 텍스트를 찾을 수 없습니다.");

  return JSON.parse(textBlock.text) as T;
}

function requestCoreInterpretation(saju: SajuResult, yearOutlook: YearOutlook, nickname: string): Promise<CoreContent> {
  return callClaude<CoreContent>(
    SYSTEM_PROMPT_CORE,
    CORE_SCHEMA,
    `다음 정보를 바탕으로 연애운의 핵심 항목(성향/패턴/밀당스타일/이상형/이별대처/총운/개운법/만남장소/마무리메시지)을 아주 상세하고 뾰족하게 해석해줘. personality/pastPattern/datingStyle/idealPartner/breakupRecovery/yearOverview는 각각 최소 600자, 목표 700자 이상으로 길게 써줘 (짧게 요약하지 말고). 절대 일부 항목을 빈 문자열이나 대충으로 채우고 끝내지 마세요 — 모든 항목을 분량 지침대로 끝까지 작성해야 합니다.\n\n${describeSaju(saju, nickname)}\n\n${describeYearOutlook(yearOutlook)}`
  );
}

function requestMonthlyChunk(
  saju: SajuResult,
  yearOutlook: YearOutlook,
  nickname: string,
  months: number[]
): Promise<MonthlyContent> {
  return callClaude<MonthlyContent>(
    systemPromptMonthly(months),
    monthlyChunkSchema(months),
    `다음 정보를 바탕으로 ${months.join(", ")}월의 월별 연애운을 아주 상세하고 뾰족하게 해석해줘. monthly는 ${months.join(", ")}월 순서대로 정확히 ${months.length}개 항목이어야 하고, 각 note는 최소 250자 이상, 목표 300자 이상으로 써줘. 절대 일부 달을 빈 문자열이나 대충으로 채우고 끝내지 마세요 — 모든 달을 분량 지침대로 끝까지 작성해야 합니다.\n\n${describeSaju(saju, nickname)}\n\n${describeYearOutlook(yearOutlook)}`
  );
}

async function generateWithRetry<T>(
  request: () => Promise<T>,
  validate: (value: T) => string | null,
  label: string
): Promise<T> {
  let lastError: string | null = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const parsed = await request();
    const validationError = validate(parsed);
    if (!validationError) return parsed;
    lastError = validationError;
    console.warn(`${label} 검증 실패 (시도 ${attempt}/2): ${validationError}`);
  }
  throw new Error(`${label}이(가) 분량 기준을 충족하지 못했습니다: ${lastError}`);
}

export async function generateLoveFortuneInterpretation(
  saju: SajuResult,
  yearOutlook: YearOutlook,
  nickname: string
): Promise<LoveFortuneContent> {
  const [core, ...chunks] = await Promise.all([
    generateWithRetry(() => requestCoreInterpretation(saju, yearOutlook, nickname), validateCore, "핵심 항목"),
    ...MONTH_CHUNKS.map((months) =>
      generateWithRetry(
        () => requestMonthlyChunk(saju, yearOutlook, nickname, months),
        validateMonthlyChunk(months),
        `${months[0]}~${months[months.length - 1]}월`
      )
    ),
  ]);
  const monthly = chunks.flatMap((c) => c.monthly).sort((a, b) => a.month - b.month);
  return { ...core, monthly };
}
