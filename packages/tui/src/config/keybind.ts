export * as TuiKeybind from "./keybind"

import type { KeyEvent, Renderable } from "@opentui/core"
import type { Binding } from "@opentui/keymap"
import type { BindingConfig, BindingDefaults } from "@opentui/keymap/extras"
import { Schema } from "effect"

const KeyStroke = Schema.Struct({
  name: Schema.String,
  ctrl: Schema.optional(Schema.Boolean),
  shift: Schema.optional(Schema.Boolean),
  meta: Schema.optional(Schema.Boolean),
  super: Schema.optional(Schema.Boolean),
  hyper: Schema.optional(Schema.Boolean),
})

const BindingObject = Schema.StructWithRest(
  Schema.Struct({
    key: Schema.Union([Schema.String, KeyStroke]),
    event: Schema.optional(Schema.Literals(["press", "release"])),
    preventDefault: Schema.optional(Schema.Boolean),
    fallthrough: Schema.optional(Schema.Boolean),
  }),
  [Schema.Record(Schema.String, Schema.Unknown)],
)

const BindingItem = Schema.Union([Schema.String, KeyStroke, BindingObject])
export const BindingValueSchema = Schema.Union([
  Schema.Literal(false),
  Schema.Literal("none"),
  BindingItem,
  Schema.Array(BindingItem),
]).annotate({ identifier: "TuiKeybind.BindingValue" })
export type BindingValueSchema = Schema.Schema.Type<typeof BindingValueSchema>

type Definition = {
  default: BindingValueSchema
  description: string
}

export const LeaderDefault = "ctrl+x"

const keybind = (value: Definition["default"], description: string): Definition => ({ default: value, description })

export const Definitions = {
  leader: keybind(LeaderDefault, "Leader key for keybind combinations"),

  "app.exit": keybind("ctrl+c,ctrl+d,<leader>q", "Выйти из приложения"),
  "app.clear": keybind("ctrl+l", "Очистить экран в мини-режиме"),
  "app.debug": keybind("none", "Панель отладки вкл/выкл"),
  "app.console": keybind("none", "Консоль вкл/выкл"),
  "app.scrap": keybind("none", "Открыть черновик"),
  "app.toggle.animations": keybind("none", "Анимации вкл/выкл"),
  "app.toggle.file_context": keybind("none", "Контекст файла вкл/выкл"),
  "app.toggle.diffwrap": keybind("none", "Перенос строк в изменениях вкл/выкл"),
  "app.toggle.paste_summary": keybind("none", "Сворачивание вставок вкл/выкл"),
  "command.palette.show": keybind("ctrl+p", "Список команд"),
  "help.show": keybind("none", "Открыть справку"),
  "docs.open": keybind("none", "Открыть документацию"),
  "opencode.settings": keybind("none", "Открыть настройки"),
  "server.pair": keybind("none", "Сопряжение устройства"),
  "service.restart": keybind("none", "Перезапустить сервис"),
  "location.reload": keybind("none", "Перезагрузить настройки"),
  "diff.open": keybind("none", "Открыть просмотр изменений"),
  "diff.close": keybind("escape,q", "Закрыть просмотр изменений"),
  "diff.down": keybind("j,down", "Прокрутить изменения вниз"),
  "diff.up": keybind("k,up", "Прокрутить изменения вверх"),
  "diff.page.down": keybind("pagedown,ctrl+f", "Страница изменений вниз"),
  "diff.page.up": keybind("pageup,ctrl+b", "Страница изменений вверх"),
  "diff.half_page.down": keybind("ctrl+d", "Изменения вниз на полстраницы"),
  "diff.half_page.up": keybind("ctrl+u", "Изменения вверх на полстраницы"),
  "diff.first": keybind("gg,home", "В начало изменений"),
  "diff.last": keybind("shift+g,end", "В конец изменений"),
  // Retain shipped configuration names without registering the removed tree navigation commands.
  "diff.toggle": keybind("none", "Устарело: дерево файлов управляется мышью"),
  "diff.expand": keybind("none", "Устарело: дерево файлов управляется мышью"),
  "diff.expand_all": keybind("none", "Устарело: дерево файлов управляется мышью"),
  "diff.collapse": keybind("none", "Устарело: дерево файлов управляется мышью"),
  "diff.switch_focus": keybind("none", "Устарело: клавиатура всегда управляет изменениями"),
  "diff.next_hunk": keybind("]", "К следующему фрагменту"),
  "diff.previous_hunk": keybind("[", "К предыдущему фрагменту"),
  "diff.next_file": keybind("n,alt+down", "К следующему файлу"),
  "diff.previous_file": keybind("p,alt+up", "К предыдущему файлу"),
  "diff.toggle_file_tree": keybind("b", "Дерево файлов вкл/выкл"),
  "diff.single_patch": keybind("s", "Режим одного патча"),
  "diff.switch_source": keybind("d", "Сменить источник изменений"),
  "diff.toggle_view": keybind("v", "Раздельный / общий вид изменений"),
  "diff.mark_reviewed": keybind("m", "Отметить файл как просмотренный"),
  "diff.help": keybind("?,shift+?,shift+/", "Ещё сочетания клавиш"),

  "prompt.editor": keybind("<leader>e", "Открыть внешний редактор"),
  "theme.switch": keybind("none", "Список тем"),
  "theme.switch_mode": keybind("none", "Светлая / тёмная тема"),
  "theme.mode.lock": keybind("none", "Зафиксировать режим темы"),
  "session.sidebar.toggle": keybind("<leader>b", "Боковая панель вкл/выкл"),
  "pane.focus.left": keybind("<leader>left", "Фокус на панель сессии"),
  "pane.focus.right": keybind("<leader>right", "Фокус на правую панель"),
  "terminal.select": keybind("<leader>down", "Выбрать терминал"),
  "terminal.toggle": keybind("<leader>t", "Панель терминала вкл/выкл"),
  "terminal.close": keybind("<leader>up", "Закрыть панель терминала"),
  "session.toggle.scrollbar": keybind("none", "Полоса прокрутки вкл/выкл"),
  "opencode.status": keybind("<leader>s", "Статус"),
  "opencode.debug": keybind("none", "Отладочная информация"),

  "session.export": keybind("<leader>x", "Экспортировать сессию в редактор"),
  "session.copy": keybind("none", "Копировать стенограмму сессии"),
  "session.copy.id": keybind("none", "Копировать ID сессии"),
  "session.move": keybind("none", "Рабочие пространства"),
  "session.new": keybind("<leader>n", "Новая сессия"),
  "session.list": keybind("<leader>l", "Все сессии"),
  "open.menu": keybind("ctrl+o", "Недавние сессии и проекты"),
  "session.tab.next": keybind("ctrl+tab,alt+down", "Следующая вкладка сессии"),
  "session.tab.previous": keybind("ctrl+shift+tab,alt+up", "Предыдущая вкладка сессии"),
  "session.tab.history.back": keybind("none", "Назад по истории вкладок"),
  "session.tab.history.forward": keybind("ctrl+i", "Вперёд по истории вкладок"),
  "session.tab.next_unread": keybind("alt+shift+down", "Следующая непрочитанная вкладка сессии"),
  "session.tab.previous_unread": keybind("alt+shift+up", "Предыдущая непрочитанная вкладка сессии"),
  "session.tab.close": keybind("<leader>w", "Закрыть текущую вкладку сессии"),
  "session.tab.reopen": keybind("ctrl+shift+t", "Вернуть закрытую вкладку сессии"),
  "session.timeline": keybind("<leader>g", "Хронология сессии"),
  "session.fork": keybind("none", "Ответвить сессию от сообщения"),
  "session.rename": keybind("ctrl+r", "Переименовать сессию"),
  "session.delete": keybind("ctrl+d", "Удалить сессию"),
  "session.share": keybind("none", "Поделиться сессией"),
  "session.unshare": keybind("none", "Закрыть доступ к сессии"),
  "session.interrupt": keybind("escape", "Прервать текущую сессию"),
  "session.background": keybind("ctrl+b", "Увести блокирующие инструменты в фон"),
  "session.compact": keybind("<leader>c", "Сжать сессию"),
  "session.aside": keybind("none", "Задать побочный вопрос"),
  "session.cd": keybind("none", "Сменить рабочую папку"),
  "session.queued_prompts": keybind("<leader>q", "Управление очередью запросов"),
  "queued_prompt.undo": keybind("ctrl+u", "Отменить запрос из очереди"),
  "queued_prompt.delete": keybind("ctrl+d", "Удалить запрос из очереди"),
  "session.toggle.exploration_grouping": keybind("none", "Группировка инструментов вкл/выкл"),
  "session.verbosity.cycle": keybind("none", "Переключить подробность стенограммы"),
  "session.child.first": keybind("down", "Выбор субагента"),
  "session.child.next": keybind("right", "К следующей дочерней сессии"),
  "session.child.previous": keybind("left", "К предыдущей дочерней сессии"),
  "session.parent": keybind("up", "К родительской сессии"),
  "session.pin.toggle": keybind("ctrl+f", "Закрепить / открепить сессию"),
  "session.quick_switch.1": keybind("<leader>1", "Сессия из быстрого слота 1"),
  "session.quick_switch.2": keybind("<leader>2", "Сессия из быстрого слота 2"),
  "session.quick_switch.3": keybind("<leader>3", "Сессия из быстрого слота 3"),
  "session.quick_switch.4": keybind("<leader>4", "Сессия из быстрого слота 4"),
  "session.quick_switch.5": keybind("<leader>5", "Сессия из быстрого слота 5"),
  "session.quick_switch.6": keybind("<leader>6", "Сессия из быстрого слота 6"),
  "session.quick_switch.7": keybind("<leader>7", "Сессия из быстрого слота 7"),
  "session.quick_switch.8": keybind("<leader>8", "Сессия из быстрого слота 8"),
  "session.quick_switch.9": keybind("<leader>9", "Сессия из быстрого слота 9"),
  "session.tab.select.1": keybind("<leader>1,ctrl+1", "Вкладка сессии 1"),
  "session.tab.select.2": keybind("<leader>2,ctrl+2", "Вкладка сессии 2"),
  "session.tab.select.3": keybind("<leader>3,ctrl+3", "Вкладка сессии 3"),
  "session.tab.select.4": keybind("<leader>4,ctrl+4", "Вкладка сессии 4"),
  "session.tab.select.5": keybind("<leader>5,ctrl+5", "Вкладка сессии 5"),
  "session.tab.select.6": keybind("<leader>6,ctrl+6", "Вкладка сессии 6"),
  "session.tab.select.7": keybind("<leader>7,ctrl+7", "Вкладка сессии 7"),
  "session.tab.select.8": keybind("<leader>8,ctrl+8", "Вкладка сессии 8"),
  "session.tab.select.9": keybind("<leader>9,ctrl+9", "Вкладка сессии 9"),
  "session.tab.select.10": keybind("<leader>0,ctrl+0", "Вкладка сессии 10"),

  "stash.delete": keybind("ctrl+d", "Удалить отложенный запрос"),
  "model.dialog.provider": keybind("ctrl+a", "Список провайдеров"),
  "model.dialog.favorite": keybind("ctrl+f", "Добавить / убрать из избранного"),
  "model.list": keybind("<leader>m", "Список моделей"),
  "model.cycle_recent": keybind("f2", "Следующая недавняя модель"),
  "model.cycle_recent_reverse": keybind("shift+f2", "Предыдущая недавняя модель"),
  "model.cycle_favorite": keybind("none", "Следующая избранная модель"),
  "model.cycle_favorite_reverse": keybind("none", "Предыдущая избранная модель"),
  "mcp.list": keybind("none", "Список MCP-серверов"),
  "provider.connect": keybind("none", "Подключить интеграцию"),
  "agent.list": keybind("<leader>a", "Список агентов"),
  "agent.cycle": keybind("shift+tab", "Следующий агент"),
  "agent.cycle.reverse": keybind("none", "Предыдущий агент"),
  "variant.cycle": keybind("ctrl+t", "Переключить вариант модели"),
  "variant.list": keybind("none", "Варианты модели"),

  "session.page.up": keybind("pageup,ctrl+alt+b", "Сообщения вверх на страницу"),
  "session.page.down": keybind("pagedown,ctrl+alt+f", "Сообщения вниз на страницу"),
  "session.line.up": keybind("ctrl+alt+y", "Сообщения вверх на строку"),
  "session.line.down": keybind("ctrl+alt+e", "Сообщения вниз на строку"),
  "session.half.page.up": keybind("ctrl+alt+u", "Сообщения вверх на полстраницы"),
  "session.half.page.down": keybind("ctrl+alt+d", "Сообщения вниз на полстраницы"),
  "session.first": keybind("ctrl+g,home,alt+home", "К первому сообщению"),
  "session.last": keybind("ctrl+alt+g,end", "К последнему сообщению"),
  "session.message.next": keybind("none", "К следующему сообщению"),
  "session.message.previous": keybind("none", "К предыдущему сообщению"),
  "session.message.user.next": keybind("none", "К следующему сообщению пользователя"),
  "session.message.user.previous": keybind("none", "К предыдущему сообщению пользователя"),
  "session.messages_last_user": keybind("alt+end", "К последнему сообщению пользователя"),
  "messages.copy": keybind("<leader>y", "Копировать сообщение"),
  "session.undo": keybind("<leader>u", "Отменить сообщение"),
  "session.redo": keybind("<leader>r", "Повторить сообщение"),
  "session.toggle.thinking": keybind("none", "Размышления показать / скрыть"),

  "prompt.submit": keybind("none", "Отправить запрос"),
  "prompt.queue": keybind("<leader>return", "Поставить запрос в очередь"),
  "prompt.editor_context.clear": keybind("none", "Очистить контекст редактора"),
  "prompt.images.view": keybind("<leader>i", "Вложенные изображения"),
  "prompt.skills": keybind("none", "Выбрать навык"),
  "prompt.stash": keybind("none", "Отложить запрос"),
  "prompt.stash.pop": keybind("none", "Вернуть отложенный запрос"),
  "prompt.stash.list": keybind("none", "Отложенные запросы"),

  "prompt.clear": keybind("ctrl+c", "Очистить поле ввода"),
  "prompt.paste": keybind({ key: "ctrl+v", preventDefault: false }, "Paste from clipboard"),
  "input.submit": keybind("return", "Отправить ввод"),
  "input.newline": keybind("shift+return,ctrl+return,alt+return,ctrl+j", "Новая строка"),
  "input.move.left": keybind("left,ctrl+b", "Курсор влево"),
  "input.move.right": keybind("right,ctrl+f", "Курсор вправо"),
  "input.move.up": keybind("up", "Курсор вверх"),
  "input.move.down": keybind("down", "Курсор вниз"),
  "input.select.left": keybind("shift+left", "Выделить влево"),
  "input.select.right": keybind("shift+right", "Выделить вправо"),
  "input.select.up": keybind("shift+up", "Выделить вверх"),
  "input.select.down": keybind("shift+down", "Выделить вниз"),
  "input.line.home": keybind("ctrl+a", "В начало строки"),
  "input.line.end": keybind("ctrl+e", "В конец строки"),
  "input.select.line.home": keybind("ctrl+shift+a", "Выделить до начала строки"),
  "input.select.line.end": keybind("ctrl+shift+e", "Выделить до конца строки"),
  "input.visual.line.home": keybind("alt+a", "В начало видимой строки"),
  "input.visual.line.end": keybind("alt+e", "В конец видимой строки"),
  "input.select.visual.line.home": keybind("alt+shift+a", "Выделить до начала видимой строки"),
  "input.select.visual.line.end": keybind("alt+shift+e", "Выделить до конца видимой строки"),
  "input.buffer.home": keybind("none", "В начало текста"),
  "input.buffer.end": keybind("none", "В конец текста"),
  "input.select.buffer.home": keybind("shift+home", "Выделить до начала текста"),
  "input.select.buffer.end": keybind("shift+end", "Выделить до конца текста"),
  "input.delete.line": keybind("ctrl+shift+d", "Удалить строку"),
  "input.delete.to.line.end": keybind("ctrl+k", "Удалить до конца строки"),
  "input.delete.to.line.start": keybind("ctrl+u", "Удалить до начала строки"),
  "input.backspace": keybind("backspace,shift+backspace", "Удалить символ слева"),
  "input.delete": keybind("ctrl+d,delete,shift+delete", "Удалить символ справа"),
  "input.undo": keybind("ctrl+-,super+z", "Отменить ввод"),
  "input.redo": keybind("ctrl+.,super+shift+z", "Повторить ввод"),
  "input.word.forward": keybind("alt+f,alt+right,ctrl+right", "Слово вправо"),
  "input.word.backward": keybind("alt+b,alt+left,ctrl+left", "Слово влево"),
  "input.select.word.forward": keybind("alt+shift+f,alt+shift+right", "Выделить слово справа"),
  "input.select.word.backward": keybind("alt+shift+b,alt+shift+left", "Выделить слово слева"),
  "input.delete.word.forward": keybind("alt+d,alt+delete,ctrl+delete", "Удалить слово справа"),
  "input.delete.word.backward": keybind("ctrl+w,ctrl+backspace,alt+backspace", "Удалить слово слева"),
  "input.select.all": keybind("super+a", "Выделить всё"),
  "prompt.history.previous": keybind("up", "Предыдущий запрос из истории"),
  "prompt.history.next": keybind("down", "Следующий запрос из истории"),

  "composer.subagent.up": keybind("up", "Предыдущий субагент"),
  "composer.subagent.down": keybind("down", "Следующий субагент"),
  "composer.subagent.select": keybind("return", "Перейти к субагенту"),
  "composer.subagent.interrupt": keybind("ctrl+d", "Прервать субагента"),
  "composer.shell.up": keybind("up", "Предыдущий shell"),
  "composer.shell.down": keybind("down", "Следующий shell"),
  "composer.shell.select": keybind("return", "Вывод shell"),
  "composer.shell.kill": keybind("ctrl+d", "Завершить команду shell"),
  "composer.terminal.up": keybind("up,k", "Предыдущий терминал"),
  "composer.terminal.down": keybind("down,j", "Следующий терминал"),
  "composer.terminal.select": keybind("return", "Выбрать терминал"),

  "dialog.select.prev": keybind("up,ctrl+p", "Предыдущий пункт"),
  "dialog.select.next": keybind("down,ctrl+n", "Следующий пункт"),
  "dialog.select.page_up": keybind("pageup", "Страница вверх"),
  "dialog.select.page_down": keybind("pagedown", "Страница вниз"),
  "dialog.select.home": keybind("home", "К первому пункту"),
  "dialog.select.end": keybind("end", "К последнему пункту"),
  "dialog.select.submit": keybind("return", "Выбрать пункт"),
  "dialog.prompt.submit": keybind("return", "Отправить"),
  "dialog.integration.rename": keybind("ctrl+r", "Переименовать аккаунт интеграции"),
  "dialog.integration.delete": keybind("ctrl+d", "Удалить аккаунт интеграции"),
  "dialog.worktree.generate": keybind("tab", "Сгенерировать имя ворктри"),
  "dialog.move_session.new": keybind("ctrl+a", "Новое ворктри"),
  "dialog.move_session.move": keybind("ctrl+m", "Переместить сессию в ворктри"),
  "dialog.move_session.delete": keybind("ctrl+d", "Удалить ворктри"),
  "dialog.move_session.refresh": keybind("ctrl+r", "Обновить ворктри"),
  "prompt.autocomplete.prev": keybind("up,ctrl+p", "Предыдущий вариант"),
  "prompt.autocomplete.next": keybind("down,ctrl+n", "Следующий вариант"),
  "prompt.autocomplete.hide": keybind("escape", "Скрыть автодополнение"),
  "prompt.autocomplete.select": keybind("return", "Выбрать вариант"),
  "prompt.autocomplete.complete": keybind("tab", "Дополнить вариант"),
  "permission.prompt.fullscreen": keybind("ctrl+f", "Разрешение на весь экран"),
  "plugins.toggle": keybind("return", "Плагин вкл/выкл"),
  "dialog.mcp.toggle": keybind("space", "MCP-сервер вкл/выкл"),
  "dialog.plugins.error": keybind("space", "Ошибка плагина"),
  "dialog.plugins.update": keybind("ctrl+u", "Обновить плагин"),
  "dialog.plugins.check": keybind("ctrl+r", "Проверить обновления плагинов"),

  "terminal.suspend": keybind("ctrl+z", "Приостановить терминал"),
  "terminal.title.toggle": keybind("none", "Заголовок терминала вкл/выкл"),
  "plugins.list": keybind("none", "Открыть менеджер плагинов"),

  "which-key.toggle": keybind("ctrl+alt+k", "Панель подсказок вкл/выкл"),
  "which-key.layout.toggle": keybind("ctrl+alt+shift+k", "Сменить раскладку подсказок"),
  "which-key.pending.toggle": keybind("ctrl+alt+shift+p", "Предпросмотр подсказок вкл/выкл"),
  "which-key.group.previous": keybind("ctrl+alt+left,ctrl+alt+[", "Предыдущая группа подсказок"),
  "which-key.group.next": keybind("ctrl+alt+right,ctrl+alt+]", "Следующая группа подсказок"),
  "which-key.scroll.up": keybind("ctrl+alt+up,ctrl+alt+p", "Подсказки вверх"),
  "which-key.scroll.down": keybind("ctrl+alt+down,ctrl+alt+n", "Подсказки вниз"),
  "which-key.page.up": keybind("ctrl+alt+pageup", "Страница подсказок вверх"),
  "which-key.page.down": keybind("ctrl+alt+pagedown", "Страница подсказок вниз"),
  "which-key.home": keybind("ctrl+alt+home", "К первому сочетанию в подсказке"),
  "which-key.end": keybind("ctrl+alt+end", "К последнему сочетанию в подсказке"),
} satisfies Record<string, Definition>

type KeybindName = keyof typeof Definitions
const KeybindNames = new Set<string>(Object.keys(Definitions))

export const KeybindOverrides = Schema.Struct(
  Object.fromEntries(
    Object.entries(Definitions).map(([name, item]) => [
      name,
      Schema.optional(BindingValueSchema).annotate({ description: item.description }),
    ]),
  ),
).annotate({ description: "TUI keybinding overrides" })
export const Descriptions = Object.fromEntries(
  Object.entries(Definitions).map(([name, item]) => [name, item.description]),
) as Record<KeybindName, string>

export type Keybinds = { [K in KeybindName]: BindingValueSchema }
export type KeybindOverrides = Partial<Keybinds>
export type BindingLookupView = {
  readonly bindings: readonly Binding<Renderable, KeyEvent>[]
  get(command: string): readonly Binding<Renderable, KeyEvent>[]
  has(command: string): boolean
  gather(name: string, commands: readonly string[]): readonly Binding<Renderable, KeyEvent>[]
  pick(name: string, commands: readonly string[]): Binding<Renderable, KeyEvent>[]
  omit(name: string, commands: readonly string[]): Binding<Renderable, KeyEvent>[]
}

export function toBindingConfig(keybinds: Keybinds): BindingConfig<Renderable, KeyEvent> {
  return Object.fromEntries(Object.entries(keybinds)) as BindingConfig<Renderable, KeyEvent>
}

const decodeBindingValue = Schema.decodeUnknownSync(BindingValueSchema)

export function defaultValue(name: KeybindName) {
  return Definitions[name].default
}

export function parse(keybinds: KeybindOverrides): Keybinds {
  const invalid = unknownKeys(keybinds)
  if (invalid.length) throw new Error(`Unrecognized keybind${invalid.length === 1 ? "" : "s"}: ${invalid.join(", ")}`)
  return Object.fromEntries(
    Object.entries(Definitions).map(([name, item]) => [
      name,
      decodeBindingValue(keybinds[name as KeybindName] ?? item.default),
    ]),
  ) as Keybinds
}

export function unknownKeys(input: object) {
  return Object.keys(input).filter((key) => !KeybindNames.has(key))
}

export function bindingDefaults(): BindingDefaults<Renderable, KeyEvent> {
  return ({ command, binding }) => {
    if (binding.desc !== undefined) return
    return { desc: Descriptions[command as KeybindName] }
  }
}
