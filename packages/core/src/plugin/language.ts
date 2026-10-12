export * as LanguagePlugin from "./language.js"

import { SystemPart } from "@opencode/ai"
import { define } from "@opencode/plugin/effect/plugin"
import type { SessionRequest } from "@opencode/plugin/effect/session"
import { Effect } from "effect"
import type { PluginInternal } from "./internal.js"

// verifactor-code speaks Russian: replies, plans, summaries and session titles default to Russian,
// while code, identifiers, commands and quoted output stay as they are.
export const INSTRUCTION = [
  "# Язык",
  "Всегда отвечай пользователю на русском языке: объяснения, планы, вопросы, итоги и заголовки сессий.",
  "Код, имена файлов, идентификаторы, команды терминала и цитируемый вывод программ оставляй без перевода.",
  "Если пользователь явно попросит другой язык, используй его.",
].join("\n")

export const Plugin = define({
  id: "verifactor.prompt.language",
  effect: Effect.fn("LanguagePlugin")(function* (ctx) {
    const hook = (event: SessionRequest) =>
      Effect.sync(() => {
        if (event.system.some((part) => part.text.includes(INSTRUCTION))) return
        event.system.push(SystemPart.make(INSTRUCTION))
      })
    yield* ctx.session.hook("context", hook)
    yield* ctx.session.hook("compaction", hook)
    yield* ctx.session.hook("generate", hook)
    yield* ctx.session.hook("title", hook)
  }),
} satisfies PluginInternal.InternalPlugin)
