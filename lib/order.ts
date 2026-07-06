import type { SajuInput } from "./manseryeok";

export type OrderInput = SajuInput & { nickname: string; email: string; source: "direct" | "share" };
