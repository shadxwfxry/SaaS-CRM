# Warehouse SaaS CRM 📦

🌐 **Choose your language / Выберите язык / Оберіть мову:**
- [🇷🇺 Русский](#-русский)
- [🇬🇧 English](#-english)
- [🇺🇦 Українська](#-українська)

---

## 🇷🇺 Русский

## 🚀 Особенности
- **Мультиязычность**: Встроенная поддержка переводов (i18n) интерфейса "на лету" (включая Русский, Украинский и Английский).
- **Складской контроль**: Переводы между складами, поступления, инвентаризация и автоматический мониторинг наличия.
- **Отправления**: Оформление отгрузок клиенту. При изменении статуса товары интеллектуально отслеживаются (автосписание).
- **Продвинутый дашборд**: Аналитическая визуализация сделок, выручки и хитов продаж для маркетологов.
- **Современный UI**: Премиальный, масштабируемый интерфейс, готовый для продуктовых B2B внедрений.

## 🛠 Технологический стек
### Backend (Серверная часть)
- **Фреймворк**: FastAPI (Python)
- **База данных**: SQLite + SQLAlchemy (Async)
- **Миграции**: Alembic

### Frontend (Клиентская часть)
- **Инструментарий**: React, Vite, TypeScript
- **Стилизация**: Tailwind CSS
- **Состояние**: React Query + Zustand
- **Маршрутизация**: React Router

---

## 💻 Как запустить проект локально

### 1. Запуск Backend
Откройте терминал в корневой папке проекта и выполните:
```bash
# Активируйте виртуальное окружение (для Windows)
.\venv\Scripts\Activate.ps1
# (для Mac/Linux): source venv/bin/activate

# Запустите сервер (должен работать на порту 8000)
uvicorn app.main:app --reload --port 8000
```
Swagger UI (документация API) будет доступна по адресу: http://localhost:8000/docs

### 2. Запуск Frontend
Откройте **второй терминал**, перейдите в папку фронтенда и запустите сборщик:
```bash
cd frontend
npm install
npm run dev
```
Интерфейс CRM откроется по адресу `http://localhost:5173` (или `5174`).

---

## 🏗 Архитектура каталогов и как это изменять
Если вы хотите доработать проект, вот основная структура:
- `/app/api/v1/` — Здесь находятся роутеры FastAPI (логика запросов). Для добавления новых endpoints создавайте файлы здесь.
- `/app/models/` — ORM Модели таблиц Базы Данных.
- `/app/schemas/` — Pydantic схемы для валидации входящих/исходящих данных.
- `/frontend/src/pages/` — React-компоненты экранов (Дашборд, Отправления, Склады).
- `/frontend/src/components/` — Переиспользуемые элементы интерфейса.
- `/frontend/src/i18n.ts` — Файл конфигурации языков и переводов.

Если вы меняете таблицы в `models`, не забудьте создать миграцию Alembic:
`alembic revision --autogenerate -m "ваше описание"`
`alembic upgrade head`

## 💡 Будущее развитие
Этот проект является каркасом. В него можно легко интегрировать:
- JWT-авторизацию (разделение по аккаунтам/компаниям).
- Отправку Email-накладных при формировании `Shipment`.

---

## 🇬🇧 English

Welcome to **Warehouse SaaS CRM** — a powerful and easy-to-use solution for warehouse management, inventory, and sales. Built with a modern technology stack, it solves business problems extremely quickly.

### 🚀 Features
- **Multi-language**: Built-in translation support (i18n).
- **Inventory Control**: Warehouse management, incoming tracking, transfers.
- **Shipments**: Track packages, payment methods, order numbers, and automatic inventory rollback upon "RETURNED" status.
- **Advanced Dashboard**: Live preview of completed transactions (DELIVERED) logic calculating real-time revenue and Bestsellers.

### 🛠 Tech Stack
- **Backend**: FastAPI (Python), SQLite, SQLAlchemy, Alembic
- **Frontend**: React, Vite, Tailwind CSS, TypeScript, React Query

### 💻 How to run locally

#### 1. Start the Backend
Open a terminal in the root folder and run:
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1   # Windows
# source venv/bin/activate    # Mac/Linux

# Start server
uvicorn app.main:app --reload --port 8000
```

#### 2. Start the Frontend
Open a **second terminal**, go to the frontend folder, and run:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🇺🇦 Українська

Ласкаво просимо до **Warehouse SaaS CRM** — потужного рішення для керування складами, обліку товарів та оптимізації відправлень користувачам. Цей продукт можна використовувати як основу для великої комерційної CRM для бізнесу.

### 🚀 Головні можливості
- **Мультимовність**: Зручна зміна мови (i18n).
- **Складський облік**: Переміщення між складами, швидкий підрахунок залишків.
- **Відправлення**: Оформлення доставок. Під час зміни статусу на "Повернено", всі товари автоматично повертаються на склад. Підтримка номерів замовлень та способів оплати.
- **Дашборд**: Статистика найпопулярніших товарів на основі виконаних замовлень (статус "Завершено") та підрахунок чистого прибутку.

### 🛠 Технологічний стек
- **Серверна частина**: FastAPI (Python), SQLite (база даних), SQLAlchemy
- **Клієнтська частина**: React, Vite, Tailwind CSS, TypeScript

### 💻 Запуск проекту
Відкрийте перший термінал для бекенду:
```bash
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

Відкрийте другий термінал для фронтенду:
```bash
cd frontend
npm install
npm run dev
```
