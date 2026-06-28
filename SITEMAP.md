# Dream House — Карта сайта и связей

> Файл для аудита сайта. Рядом с каждым разделом — место для заметок: что исправить, что улучшить.

---

## Навигация (постоянная)

### Нижняя панель (мобайл) — `BottomBar`
| Иконка | Маршрут | Файл |
|--------|---------|------|
| 🏠 Главная | `/` | `app/page.tsx` |
| 🏷️ Акции | `/sale` | `app/sale/page.tsx` |
| 📍 Карта (FAB) | `/map` | `app/map/page.tsx` |
| ❤️ Избранное | `/favorite` | `app/favorite/page.tsx` |
| 👤 Профиль | `/profile` | `app/profile/page.tsx` |

**Скрывается на:** `/login`, `/register`, `/forgot`, `/chat`, `/map`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### Шапка (Header) — `app/components/Header/index.tsx`
- Логотип → `/`
- Кнопка "Избранное" → `/favorite`
- Уведомления → `NotificationBell` (выпадающий)
- Поддержка → `SupportTooltip` (всплывающий)
- Аватар → `HeaderAvatar` (зависит от авторизации)
- Поиск → `Search` компонент → URL `/?q=...`
- Фильтры → открывает `FiltersModal` через CustomEvent `"open-filters"`
- Выбор города → `CityPicker`

**Скрывается на:** `/login`, `/register`, `/forgot`, `/chat`, `/profile`, `/card/*`, `/map`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### Подвал (Footer) — `app/components/Footer/index.tsx`
- Главная → `/`
- Избранное → `/favorite`
- Мой профиль → `/profile`
- Поддержка → `SupportTooltip`
- Политика конфиденциальности → `/politic_conf.pdf`
- Пользовательское соглашение → `/user_sogl.pdf`

**Скрывается на:** `/login`, `/register`, `/forgot`, `/chat`, `/map`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

## Страницы

### `/` — Главная
**Файл:** `app/page.tsx`  
**Компоненты:**
- `PromoBanner` — баннер/карусель промо
- `FilterBar` — фильтрация + сортировка
- `ListingsGrid` — сетка карточек недвижимости
- `DevelopersPreview` — блок застройщиков
- `Testimonials` — отзывы
- `FinalCTA` — финальный призыв к действию

**Связи (исходящие):**
- Карточка объекта → `/card/[id]`
- Застройщик → `/developers/[id]`
- Застройщики (все) → `/developers`
- Поиск → `/?q=текст`
- Фильтры → `/?category=...&city=...&price_min=...` и т.д.

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/card/[id]` — Карточка объекта
**Файл:** `app/card/[id]/page.tsx`  
**Компоненты:**
- `HeroGallery` — галерея фотографий
- `PriceTitleSection` — цена, название, адрес, чипы
- `DeveloperCardApp` — карточка застройщика
- `UnderlineTabs` — табы: Описание / Характеристики / Документы / Карта / Рассрочка
- `DescriptionSectionApp` — описание
- `CharacteristicsSectionApp` — характеристики
- `DocumentsSectionApp` — документы
- `MapPreviewApp` — карта с локацией
- `PricingSection` — рассрочка / ипотека
- `SimilarListings` — похожие объекты
- `BottomCtaApp` — нижняя кнопка (Позвонить / Отправить заявку)
- `AsidePanel` — боковая панель на десктопе
- `CallRequestModal` — модал заявки

**Связи (исходящие):**
- Похожие объекты → `/card/[другой id]`
- Застройщик → `/developers/[id]`
- Кнопка назад → `router.back()`
- Заявка → API `POST /requests/`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/map` — Карта объектов
**Файл:** `app/map/page.tsx`  
**Компоненты:**
- `MapCanvas` — основная карта (MapLibre / MapBox)
- `NearbyCardsStrip` — горизонтальная лента объектов
- `SelectedCardSheet` — шит выбранного объекта
- `CompareTray` — трей сравнения
- `LayersChip` — переключение слоёв
- `MyLocationFAB` — кнопка "моё местоположение"
- `SearchThisAreaButton` — поиск в области
- `ZoomBreadcrumb` — подпись при зуме

**Связи:**
- Объект на карте → `/card/[id]`
- Header и BottomBar скрыты на этой странице

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/favorite` — Избранное
**Файл:** `app/favorite/page.tsx`  
**Связи:**
- Карточка → `/card/[id]`
- `ScheduleViewingSheet` — запись на просмотр

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/sale` — Акции
**Файл:** `app/sale/page.tsx`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/developers` — Все застройщики / ЖК
**Файл:** `app/developers/page.tsx`  
**Связи:**
- Застройщик → `/developers/[id]`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/developers/[id]` — Страница застройщика
**Файл:** `app/developers/[id]/page.tsx`  
**Связи:**
- Объект застройщика → `/card/[id]`
- Подписка → `developers/subscriptions`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/developers/subscriptions` — Подписки на застройщиков
**Файл:** `app/developers/subscriptions/page.tsx`  
**Требует авторизацию:** да

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/profile` — Профиль пользователя
**Файл:** `app/profile/page.tsx`  
**Требует авторизацию:** да (`ProtectedRoute`)  
**Секции (через `?section=...`):**
- `referral` — Реферальная программа
- `account` — Аккаунт / настройки
- `views` — История просмотров → карточки `/card/[id]`
- `reviews` — Мои отзывы (пустая)
- `questions` — Мои вопросы (пустая)

**Связи:**
- История просмотров → `/card/[id]`
- Вакансия → `/vacancy`
- Удаление аккаунта → `DeleteAccountModal`
- Аватар → API `PATCH /users/profile-photo/`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/login` — Вход
**Файл:** `app/login/page.tsx`  
**Связи:**
- После входа → `/` (или redirect из `PublicRoute`)
- Забыл пароль → `/forgot-password`
- Регистрация → `/register`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/register` — Регистрация
**Файл:** `app/register/page.tsx`  
**Связи:**
- После регистрации → `/`
- Вход → `/login`
- Реферал активируется из URL → `/ref/[code]`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/forgot-password` — Восстановление пароля
**Файл:** `app/forgot-password/page.tsx`  
**Связи:**
- После сброса → `/login`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/ref/[code]` — Реферальная ссылка
**Файл:** `app/ref/[code]/page.tsx`  
**Связи:**
- Перенаправляет на `/register` с кодом

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/chat` — AI-ассистент (чат)
**Файл:** `app/chat/page.tsx`  
**Компоненты:**
- `ChatShell` — основной контейнер
- `ChatHeader` — шапка с кнопкой назад
- `ChatInputBar` — поле ввода + микрофон
- `ChatMessageAssistant` / `ChatMessageUser` — сообщения
- `ReferencedCards` — карточки-ссылки из AI-ответа
- `EmptyState` — начальный экран
- `TypingIndicator` — индикатор печати

**Связи:**
- Карточки в ответе AI → `/card/[id]`
- Быстрый доступ через FAB-кнопку `AIAssistantFAB`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/vacancy` — Вакансия
**Файл:** `app/vacancy/page.tsx`  
**Связи:**
- Ссылка из `/profile` (sidebar + mobile hero)

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/promo/[id]` — Промо-страница
**Файл:** `app/promo/[id]/page.tsx`

> **Что исправить / улучшить здесь:**
> - [ ] ...

---

### `/preview/*` — Превью дизайна (dev-only)
- `/preview/airbnb` — `app/preview/airbnb/page.tsx`
- `/preview/compass` — `app/preview/compass/page.tsx`
- `/preview/linear` — `app/preview/linear/page.tsx`

> Эти страницы только для разработки, в прод не показывать.

---

## Глобальные компоненты

| Компонент | Где используется | Описание |
|-----------|-----------------|----------|
| `AIAssistantFAB` | `layout.tsx` — везде | Плавающая кнопка чата, открывает `/chat` |
| `AuthChecker` | `layout.tsx` — везде | Проверяет сессию при загрузке |
| `ToastProvider` | `layout.tsx` — везде | Глобальные уведомления |
| `FiltersModal` | через CustomEvent | Модал расширенных фильтров |
| `CallRequestModal` | `/card/[id]` | Форма заявки на звонок |
| `DeleteAccountModal` | `/profile` | Подтверждение удаления аккаунта |
| `NotificationBell` | `Header` | Выпадающий список уведомлений |
| `SupportTooltip` | `Header`, `Footer` | Тултип с контактами поддержки |
| `CityPicker` | `Header` | Выбор города (фильтрует каталог) |

---

## API-маршруты (axios)

| Действие | Метод | Endpoint |
|----------|-------|----------|
| Получить карточки | GET | `/cards/` |
| Поиск карточек | GET | `/cards/search/?q=...` |
| Карточка по ID | GET | `/cards/{id}/` |
| История просмотров | GET | `/cards/viewed/` |
| Избранное — список | GET | `/favorites/` |
| Избранное — добавить | POST | `/favorites/` |
| Избранное — удалить | DELETE | `/favorites/{id}/` |
| Застройщики | GET | `/developers/` |
| Застройщик по ID | GET | `/developers/{id}/` |
| Авторизация (вход) | POST | `/auth/login/` |
| Регистрация | POST | `/auth/register/` |
| Профиль (обновить фото) | PATCH | `/users/profile-photo/` |
| Заявка на звонок | POST | `/requests/` |
| Уведомления настройки | GET/POST | `/notifications/settings/` |

---

## Схема переходов (упрощённо)

```
/ (Главная)
├── /card/[id]         ← карточка объекта
│   ├── /card/[другой] ← похожие объекты
│   └── /developers/[id]
├── /map               ← карта
│   └── /card/[id]
├── /developers        ← все ЖК
│   └── /developers/[id]
│       └── /card/[id]
├── /favorite          ← избранное
│   └── /card/[id]
├── /sale              ← акции
├── /chat              ← AI-ассистент
│   └── /card/[id]
├── /profile           ← профиль (🔒)
│   ├── /card/[id]    ← из истории просмотров
│   └── /vacancy
├── /login
│   ├── /register
│   └── /forgot-password
└── /ref/[code]        → /register
```

---

## Приоритеты улучшений

> Заполни по мере аудита

### Высокий приоритет
- [ ] ...

### Средний приоритет
- [ ] ...

### Низкий приоритет
- [ ] ...
