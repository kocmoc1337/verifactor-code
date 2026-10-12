import type { SessionStatsInfo } from "@opencode/client"
import { TokenUsage } from "@opencode/schema/token-usage"

export function statsMetrics(stats: SessionStatsInfo) {
  return [
    {
      label: "токенов",
      value: TokenUsage.total(stats.tokens),
    },
    { label: "лучшая серия", value: stats.streak },
    { label: "активных дней", value: stats.activeDays },
    { label: "сессий", value: stats.sessions },
  ]
}

export function statsNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}
