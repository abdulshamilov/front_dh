# План редизайна страницы `/chat` (AI-помощник DreamHouse)

> **Подход:** полное переписывание с нуля. Текущий `app/chat/page.tsx` и `ChatModal` не правятся, а заменяются. Hooks из `app/components/AIModal/hooks/` переиспользуются как есть — они работают корректно.

> **Язык общения и комментариев:** русский в описаниях, английский в коде (`// comments`).

> **Визуальный ориентир:** мобильный KMP-экран `feature_ai/composable/AIScreen.kt` + тёмная главная сайта (`--home-*` токены). Стиль — Claude/Perplexity: чистый тёмный фон, ответ ИИ без bubble, suggestion chips на пустом экране, горизонтальный скролл карточек под ответом.

---

## 1. Цель и принципы

### Зачем переделываем
Текущая страница работает, но визуально отстаёт: светлые `--product-*`/`--accent-*` токены, синяя плашка сайдбара, emoji вместо иконок, inline-styles, Header/Footer показываются над чатом. Нет связи ни с мобилкой, ни с новой тёмной главной.

### Принципы редизайна
1. **Единый язык с мобильным приложением.** Палитра `DreamColors` ≡ `--home-*` токены. AI-аватар, TypingIndicator, MicPulseRing, суggestion chips — переносим визуальные решения из `AIScreen.kt` один-в-один.
2. **Минимализм Claude/Perplexity.** Ответ ИИ — без bubble, плоский текст с аватаром слева. Пузырь только у пользователя (как в мобилке).
3. **Полноэкранный layout.** Никакого Header/Footer/BottomBar на `/chat` — собственный `layout.tsx` без глобальной обвязки.
4. **Только `--home-*` токены.** Никаких hex в JSX, никаких `--product-*` / `--accent-*` / `--bg-primary` на новой странице.
5. **Mobile-first.** Все размеры задаются от 360px viewport, затем расширяются через `@media (min-width: 768px)`.
6. **Hooks не трогаем.** Контракт `useChatHistory` / `useChatMessages` / `useVoiceInput` стабилен, визуал — отдельный слой.
7. **Никаких inline-styles где возможно.** Предпочтительно CSS Modules или `<style jsx>` с переменными, inline только для динамических значений (ширина bubble по контенту, пр.).

---

## 2. Архитектура: структура файлов

Создаётся новая папка `/app/chat/` + выделенная папка компонентов.

```
dreamhouse-site/app/chat/
├── layout.tsx                    ← NEW (полноэкранный, без Header/Footer)
├── page.tsx                      ← PEПИШЕМ С НУЛЯ (тонкий контейнер)
└── components/                   ← NEW (локальные компоненты страницы)
    ├── ChatShell.tsx             ← корневая вёрстка: header + messages + input
    ├── ChatHeader.tsx            ← back-button + AI avatar + title
    ├── ChatMessages.tsx          ← лента сообщений + autoscroll
    ├── ChatMessageUser.tsx       ← пузырь пользователя (primary gradient)
    ├── ChatMessageAssistant.tsx  ← ответ ИИ: avatar + plain text
    ├── ReferencedCards.tsx       ← горизонтальный scroll карточек
    ├── TypingIndicator.tsx       ← 3 stagger-точки + "Пишет..."
    ├── EmptyState.tsx            ← avatar + title + 4 suggestion chips
    ├── SuggestionChip.tsx        ← один chip (иконка слева, текст, send справа)
    ├── ChatInputBar.tsx          ← input + mic + send
    ├── MicPulseRing.tsx          ← 2 кольца при isListening
    ├── AIAvatar.tsx              ← gradient circle + Sparkles icon (размеры 28/40/72)
    └── ChatErrorBanner.tsx       ← сверху, если error !== null
```

**Ничего не добавляем в глобальный `/app/components/`** — всё локально в `/app/chat/components/`. Это AI-специфичная вёрстка, переиспользования не ждём.

---

## 3. Этапы и задачи

Работа разбита на **5 этапов** по ~0.5–1.5 дня каждый. Последовательность важна — предыдущие этапы разблокируют следующие.

---

### Этап 1. Фундамент — layout, токены, скелет страницы

**Цель:** убрать глобальный Header/Footer на `/chat`, подготовить пустой тёмный холст и тонкий `page.tsx`.

**Задачи:**
1. Создать `/app/chat/layout.tsx`:
   - `"use client"` НЕ нужен (layout может быть server component)
   - Возвращает только `children` внутри `<div>` с `min-height: 100dvh; background: var(--home-bg); color: var(--home-text-primary)`
   - Не импортирует Header/Footer/BottomBar
2. Проверить глобальный `/app/layout.tsx`: если Header рендерится безусловно — нужно добавить маркер `pathname === "/chat"` и скрыть (или вынести Header в отдельный layout для остальных страниц). **Расследуй перед решением**: возможно, проще оставить глобальный layout без изменений, а на `/chat` Header позиционно перекрыть — но это костыль. Предпочтительно: переместить `<Header />`/`<Footer />` из глобального в `(site)/layout.tsx` route group.
3. Создать скелет `/app/chat/page.tsx` (< 30 строк):
   ```tsx
   "use client";
   import ProtectedRoute from "@/app/components/ProtectedRoute";
   import { ChatShell } from "./components/ChatShell";

   export default function ChatPage() {
     return (
       <ProtectedRoute>
         <ChatShell />
       </ProtectedRoute>
     );
   }
   ```
4. Создать пустой `ChatShell.tsx` с fullscreen `display: flex; flex-direction: column; height: 100dvh`.

**DoD (Definition of Done):**
- Открываем `localhost:3000/chat` — видим полностью тёмный экран (`#070707`), никаких Header/Footer/BottomBar.
- Mobile Safari: адресная строка не ломает высоту (`100dvh`, не `100vh`).
- `npm run build` проходит без ошибок.

---

### Этап 2. Компоненты-примитивы (дизайн-слой)

**Цель:** собрать переиспользуемые визуальные блоки, которые на следующем этапе сложатся в экран.

Все компоненты **stateless**, получают пропсы, не лазят в hooks / Redux. Стили — через `<style jsx>` + `--home-*` токены.

#### 2.1 `AIAvatar.tsx`
- Пропсы: `{ size?: "sm" | "md" | "lg" }` → 28 / 40 / 72 px
- Круглый div, `background: linear-gradient(135deg, var(--home-accent) 0%, var(--home-accent-link) 100%)`
- Внутри иконка `Sparkles` из `lucide-react`, цвет `#FFFFFF`, размер 60% от контейнера
- На `size="lg"` добавить soft outer glow: `box-shadow: 0 0 40px rgba(0,117,255,0.35)`

#### 2.2 `ChatHeader.tsx`
- Высота 56 px (mobile), 64 px (desktop)
- Layout: `back-button` (left) | `AIAvatar size="md"` + заголовок "AI-помощник" + подпись "Подбор за минуту" (center-left) | spacer (right)
- Фон: `var(--home-bg)` с `border-bottom: 1px solid var(--home-border)`
- back-button: icon `ChevronLeft` (lucide), 40×40 touch target, hover → `background: var(--home-surface)`
- Шрифт заголовка: `var(--font-manrope)`, 700, 16px; подпись — `var(--font-inter)`, 400, 12px, цвет `var(--home-text-secondary)`

#### 2.3 `TypingIndicator.tsx`
- Горизонтальный flex: `AIAvatar size="sm"` + 3 точки (8×8) + текст "Пишет..."
- Точки: `background: var(--home-accent)`, анимация `pulse-dot 1.4s ease-in-out infinite`, задержки `0s / 0.2s / 0.4s`
- Текст: `var(--home-text-secondary)`, 13px, `var(--font-inter)`

#### 2.4 `MicPulseRing.tsx`
- 2 вложенных абсолютных div с `border: 2px solid var(--home-accent)`, border-radius 50%
- Анимация `mic-ring 2s ease-out infinite`, scale `1 → 1.8`, opacity `0.6 → 0`, задержки `0s` и `0.4s`
- Рендерится только при `active` prop

#### 2.5 `SuggestionChip.tsx`
- Пропсы: `{ icon: LucideIcon; label: string; onClick: () => void }`
- Layout: icon (left) + label (flex-1) + `Send` icon (right, `var(--home-text-tertiary)`)
- Фон: `var(--home-surface)`, border `1px solid var(--home-border)`, radius 16, padding 14/16
- Hover (desktop) / active (mobile): `background: var(--home-surface-elevated)`, `transform: translateY(-1px)`
- Шрифт: `var(--font-inter)` 500 14px, цвет `var(--home-text-primary)`
- Min-height 56px для touch-target

#### 2.6 `ChatMessageUser.tsx`
- Пропс: `text: string`
- Flex `justify-content: flex-end`
- Bubble: `background: linear-gradient(135deg, var(--home-accent), var(--home-accent-link))`, color `#FFFFFF`, radius `20/20/20/6` (скруглённый левый-нижний как в мобилке — дробный угол)
- Max-width: 90% mobile, 72% desktop; padding 12/16
- Шрифт: `var(--font-inter)` 400, 14px (mobile) / 15px (desktop), `white-space: pre-wrap`, `line-height: 1.5`

#### 2.7 `ChatMessageAssistant.tsx`
- Пропс: `text: string`
- Flex `justify-content: flex-start`, layout: `AIAvatar size="sm"` (aligned top) + plain text column (flex-1)
- **Без bubble, без background**. Просто текст на тёмном фоне.
- Текст: `var(--home-text-primary)`, `var(--font-inter)` 400, 15px, line-height 1.6, `white-space: pre-wrap`
- Max-width: 100% mobile, 80% desktop (чтобы длинные строки не тянулись на весь экран)

#### 2.8 `ReferencedCards.tsx`
- Пропс: `cards: ICard[]`
- Заголовок сверху: `🏠` заменить на иконку `Home` (lucide), текст "Рекомендованные объекты (N)", цвет `var(--home-accent-link)`
- Горизонтальный scroll-контейнер:
  ```css
  display: flex; gap: 12px;
  overflow-x: auto; overflow-y: hidden;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 0 16px; /* чтобы первая/последняя карточки не липли */
  ```
- Каждый элемент: `flex: 0 0 200px` на mobile, `240px` на desktop; `scroll-snap-align: start`
- Внутри — существующий `CardItemPreview`. **ВАЖНО:** проверь, не ломаются ли его стили на тёмном фоне. Если да — оборачивай в div с `background: var(--home-surface)` и передавай проп; либо создай вариант `CardItemPreview variant="compact-dark"` — решается по ходу этапа 3.
- Лимит: 6 карточек (не 4, как сейчас) — больше раскрывает потенциал рекомендаций

#### 2.9 `EmptyState.tsx`
- Пропсы: `{ onSuggestionClick: (text: string) => void }`
- Центрированный контейнер (justify-center в родителе)
- Стек: `AIAvatar size="lg"` + заголовок + подзаголовок + сетка из 4 chips
- Заголовок: "Спроси о недвижимости", `var(--font-manrope)` 700, 22px (mobile) / 28px (desktop), с `.gradient-text` эффектом
- Подзаголовок: "AI подберёт квартиры под твои критерии за секунду", `var(--home-text-secondary)`, 14px, max-width 320px, center-aligned
- 4 chips из мобилки (тексты из `AIScreen.kt`, stringResource ключи):
  | Иконка | Текст |
  |--------|-------|
  | `Wallet` | Квартиры до 5 миллионов |
  | `Home` | Студии в центре |
  | `Sparkles` | Новостройки со сданными домами |
  | `Percent` | Что насчёт акций? |
- Layout chips: 1 колонка mobile, 2 колонки desktop (`grid-template-columns: repeat(2, 1fr)` при `min-width: 768px`)
- Клик по chip → `onSuggestionClick(text)` → hook отправит сообщение

#### 2.10 `ChatInputBar.tsx`
- Пропсы:
  ```ts
  {
    value: string;
    onChange: (v: string) => void;
    onSend: () => void;
    onToggleMic: () => void;
    isListening: boolean;
    isLoading: boolean;
    placeholder?: string;
  }
  ```
- Контейнер: `background: var(--home-surface)`, `border: 1px solid var(--home-border)`, radius 24, padding 8/8/8/16
- Внутри: `<input>` (flex-1, transparent, 16px — предотвращает zoom iOS) + mic-button + send-button
- mic-button: 40×40, radius 12
  - `!isListening`: `background: transparent`, icon `Mic` цвет `var(--home-accent)`
  - `isListening`: `background: var(--home-danger)`, icon `MicOff` белый, вокруг `<MicPulseRing active />`
- send-button: 40×40 circle
  - disabled (`!value.trim() || isLoading`): `background: var(--home-surface-elevated)`, icon `ArrowUp` цвет `var(--home-text-tertiary)`
  - enabled: `background: var(--home-accent)`, icon `ArrowUp` цвет `#FFFFFF`
- Placeholder по умолчанию: "Опиши квартиру мечты…"
- **safe-area-inset-bottom**: внешний padding контейнера `padding-bottom: calc(12px + env(safe-area-inset-bottom))` для iOS
- Enter → onSend (shift+Enter оставляем для будущего textarea, пока не реализуем)

#### 2.11 `ChatErrorBanner.tsx`
- Пропсы: `{ message: string; onDismiss: () => void }`
- Красная плашка сверху: `background: rgba(255,68,68,0.12)`, `border: 1px solid var(--home-danger)`, radius 12
- Текст + кнопка `X` справа
- Mount-анимация через `.animate-fadeSlideUp`

**DoD этапа 2:**
- Все компоненты рендерятся в Storybook/тестовой странице (или через ручную проверку в `ChatShell.tsx` c mock-данными).
- `npm run build` проходит.
- Нет TypeScript `any`.
- Каждый компонент принимает стабильные пропсы, не знает про axios/Redux.

---

### Этап 3. Сборка `ChatShell` — интеграция с hooks

**Цель:** собрать готовые компоненты в рабочий экран, подключить hooks.

**Задачи:**
1. `ChatShell.tsx` импортирует `useChatHistory`, `useChatMessages`, `useVoiceInput` из `@/app/components/AIModal/hooks`.
2. Локальный state: `inputText`, `mounted`, `isDesktop` (viewport через `matchMedia`).
3. **Важно:** повторяет логику текущего `chat/page.tsx`, строки 62–67 — объединение `history + messages` с дедупликацией по `id`. Не ломаем контракт.
4. Автоскролл на `messagesEndRef` при изменении `allMessages`.
5. Автофокус на input при монтировании.
6. `onSuggestionClick` из `EmptyState` → `sendMessage(text)`.
7. Layout:
   ```
   <ChatHeader />
   {error && <ChatErrorBanner />}
   <ChatMessages>
     {allMessages.length === 0 && !isLoading && <EmptyState />}
     {allMessages.map(msg => <>
       <ChatMessageUser text={msg.message} />
       {msg.response && <ChatMessageAssistant text={msg.response} />}
       {msg.referenced_cards?.length > 0 && <ReferencedCards cards={msg.referenced_cards} />}
     </>)}
     {isLoading && <TypingIndicator />}
     <div ref={endRef} />
   </ChatMessages>
   <ChatInputBar ... />
   ```
8. Проверить `useVoiceInput.onFinalText`: в мобилке финальный текст **попадает в input**, пользователь вручную отправляет. На сайте сейчас автоотправка — **меняем на поведение как в мобилке**: `onFinalText: (text) => setInputText(text)`. Это даст пользователю шанс отредактировать. (Точка для подтверждения с владельцем — возможно, текущее поведение было осознанным.)

**DoD этапа 3:**
- Пустой экран показывает EmptyState с 4 chips.
- Клик по chip отправляет сообщение, появляется bubble пользователя → TypingIndicator → ответ ИИ.
- Referenced cards скроллятся горизонтально.
- История грузится при открытии.
- Ошибка API показывает `ChatErrorBanner`, dismiss работает.
- Голосовой ввод: кнопка mic → pulse rings → текст в input → ручной send.
- Mobile viewport (iPhone SE, 375×667): всё помещается, input не перекрывает сообщения, safe-area учтён.

---

### Этап 4. Анимации и полировка

**Цель:** добавить «живости» в духе Perplexity/Claude, без перегруза.

**Задачи:**
1. `allMessages.map` — каждое новое сообщение монтируется с `.animate-fadeSlideUp` (уже есть в globals.css). Ключевой момент: использовать `key={msg.id}`, чтобы React не переанимировал существующие.
2. `EmptyState` — entrance с лёгкой задержкой: avatar `animate-scale-in`, chips stagger по 60ms (inline `animationDelay: ${i * 60}ms`).
3. `TypingIndicator` stagger dots — реализован в CSS.
4. Input bar при `isListening` — soft glow через `box-shadow: 0 0 24px rgba(0,117,255,0.25)`, transition 200ms.
5. Send-button: `transform: scale(0.94)` on `:active` для tactile feedback.
6. Мягкая виньетка вокруг messages-зоны: `background: radial-gradient(1200px 600px at 50% 0%, rgba(0,117,255,0.05), transparent 70%)` на `ChatShell`.
7. При скролле к старым сообщениям — fade сверху (linear-gradient mask на top 40px контейнера).

**DoD этапа 4:**
- Анимации плавные (60fps в Chrome DevTools Performance).
- Prefers-reduced-motion: все анимации отключаются через `@media (prefers-reduced-motion: reduce)`.
- Нет layout shift при появлении новых сообщений.

---

### Этап 5. QA + совместимость

**Цель:** убедиться, что страница работает на всех целевых устройствах и не сломала остальной сайт.

**Задачи:**
1. **Ручная проверка:**
   - Desktop Chrome 1440px: layout корректен, карточки горизонтально скроллятся
   - Desktop Chrome 1024px
   - iPad (768px)
   - iPhone 14 Safari (390×844) — safe-area top/bottom
   - iPhone SE (375×667) — минимальный viewport
2. **Auth-флоу:** разлогиниться → `/chat` редиректит на `/login` через `ProtectedRoute`.
3. **Регрессия главной:** открыть `/`, убедиться что Header/Footer на месте, PromoBanner не сломан (Этап 1 мог затронуть layout).
4. **Проверка других страниц:** `/card/[id]`, `/favorite`, `/profile`, `/map`, `/landing` — все работают.
5. **Производительность:** Lighthouse на `/chat` (Mobile) — Performance ≥ 85, Accessibility = 100.
6. **A11y:**
   - Клавиатурная навигация (Tab через chips, Enter для отправки, Esc для закрытия ошибки)
   - Screen reader: ARIA-роли (`role="log"` на messages container, `aria-live="polite"` для новых ответов ИИ)
   - `aria-label` на всех иконочных кнопках (mic, send, back)
   - `contentDescription` (в React — `aria-label`) для `AIAvatar`: "Помощник DreamHouse AI"
7. **TypeScript:** `npm run type-check` без ошибок.
8. **Lint:** `npm run lint` чистый.
9. **Удаление старого кода:** после подтверждения — удалить старый inline JSX из `app/chat/page.tsx` (уже заменён). Компоненты `/app/components/AIModal/` — hooks оставляем, модалку ChatModal (если есть) оставляем, она используется в другом месте (в кнопке на главной?). Проверить импорты!

**DoD этапа 5:**
- Все проверки пройдены, скриншоты приложены к PR.
- PR готов к ревью.

---

## 4. Контракты и константы

### 4.1 API (не меняется)
- `GET /cards/ai/history/` → `AIMessage[]` (или `{ results: AIMessage[] }`)
- `POST /cards/ai/chat/` body `{ message: string }` → `AIMessage`
- Base URL: `API_BASE_URL` из `@/app/shared/config/axios`
- Auth: через interceptor, нас не касается

### 4.2 Тип `AIMessage`
```ts
interface AIMessage {
  id: number;
  message: string;
  response: string;
  referenced_cards: ICard[];
  tokens_used: number;
  is_helpful: boolean | null;
  created_at: string;
}
```
Переиспользуем импорт из `@/app/components/AIModal/hooks/useChatHistory` (там он экспортирован).

### 4.3 Используемые `--home-*` токены
Только эти 14, строго через `var(...)`:
- `--home-bg`, `--home-surface`, `--home-surface-elevated`
- `--home-border`, `--home-border-strong`
- `--home-text-primary`, `--home-text-secondary`, `--home-text-tertiary`
- `--home-accent`, `--home-accent-link`, `--home-accent-soft`
- `--home-price` (для цены в карточках, если коснётся)
- `--home-danger` (ошибки, mic active)
- `--home-hero-gradient` (общий фон shell, опционально)

### 4.4 Шрифты
- Заголовки: `var(--font-manrope)`
- Основной текст: `var(--font-inter)`
- Никаких локальных fonts, никаких system-ui fallback в JSX

### 4.5 Иконки
Только `lucide-react`:
- Header: `ChevronLeft`
- AI avatar: `Sparkles`
- Input: `Mic`, `MicOff`, `ArrowUp`
- Chips: `Wallet`, `Home`, `Sparkles`, `Percent`
- Referenced cards header: `Home`
- Error dismiss: `X`

### 4.6 Breakpoints
- Mobile-first, `@media (min-width: 768px)` = desktop override
- `matchMedia("(min-width: 768px)")` для JS-ответвлений (высота header, размеры карточек)

---

## 5. Риски и решения

| Риск | Вероятность | Решение |
|------|-------------|---------|
| Header/Footer в глобальном layout блокирует fullscreen на `/chat` | Высокая | Route group `(site)/layout.tsx` для основного сайта + отдельный `/chat/layout.tsx`. Делать на Этапе 1. |
| `CardItemPreview` сломается на тёмном фоне | Средняя | Сначала проверить визуально в Этапе 3. Если ломается — добавить проп `variant="dark"` в `CardItemPreview`, править минимально. |
| `useVoiceInput` автоотправляет, а мы хотим как в мобилке | Высокая | Решить с владельцем до Этапа 3 (см. задачу 3.8). Изменение локальное — пропс `onFinalText`. |
| iOS Safari 100vh баг | Средняя | Используем `100dvh`, `env(safe-area-inset-*)`. Покрыто в Этапах 1 и 2. |
| Старый `ChatModal` (если есть) дёргается где-то ещё | Низкая | Grep `ChatModal` перед удалением. Скорее всего не трогаем — hooks общие. |
| `ChatInputBar` zoom на iOS при focus | Средняя | `font-size: 16px` на `<input>` (обязательно ≥ 16 для Safari). |

---

## 6. Чек-лист ревью PR

- [ ] Новая страница — полностью новые файлы в `/app/chat/` и `/app/chat/components/`
- [ ] `useChatHistory/useChatMessages/useVoiceInput` НЕ изменены
- [ ] Нет импортов `--product-*`, `--bg-primary`, `--accent-primary` в новых файлах
- [ ] Нет hex/rgb в JSX — только `var(--home-*)`
- [ ] Нет emoji в UI (заменены на lucide-иконки)
- [ ] Все иконочные кнопки имеют `aria-label`
- [ ] Header/Footer/BottomBar не видны на `/chat`
- [ ] Остальные страницы сайта не пострадали
- [ ] TypeScript без `any`, lint чистый
- [ ] Скриншоты mobile + desktop приложены
- [ ] Lighthouse Performance Mobile ≥ 85, A11y = 100
- [ ] Проверено: разлогиненный → редирект на `/login`
- [ ] safe-area работает на iPhone (скриншот из реального устройства / Safari responsive)

---

## 7. Оценка

| Этап | Трудозатраты |
|------|-------------|
| 1. Layout / скелет | 0.5 дня |
| 2. Компоненты-примитивы (13 штук) | 1.5 дня |
| 3. Сборка ChatShell | 0.5 дня |
| 4. Анимации | 0.5 дня |
| 5. QA + полировка | 0.5 дня |
| **Итого** | **~3.5 дня** |

---

## 8. Что НЕ делаем в этом PR (future work)

- Стриминг ответов ИИ (нет на бэкенде)
- Панель истории диалогов слева (ChatGPT-стиль) — решили отказаться, одна лента проще
- Редактирование/удаление сообщений
- Feedback buttons (👍/👎) под ответом — `is_helpful` в DTO есть, но бэкенд-эндпоинта пока нет
- Копирование ответа в буфер
- Markdown-рендер ответа (бэкенд возвращает plain text)
- Голосовой autoreply (TTS)

Эти пункты — отдельные тикеты после релиза редизайна.
