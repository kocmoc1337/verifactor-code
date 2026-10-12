import { Locale } from "./locale"
import { canonicalToolName, finiteNumber, webSearchProviderLabel } from "./tool-display"

type Dict = Record<string, unknown>

export type PermissionPresentation = {
  icon: string
  title: string
  lines: string[]
  diff?: string
  patch?: string
  file?: string
}

export type PermissionPresentationInput = {
  action: string
  resources: ReadonlyArray<unknown>
  metadata?: unknown
  input?: unknown
  toolMetadata?: unknown
}

export function permissionPresentation(
  source: PermissionPresentationInput,
  formatPath: (value: string) => string = (value) => value,
): PermissionPresentation {
  const action = canonicalToolName(source.action)
  const input = normalizeInput(action, source.input)
  const metadata = { ...dict(source.toolMetadata), ...dict(source.metadata) }
  const resources = source.resources.filter((item): item is string => typeof item === "string")

  if (action === "edit") {
    const file = text(input.path) || resources[0] || ""
    const first = dict(Array.isArray(metadata.files) ? metadata.files[0] : undefined)
    const diff = text(first.patch) || text(first.diff) || text(metadata.diff) || undefined
    return {
      icon: "→",
      title: `Правка ${formatPath(file)}`,
      lines: [],
      diff,
      patch: diff ? undefined : text(input.patchText) || undefined,
      file,
    }
  }

  if (action === "read" || action === "list") {
    const value = text(input.path) || resources[0] || ""
    const title = action === "read" ? "Чтение" : "Список"
    return {
      icon: "→",
      title: `${title} ${formatPath(value)}`,
      lines: value ? [`Путь: ${formatPath(value)}`] : [],
    }
  }

  if (action === "glob" || action === "grep") {
    const pattern = text(input.pattern) || resources[0] || ""
    const title = action === "glob" ? "Поиск файлов" : "Поиск в файлах"
    return {
      icon: "✱",
      title: `${title} "${pattern}"`,
      lines: pattern ? [`Шаблон: ${pattern}`] : [],
    }
  }

  if (action === "shell") {
    const command = text(input.command)
    return {
      icon: "#",
      title: "Команда shell",
      lines: command ? [`$ ${command}`] : resources.map((item) => `- ${item}`),
    }
  }

  if (action === "subagent") {
    const agent = text(input.agent) || "general"
    const description = text(input.description)
    return {
      icon: "#",
      title: `Субагент ${Locale.titlecase(agent)}`,
      lines: description ? [`◉ ${description}`] : [],
    }
  }

  if (action === "webfetch") {
    const url = text(input.url) || text(metadata.url)
    return {
      icon: "%",
      title: `Загрузка страницы ${url}`,
      lines: url ? [`URL: ${url}`] : [],
    }
  }

  if (action === "websearch") {
    const query = text(input.query) || text(metadata.query)
    const title = webSearchProviderLabel(metadata.provider)
    return {
      icon: "◈",
      title: query ? `${title} "${query}"` : title,
      lines: query ? [`Запрос: ${query}`] : [],
    }
  }

  if (action === "lsp") {
    const file = text(input.path)
    const operation = text(input.operation) || "request"
    const line = finiteNumber(input.line)
    const character = finiteNumber(input.character)
    const position = line !== undefined && character !== undefined ? `${line}:${character}` : undefined
    return {
      icon: "→",
      title: `LSP ${operation}${file ? ` ${formatPath(file)}${position ? `:${position}` : ""}` : ""}`,
      lines: [
        ...(input.operation ? [`Операция: ${operation}`] : []),
        ...(file ? [`Путь: ${formatPath(file)}`] : []),
        ...(position ? [`Позиция: ${position}`] : []),
      ],
    }
  }

  if (action === "external_directory") {
    const raw = text(metadata.parentDir) || text(metadata.filepath) || resources[0] || ""
    const directory = wildcardDirectory(raw)
    return {
      icon: "←",
      title: `Доступ к внешней папке ${formatPath(directory)}`,
      lines: resources.map((item) => `- ${item}`),
    }
  }

  if (action === "doom_loop") {
    return {
      icon: "⟳",
      title: "Продолжить после повторных сбоев",
      lines: ["Сессия продолжит работу, несмотря на повторные сбои."],
    }
  }

  return {
    icon: "⚙",
    title: `Вызов инструмента ${source.action}`,
    lines: [`Инструмент: ${source.action}`],
  }
}

function wildcardDirectory(value: string) {
  const wildcard = value.indexOf("*")
  if (wildcard === -1) return value
  const prefix = value.slice(0, wildcard)
  if (/^[\\/]+$/.test(prefix) || /^[A-Za-z]:[\\/]$/.test(prefix)) return prefix
  return prefix.replace(/[\\/]+$/, "")
}

export function permissionAlwaysLines(input: { action: string; save?: ReadonlyArray<string> }): string[] {
  const save = input.save ?? []
  if (save.length === 1 && save[0] === "*") {
    return [`${input.action} будет всегда разрешено в этом проекте.`]
  }
  return ["Эти шаблоны будут всегда разрешены в этом проекте.", ...save.map((item) => `- ${item}`)]
}

export function permissionOptionLabel(option: "once" | "always" | "reject" | "confirm" | "cancel") {
  if (option === "once") return "Разрешить один раз"
  if (option === "always") return "Всегда разрешать"
  if (option === "reject") return "Отклонить"
  if (option === "confirm") return "Подтвердить"
  return "Отмена"
}

function normalizeInput(action: string, value: unknown): Dict {
  const input = dict(value)
  const path = text(input.path) || text(input.filePath) || text(input.filepath)
  const agent = text(input.agent) || text(input.subagent_type)
  return {
    ...input,
    ...(["read", "edit", "list", "lsp"].includes(action) && path ? { path } : {}),
    ...(action === "subagent" && agent ? { agent } : {}),
  }
}

function dict(value: unknown): Dict {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Dict
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}
