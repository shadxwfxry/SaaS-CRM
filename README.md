# 📦 W-CRM — Warehouse SaaS CRM

<p align="center">
  <strong>Мультитенантная складская CRM-система корпоративного уровня</strong><br>
  Управление складами · Учёт товаров · Отправления · Аналитика
</p>

---

## 🌐 Языки / Languages

- [🇷🇺 Русский](#-начало-работы)
- [🇬🇧 English](#-getting-started)

---

## 📋 Оглавление

- [О проекте](#-о-проекте)
- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Начало работы](#-начало-работы)
- [Структура проекта](#-структура-проекта)
- [API документация](#-api-документация)
- [Безопасность](#-безопасность)
- [Конфигурация](#-конфигурация)
- [Переход в Production](#-переход-в-production)

---

## 🎯 О проекте

**W-CRM** — это готовая к работе SaaS-платформа для складского учёта с поддержкой **мультитенантности** (изоляции данных между компаниями). Каждая зарегистрированная компания получает изолированное рабочее пространство с собственными товарами, складами, категориями и отправлениями.

Система построена с акцентом на **безопасность**, **целостность данных** и **масштабируемость**.

---

## ✨ Возможности

### Для пользователей
| Модуль | Описание |
|---|---|
| 🏠 **Дашборд** | Аналитика: выручка, топ товаров, статистика отправлений |
| 📂 **Категории** | Создание и управление категориями товаров |
| 📦 **Номенклатура** | Каталог товаров с артикулами (SKU), ценами, привязкой к складам |
| 🏭 **Склады** | Управление складскими помещениями и адресами |
| 🔄 **Движения** | Приход (IN), расход (OUT), трансфер между складами (TRANSFER) |
| 🚚 **Отправления** | Оформление доставок с трек-номерами, статусами и автосписанием со склада |
| 🌍 **Мультиязычность** | Переключение интерфейса между RU / UA / EN |

### Архитектура безопасности
- 🔒 **HttpOnly Cookies** — токены недоступны из JavaScript (защита от XSS)
- 🛡 **IDOR Protection** — все запросы фильтруются по `company_id` текущего пользователя
- ⏱ **Rate Limiting** — ограничение частоты запросов (slowapi)
- 🔐 **Enumeration Protection** — невозможно узнать, существует ли email в системе
- ⚛️ **Атомарные транзакции** — гарантия целостности данных при создании сложных объектов
- 🔄 **Deadlock Prevention** — упорядоченная блокировка при трансферах между складами
- 📜 **Audit Trail** — каждое изменение остатков фиксируется в таблице `movements`
- 🗑 **Soft Delete** — удалённые данные архивируются, а не стираются

---

## 🛠 Технологический стек

### Backend
| Технология | Назначение |
|---|---|
| **FastAPI** | Веб-фреймворк (Python, async) |
| **SQLAlchemy 2.0** | ORM (асинхронный режим) |
| **SQLite / PostgreSQL** | База данных (SQLite для разработки) |
| **Alembic** | Миграции базы данных |
| **Pydantic v2** | Валидация данных |
| **Passlib + bcrypt** | Хэширование паролей |
| **python-jose** | JWT-токены |
| **slowapi** | Rate Limiting |

### Frontend
| Технология | Назначение |
|---|---|
| **React 18** | UI-фреймворк |
| **TypeScript** | Типизация |
| **Vite** | Сборщик |
| **Tailwind CSS** | Стилизация |
| **React Query** | Кэширование серверного состояния |
| **React Router** | Маршрутизация |
| **Lucide React** | Иконки |

---

## 🚀 Начало работы

### Предварительные требования
- **Python 3.12+**
- **Node.js 18+** и npm
- **Git**

### 1. Клонирование репозитория
```bash
git clone https://github.com/shadxwfxry/SaaS-CRM.git
cd SaaS-CRM
```

### 2. Настройка Backend

```bash
# Создайте виртуальное окружение
python -m venv venv

# Активируйте его
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Установите зависимости
pip install -r requirements.txt
```

### 3. Настройка окружения (.env)

Создайте файл `.env` в корне проекта (или отредактируйте существующий):

```env
# Для локальной разработки с SQLite
USE_SQLITE=true

# PostgreSQL (для Production, заполните при необходимости)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=saas_crm

# Безопасность (ОБЯЗАТЕЛЬНО замените ключ для Production!)
JWT_SECRET_KEY=ваш-длинный-случайный-секретный-ключ
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> ⚠️ **Важно:** Для генерации надёжного `JWT_SECRET_KEY` выполните:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### 4. Инициализация базы данных

```bash
alembic upgrade head
```

### 5. Настройка Frontend

```bash
cd frontend
npm install
cd ..
```

### 6. Запуск проекта

#### Вариант А: Быстрый запуск (Windows)
Просто запустите файл **`start.bat`** — он откроет оба сервера автоматически.

#### Вариант Б: Ручной запуск

**Терминал 1 — Backend:**
```bash
uvicorn app.main:app --reload --port 8000
```

**Терминал 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Откройте в браузере

| Сервис | URL |
|---|---|
| 🖥 **CRM-интерфейс** | http://localhost:5173 |
| 📖 **Swagger API Docs** | http://localhost:8000/docs |

### 8. Первый вход

1. Перейдите на страницу **Регистрации** (`/register`)
2. Укажите название компании, email и пароль
3. Войдите в систему — вы попадёте в **Дашборд**
4. Начните создавать **Категории → Склады → Товары → Отправления**

---

## 📁 Структура проекта

```
SaaS-CRM/
├── app/                          # Backend (FastAPI)
│   ├── api/v1/                   # API роутеры
│   │   ├── auth.py               #   Регистрация, вход, восстановление пароля
│   │   ├── categories.py         #   CRUD категорий
│   │   ├── products.py           #   CRUD товаров + начальные остатки
│   │   ├── warehouses.py         #   CRUD складов
│   │   ├── movements.py          #   Движения товаров (IN/OUT/TRANSFER)
│   │   ├── shipments.py          #   Отправления (создание, статусы)
│   │   └── dashboard.py          #   Аналитика
│   ├── core/                     # Ядро приложения
│   │   ├── config.py             #   Настройки из .env
│   │   ├── database.py           #   Подключение к БД
│   │   ├── security.py           #   JWT, хэширование, авторизация
│   │   └── limiter.py            #   Rate Limiting
│   ├── models/                   # ORM-модели (SQLAlchemy)
│   │   ├── user.py               #   User, Role, PasswordResetToken
│   │   ├── company.py            #   Company
│   │   ├── product.py            #   Product, Category
│   │   ├── warehouse.py          #   Warehouse
│   │   ├── inventory.py          #   Inventory, Movement
│   │   └── shipment.py           #   Shipment
│   ├── schemas/                  # Pydantic-схемы (валидация)
│   └── main.py                   # Точка входа FastAPI
├── frontend/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                #   Страницы (Dashboard, Products, Login...)
│   │   ├── components/           #   Переиспользуемые компоненты
│   │   ├── context/              #   AuthContext (состояние авторизации)
│   │   ├── api/                  #   Axios client
│   │   ├── i18n.ts               #   Мультиязычность (RU/UA/EN)
│   │   └── App.tsx               #   Маршрутизация
│   └── vite.config.ts            #   Конфигурация Vite + прокси
├── migrations/                   # Alembic-миграции
├── .env                          # Переменные окружения
├── requirements.txt              # Python-зависимости
├── start.bat                     # Быстрый запуск (Windows)
└── README.md                     # ← Вы здесь
```

---

## 📖 API Документация

После запуска бэкенда, полная интерактивная документация доступна по адресу:
**http://localhost:8000/docs** (Swagger UI)

### Основные эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Регистрация компании и пользователя |
| `POST` | `/api/v1/auth/login` | Авторизация (OAuth2, form-data) |
| `GET` | `/api/v1/auth/me` | Текущий пользователь |
| `POST` | `/api/v1/auth/password-reset-request` | Запрос на сброс пароля |
| `POST` | `/api/v1/auth/password-reset-confirm` | Подтверждение нового пароля |
| | | |
| `GET/POST` | `/api/v1/categories/` | Список / Создание категорий |
| `PUT/DELETE` | `/api/v1/categories/{id}` | Обновление / Архивирование |
| | | |
| `GET/POST` | `/api/v1/products/` | Список / Создание товаров |
| `PUT/DELETE` | `/api/v1/products/{id}` | Обновление / Архивирование |
| | | |
| `GET/POST` | `/api/v1/warehouses/` | Список / Создание складов |
| `PUT/DELETE` | `/api/v1/warehouses/{id}` | Обновление / Архивирование |
| | | |
| `GET/POST` | `/api/v1/movements/` | Список / Создание движений |
| `DELETE` | `/api/v1/movements/{id}` | Откат движения (с компенсацией) |
| | | |
| `GET/POST` | `/api/v1/shipments/` | Список / Создание отправлений |
| `PATCH` | `/api/v1/shipments/{id}/status` | Смена статуса (SHIPPED → DELIVERED / RETURNED) |
| | | |
| `GET` | `/api/v1/dashboard/stats` | Статистика для дашборда |

---

## 🔒 Безопасность

### Аутентификация
Система использует **JWT-токены**, которые хранятся в **HttpOnly-куках**. Это означает:
- Токен автоматически отправляется с каждым запросом (через cookie)
- JavaScript **не имеет доступа** к токену (защита от XSS)
- Swagger UI по-прежнему работает через заголовок `Authorization`

### Восстановление пароля
Пока SMTP не настроен, ссылка для сброса пароля выводится в **консоль бэкенда**:
```
[EMAIL MOCK] To: user@example.com
[EMAIL MOCK] Link: http://localhost:5173/reset-password?token=...
```
Скопируйте ссылку в браузер, чтобы задать новый пароль.

### Изоляция данных (Multi-tenancy)
Каждый запрос к API фильтруется по `company_id` текущего пользователя. Невозможно получить доступ к данным другой компании, даже зная её `id`.

---

## ⚙️ Конфигурация

### Переменные окружения (.env)

| Переменная | Описание | По умолчанию |
|---|---|---|
| `USE_SQLITE` | Использовать SQLite вместо PostgreSQL | `true` |
| `JWT_SECRET_KEY` | Секретный ключ для подписи токенов | *обязательно* |
| `JWT_ALGORITHM` | Алгоритм подписи | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Время жизни токена (минуты) | `60` |
| `FRONTEND_CORS_ORIGINS` | Разрешённые источники (CORS) | `http://localhost:5173,...` |
| `POSTGRES_*` | Параметры PostgreSQL (при `USE_SQLITE=false`) | — |

---

## 🏭 Переход в Production

При переносе проекта в «боевой» режим, необходимо выполнить следующие шаги:

1. **Сменить базу данных** — установите `USE_SQLITE=false` и заполните `POSTGRES_*` в `.env`
2. **Обновить `JWT_SECRET_KEY`** — сгенерируйте новый случайный ключ
3. **Включить Secure Cookie** — в файле `app/api/v1/auth.py` измените `secure=False` на `secure=True`
4. **Настроить SMTP** — замените `[EMAIL MOCK]` в `auth.py` на реальную отправку через SendGrid, Mailgun и т.д.
5. **Обновить CORS** — укажите точный домен вашего фронтенда вместо `localhost`
6. **Запустить через Gunicorn** — `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

---

## 🇬🇧 Getting Started

**W-CRM** is a multi-tenant warehouse CRM SaaS platform built with FastAPI and React.

### Quick Start

```bash
# Clone
git clone https://github.com/shadxwfxry/SaaS-CRM.git && cd SaaS-CRM

# Backend
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173**, register a company and start working.

### Key Features
- **Multi-tenant isolation** — each company has its own data space
- **HttpOnly JWT cookies** — XSS-proof authentication
- **Inventory tracking** — IN/OUT/TRANSFER with atomic transactions
- **Shipment management** — with auto-deduction and status workflow
- **Password recovery** — token-based reset flow
- **i18n** — Russian, Ukrainian, English

### API Docs
Available at **http://localhost:8000/docs** (Swagger UI) after starting the backend.

---

## 📄 Лицензия / License

MIT — свободно используйте, изменяйте и распространяйте.
