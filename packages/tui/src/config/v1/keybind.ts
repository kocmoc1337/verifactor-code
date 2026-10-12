export * as TuiKeybind from "./keybind"

import type { KeyEvent, Renderable } from "@opentui/core"
import type { Binding } from "@opentui/keymap"
import type { BindingCommandMap, BindingConfig, BindingDefaults } from "@opentui/keymap/extras"
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
])
export type BindingValueSchema = Schema.Schema.Type<typeof BindingValueSchema>

type Definition = {
  default: BindingValueSchema
  description: string
}

export const LeaderDefault = "ctrl+x"

const keybind = (value: Definition["default"], description: string): Definition => ({ default: value, description })

export const Definitions = {
  leader: keybind(LeaderDefault, "Leader key for keybind combinations"),

  app_exit: keybind("ctrl+c,ctrl+d,<leader>q", "Выйти из приложения"),
  app_debug: keybind("none", "Панель отладки вкл/выкл"),
  app_console: keybind("none", "Консоль вкл/выкл"),
  app_heap_snapshot: keybind("none", "Записать снимок памяти"),
  app_toggle_animations: keybind("none", "Анимации вкл/выкл"),
  app_toggle_file_context: keybind("none", "Контекст файла вкл/выкл"),
  app_toggle_diffwrap: keybind("none", "Перенос строк в изменениях вкл/выкл"),
  app_toggle_paste_summary: keybind("none", "Сворачивание вставок вкл/выкл"),
  command_list: keybind("ctrl+p", "Список команд"),
  help_show: keybind("none", "Открыть справку"),
  docs_open: keybind("none", "Открыть документацию"),
  diff_open: keybind("none", "Открыть просмотр изменений"),
  diff_close: keybind("escape,q", "Закрыть просмотр изменений"),
  diff_toggle: keybind("enter,space", "Свернуть / развернуть элемент"),
  diff_expand: keybind("right", "Развернуть элемент"),
  diff_expand_all: keybind("E", "Развернуть все папки"),
  diff_collapse: keybind("left", "Свернуть элемент"),
  diff_switch_focus: keybind("tab", "Переключить фокус"),
  diff_next_hunk: keybind("]", "К следующему фрагменту"),
  diff_previous_hunk: keybind("[", "К предыдущему фрагменту"),
  diff_next_file: keybind("n", "К следующему файлу"),
  diff_previous_file: keybind("p", "К предыдущему файлу"),
  diff_toggle_file_tree: keybind("b", "Дерево файлов вкл/выкл"),
  diff_single_patch: keybind("s", "Режим одного патча"),
  diff_switch_source: keybind("d", "Сменить источник изменений"),
  diff_toggle_view: keybind("v", "Раздельный / общий вид изменений"),
  diff_help: keybind("?", "Ещё сочетания клавиш"),

  editor_open: keybind("<leader>e", "Открыть внешний редактор"),
  theme_list: keybind("<leader>t", "Список тем"),
  theme_switch_mode: keybind("none", "Светлая / тёмная тема"),
  theme_mode_lock: keybind("none", "Зафиксировать режим темы"),
  sidebar_toggle: keybind("<leader>b", "Боковая панель вкл/выкл"),
  scrollbar_toggle: keybind("none", "Полоса прокрутки вкл/выкл"),
  status_view: keybind("<leader>s", "Статус"),
  debug_view: keybind("none", "Отладочная информация"),

  session_export: keybind("<leader>x", "Экспортировать сессию в редактор"),
  session_copy: keybind("none", "Копировать стенограмму сессии"),
  session_move: keybind("none", "Переместить сессию"),
  session_new: keybind("<leader>n", "Новая сессия"),
  session_list: keybind("<leader>l", "Все сессии"),
  open_menu: keybind("ctrl+o", "Недавние сессии и проекты"),
  session_tab_next: keybind("ctrl+tab,alt+down", "Следующая вкладка"),
  session_tab_previous: keybind("ctrl+shift+tab,alt+up", "Предыдущая вкладка"),
  session_tab_next_unread: keybind("alt+shift+down", "Следующая непрочитанная вкладка"),
  session_tab_previous_unread: keybind("alt+shift+up", "Предыдущая непрочитанная вкладка"),
  session_tab_close: keybind("<leader>w", "Закрыть текущую вкладку"),
  session_tab_reopen: keybind("ctrl+shift+t", "Вернуть закрытую вкладку"),
  session_timeline: keybind("<leader>g", "Хронология сессии"),
  session_fork: keybind("none", "Ответвить сессию от сообщения"),
  session_rename: keybind("ctrl+r", "Переименовать сессию"),
  session_delete: keybind("ctrl+d", "Удалить сессию"),
  session_share: keybind("none", "Поделиться сессией"),
  session_unshare: keybind("none", "Закрыть доступ к сессии"),
  session_interrupt: keybind("escape", "Прервать текущую сессию"),
  session_background: keybind("ctrl+b", "Увести блокирующие инструменты в фон"),
  session_compact: keybind("<leader>c", "Сжать сессию"),
  session_queued_prompts: keybind("<leader>q", "Очередь запросов"),
  queued_prompt_delete: keybind("ctrl+d", "Удалить запрос из очереди"),
  session_child_first: keybind("down", "Выбор субагента"),
  session_parent: keybind("up", "К родительской сессии"),
  session_pin_toggle: keybind("ctrl+f", "Закрепить / открепить сессию"),
  session_quick_switch_1: keybind("<leader>1", "Сессия из быстрого слота 1"),
  session_quick_switch_2: keybind("<leader>2", "Сессия из быстрого слота 2"),
  session_quick_switch_3: keybind("<leader>3", "Сессия из быстрого слота 3"),
  session_quick_switch_4: keybind("<leader>4", "Сессия из быстрого слота 4"),
  session_quick_switch_5: keybind("<leader>5", "Сессия из быстрого слота 5"),
  session_quick_switch_6: keybind("<leader>6", "Сессия из быстрого слота 6"),
  session_quick_switch_7: keybind("<leader>7", "Сессия из быстрого слота 7"),
  session_quick_switch_8: keybind("<leader>8", "Сессия из быстрого слота 8"),
  session_quick_switch_9: keybind("<leader>9", "Сессия из быстрого слота 9"),
  session_tab_select_1: keybind("<leader>1,ctrl+1", "Вкладка 1"),
  session_tab_select_2: keybind("<leader>2,ctrl+2", "Вкладка 2"),
  session_tab_select_3: keybind("<leader>3,ctrl+3", "Вкладка 3"),
  session_tab_select_4: keybind("<leader>4,ctrl+4", "Вкладка 4"),
  session_tab_select_5: keybind("<leader>5,ctrl+5", "Вкладка 5"),
  session_tab_select_6: keybind("<leader>6,ctrl+6", "Вкладка 6"),
  session_tab_select_7: keybind("<leader>7,ctrl+7", "Вкладка 7"),
  session_tab_select_8: keybind("<leader>8,ctrl+8", "Вкладка 8"),
  session_tab_select_9: keybind("<leader>9,ctrl+9", "Вкладка 9"),
  session_tab_select_10: keybind("<leader>0,ctrl+0", "Вкладка 10"),

  stash_delete: keybind("ctrl+d", "Удалить отложенный запрос"),
  model_provider_list: keybind("ctrl+a", "Список провайдеров"),
  model_favorite_toggle: keybind("ctrl+f", "Добавить / убрать из избранного"),
  model_list: keybind("<leader>m", "Список моделей"),
  model_cycle_recent: keybind("f2", "Следующая недавняя модель"),
  model_cycle_recent_reverse: keybind("shift+f2", "Предыдущая недавняя модель"),
  model_cycle_favorite: keybind("none", "Следующая избранная модель"),
  model_cycle_favorite_reverse: keybind("none", "Предыдущая избранная модель"),
  mcp_list: keybind("none", "Список MCP-серверов"),
  provider_connect: keybind("none", "Подключить интеграцию"),
  agent_list: keybind("<leader>a", "Список агентов"),
  agent_cycle: keybind("shift+tab", "Следующий агент"),
  agent_cycle_reverse: keybind("none", "Предыдущий агент"),
  variant_cycle: keybind("ctrl+t", "Переключить вариант модели"),
  variant_list: keybind("none", "Варианты модели"),

  messages_page_up: keybind("pageup,ctrl+alt+b", "Сообщения вверх на страницу"),
  messages_page_down: keybind("pagedown,ctrl+alt+f", "Сообщения вниз на страницу"),
  messages_line_up: keybind("ctrl+alt+y", "Сообщения вверх на строку"),
  messages_line_down: keybind("ctrl+alt+e", "Сообщения вниз на строку"),
  messages_half_page_up: keybind("ctrl+alt+u", "Сообщения вверх на полстраницы"),
  messages_half_page_down: keybind("ctrl+alt+d", "Сообщения вниз на полстраницы"),
  messages_first: keybind("ctrl+g,home,alt+home", "К первому сообщению"),
  messages_last: keybind("ctrl+alt+g,end", "К последнему сообщению"),
  messages_next: keybind("none", "К следующему сообщению"),
  messages_previous: keybind("none", "К предыдущему сообщению"),
  messages_next_user: keybind("none", "К следующему сообщению пользователя"),
  messages_previous_user: keybind("none", "К предыдущему сообщению пользователя"),
  messages_last_user: keybind("alt+end", "К последнему сообщению пользователя"),
  messages_copy: keybind("<leader>y", "Копировать сообщение"),
  messages_undo: keybind("<leader>u", "Отменить сообщение"),
  messages_redo: keybind("<leader>r", "Повторить сообщение"),
  display_thinking: keybind("none", "Размышления показать / скрыть"),

  prompt_submit: keybind("none", "Отправить запрос"),
  prompt_queue: keybind("<leader>return", "Поставить запрос в очередь"),
  prompt_editor_context_clear: keybind("none", "Очистить контекст редактора"),
  prompt_images_view: keybind("<leader>i", "Вложенные изображения"),
  prompt_skills: keybind("none", "Выбрать навык"),
  prompt_stash: keybind("none", "Отложить запрос"),
  prompt_stash_pop: keybind("none", "Вернуть отложенный запрос"),
  prompt_stash_list: keybind("none", "Отложенные запросы"),

  input_clear: keybind("ctrl+c", "Очистить поле ввода"),
  input_paste: keybind({ key: "ctrl+v", preventDefault: false }, "Paste from clipboard"),
  input_submit: keybind("return", "Отправить ввод"),
  input_newline: keybind("shift+return,ctrl+return,alt+return,ctrl+j", "Новая строка"),
  input_move_left: keybind("left,ctrl+b", "Курсор влево"),
  input_move_right: keybind("right,ctrl+f", "Курсор вправо"),
  input_move_up: keybind("up", "Курсор вверх"),
  input_move_down: keybind("down", "Курсор вниз"),
  input_select_left: keybind("shift+left", "Выделить влево"),
  input_select_right: keybind("shift+right", "Выделить вправо"),
  input_select_up: keybind("shift+up", "Выделить вверх"),
  input_select_down: keybind("shift+down", "Выделить вниз"),
  input_line_home: keybind("ctrl+a", "В начало строки"),
  input_line_end: keybind("ctrl+e", "В конец строки"),
  input_select_line_home: keybind("ctrl+shift+a", "Выделить до начала строки"),
  input_select_line_end: keybind("ctrl+shift+e", "Выделить до конца строки"),
  input_visual_line_home: keybind("alt+a", "В начало видимой строки"),
  input_visual_line_end: keybind("alt+e", "В конец видимой строки"),
  input_select_visual_line_home: keybind("alt+shift+a", "Выделить до начала видимой строки"),
  input_select_visual_line_end: keybind("alt+shift+e", "Выделить до конца видимой строки"),
  input_buffer_home: keybind("none", "В начало текста"),
  input_buffer_end: keybind("none", "В конец текста"),
  input_select_buffer_home: keybind("shift+home", "Выделить до начала текста"),
  input_select_buffer_end: keybind("shift+end", "Выделить до конца текста"),
  input_delete_line: keybind("ctrl+shift+d", "Удалить строку"),
  input_delete_to_line_end: keybind("ctrl+k", "Удалить до конца строки"),
  input_delete_to_line_start: keybind("ctrl+u", "Удалить до начала строки"),
  input_backspace: keybind("backspace,shift+backspace", "Удалить символ слева"),
  input_delete: keybind("ctrl+d,delete,shift+delete", "Удалить символ справа"),
  input_undo: keybind("ctrl+-,super+z", "Отменить ввод"),
  input_redo: keybind("ctrl+.,super+shift+z", "Повторить ввод"),
  input_word_forward: keybind("alt+f,alt+right,ctrl+right", "Слово вправо"),
  input_word_backward: keybind("alt+b,alt+left,ctrl+left", "Слово влево"),
  input_select_word_forward: keybind("alt+shift+f,alt+shift+right", "Выделить слово справа"),
  input_select_word_backward: keybind("alt+shift+b,alt+shift+left", "Выделить слово слева"),
  input_delete_word_forward: keybind("alt+d,alt+delete,ctrl+delete", "Удалить слово справа"),
  input_delete_word_backward: keybind("ctrl+w,ctrl+backspace,alt+backspace", "Удалить слово слева"),
  input_select_all: keybind("super+a", "Выделить всё"),
  history_previous: keybind("up", "Предыдущий запрос из истории"),
  history_next: keybind("down", "Следующий запрос из истории"),

  "dialog.select.prev": keybind("up,ctrl+p", "Предыдущий пункт"),
  "dialog.select.next": keybind("down,ctrl+n", "Следующий пункт"),
  "dialog.select.page_up": keybind("pageup", "Страница вверх"),
  "dialog.select.page_down": keybind("pagedown", "Страница вниз"),
  "dialog.select.home": keybind("home", "К первому пункту"),
  "dialog.select.end": keybind("end", "К последнему пункту"),
  "dialog.select.submit": keybind("return", "Выбрать пункт"),
  "dialog.prompt.submit": keybind("return", "Отправить"),
  "dialog.project_copy.generate": keybind("tab", "Сгенерировать имя копии проекта"),
  "dialog.move_session.new": keybind("ctrl+m", "Новая копия проекта"),
  "dialog.move_session.delete": keybind("ctrl+d", "Удалить копию проекта"),
  "dialog.move_session.refresh": keybind("ctrl+r", "Обновить копии проекта"),
  "prompt.autocomplete.prev": keybind("up,ctrl+p", "Предыдущий вариант"),
  "prompt.autocomplete.next": keybind("down,ctrl+n", "Следующий вариант"),
  "prompt.autocomplete.hide": keybind("escape", "Скрыть автодополнение"),
  "prompt.autocomplete.select": keybind("return", "Выбрать вариант"),
  "prompt.autocomplete.complete": keybind("tab", "Дополнить вариант"),
  "permission.prompt.fullscreen": keybind("ctrl+f", "Разрешение на весь экран"),
  "plugins.toggle": keybind("return", "Плагин вкл/выкл"),
  "dialog.mcp.toggle": keybind("space", "MCP-сервер вкл/выкл"),

  terminal_suspend: keybind("ctrl+z", "Приостановить терминал"),
  terminal_title_toggle: keybind("none", "Заголовок терминала вкл/выкл"),
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
export const CommandMap = {
  app_exit: "app.exit",
  app_debug: "app.debug",
  app_console: "app.console",
  app_heap_snapshot: "app.heap_snapshot",
  app_toggle_animations: "app.toggle.animations",
  app_toggle_file_context: "app.toggle.file_context",
  app_toggle_diffwrap: "app.toggle.diffwrap",
  app_toggle_paste_summary: "app.toggle.paste_summary",
  command_list: "command.palette.show",
  help_show: "help.show",
  docs_open: "docs.open",
  diff_open: "diff.open",
  diff_close: "diff.close",
  diff_toggle: "diff.toggle",
  diff_expand: "diff.expand",
  diff_expand_all: "diff.expand_all",
  diff_collapse: "diff.collapse",
  diff_switch_focus: "diff.switch_focus",
  diff_next_hunk: "diff.next_hunk",
  diff_previous_hunk: "diff.previous_hunk",
  diff_next_file: "diff.next_file",
  diff_previous_file: "diff.previous_file",
  diff_toggle_file_tree: "diff.toggle_file_tree",
  diff_single_patch: "diff.single_patch",
  diff_switch_source: "diff.switch_source",
  diff_toggle_view: "diff.toggle_view",
  diff_help: "diff.help",
  editor_open: "prompt.editor",
  theme_list: "theme.switch",
  theme_switch_mode: "theme.switch_mode",
  theme_mode_lock: "theme.mode.lock",
  sidebar_toggle: "session.sidebar.toggle",
  scrollbar_toggle: "session.toggle.scrollbar",
  status_view: "opencode.status",
  debug_view: "opencode.debug",
  session_export: "session.export",
  session_copy: "session.copy",
  session_move: "session.move",
  session_new: "session.new",
  session_list: "session.list",
  open_menu: "open.menu",
  session_tab_next: "session.tab.next",
  session_tab_previous: "session.tab.previous",
  session_tab_next_unread: "session.tab.next_unread",
  session_tab_previous_unread: "session.tab.previous_unread",
  session_tab_close: "session.tab.close",
  session_tab_reopen: "session.tab.reopen",
  session_timeline: "session.timeline",
  session_fork: "session.fork",
  session_rename: "session.rename",
  session_delete: "session.delete",
  session_share: "session.share",
  session_unshare: "session.unshare",
  session_interrupt: "session.interrupt",
  session_background: "session.background",
  session_compact: "session.compact",
  session_queued_prompts: "session.queued_prompts",
  queued_prompt_delete: "queued_prompt.delete",
  session_child_first: "session.child.first",
  session_parent: "session.parent",
  session_pin_toggle: "session.pin.toggle",
  session_quick_switch_1: "session.quick_switch.1",
  session_quick_switch_2: "session.quick_switch.2",
  session_quick_switch_3: "session.quick_switch.3",
  session_quick_switch_4: "session.quick_switch.4",
  session_quick_switch_5: "session.quick_switch.5",
  session_quick_switch_6: "session.quick_switch.6",
  session_quick_switch_7: "session.quick_switch.7",
  session_quick_switch_8: "session.quick_switch.8",
  session_quick_switch_9: "session.quick_switch.9",
  session_tab_select_1: "session.tab.select.1",
  session_tab_select_2: "session.tab.select.2",
  session_tab_select_3: "session.tab.select.3",
  session_tab_select_4: "session.tab.select.4",
  session_tab_select_5: "session.tab.select.5",
  session_tab_select_6: "session.tab.select.6",
  session_tab_select_7: "session.tab.select.7",
  session_tab_select_8: "session.tab.select.8",
  session_tab_select_9: "session.tab.select.9",
  session_tab_select_10: "session.tab.select.10",
  stash_delete: "stash.delete",
  model_provider_list: "model.dialog.provider",
  model_favorite_toggle: "model.dialog.favorite",
  model_list: "model.list",
  model_cycle_recent: "model.cycle_recent",
  model_cycle_recent_reverse: "model.cycle_recent_reverse",
  model_cycle_favorite: "model.cycle_favorite",
  model_cycle_favorite_reverse: "model.cycle_favorite_reverse",
  mcp_list: "mcp.list",
  provider_connect: "provider.connect",
  agent_list: "agent.list",
  agent_cycle: "agent.cycle",
  agent_cycle_reverse: "agent.cycle.reverse",
  variant_cycle: "variant.cycle",
  variant_list: "variant.list",
  messages_page_up: "session.page.up",
  messages_page_down: "session.page.down",
  messages_line_up: "session.line.up",
  messages_line_down: "session.line.down",
  messages_half_page_up: "session.half.page.up",
  messages_half_page_down: "session.half.page.down",
  messages_first: "session.first",
  messages_last: "session.last",
  messages_next: "session.message.next",
  messages_previous: "session.message.previous",
  messages_next_user: "session.message.user.next",
  messages_previous_user: "session.message.user.previous",
  messages_last_user: "session.messages_last_user",
  messages_copy: "messages.copy",
  messages_undo: "session.undo",
  messages_redo: "session.redo",
  display_thinking: "session.toggle.thinking",
  prompt_submit: "prompt.submit",
  prompt_queue: "prompt.queue",
  prompt_editor_context_clear: "prompt.editor_context.clear",
  prompt_images_view: "prompt.images.view",
  prompt_skills: "prompt.skills",
  prompt_stash: "prompt.stash",
  prompt_stash_pop: "prompt.stash.pop",
  prompt_stash_list: "prompt.stash.list",
  input_clear: "prompt.clear",
  input_paste: "prompt.paste",
  input_submit: "input.submit",
  input_newline: "input.newline",
  input_move_left: "input.move.left",
  input_move_right: "input.move.right",
  input_move_up: "input.move.up",
  input_move_down: "input.move.down",
  input_select_left: "input.select.left",
  input_select_right: "input.select.right",
  input_select_up: "input.select.up",
  input_select_down: "input.select.down",
  input_line_home: "input.line.home",
  input_line_end: "input.line.end",
  input_select_line_home: "input.select.line.home",
  input_select_line_end: "input.select.line.end",
  input_visual_line_home: "input.visual.line.home",
  input_visual_line_end: "input.visual.line.end",
  input_select_visual_line_home: "input.select.visual.line.home",
  input_select_visual_line_end: "input.select.visual.line.end",
  input_buffer_home: "input.buffer.home",
  input_buffer_end: "input.buffer.end",
  input_select_buffer_home: "input.select.buffer.home",
  input_select_buffer_end: "input.select.buffer.end",
  input_delete_line: "input.delete.line",
  input_delete_to_line_end: "input.delete.to.line.end",
  input_delete_to_line_start: "input.delete.to.line.start",
  input_backspace: "input.backspace",
  input_delete: "input.delete",
  input_undo: "input.undo",
  input_redo: "input.redo",
  input_word_forward: "input.word.forward",
  input_word_backward: "input.word.backward",
  input_select_word_forward: "input.select.word.forward",
  input_select_word_backward: "input.select.word.backward",
  input_delete_word_forward: "input.delete.word.forward",
  input_delete_word_backward: "input.delete.word.backward",
  input_select_all: "input.select.all",
  history_previous: "prompt.history.previous",
  history_next: "prompt.history.next",
  terminal_suspend: "terminal.suspend",
  terminal_title_toggle: "terminal.title.toggle",
} satisfies BindingCommandMap
const CommandDescriptions = Object.fromEntries(
  Object.entries(Definitions).map(([name, item]) => [
    CommandMap[name as keyof typeof CommandMap] ?? name,
    item.description,
  ]),
) as Record<string, string>

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
    return { desc: CommandDescriptions[command] }
  }
}
