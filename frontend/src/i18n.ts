import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      nav: { dashboard: "Дашборд", products: "Номенклатура", warehouses: "Склады", movements: "Движения", categories: "Категории", shipments: "Отправления" },
      header: { welcome: "Добро пожаловать в панель управления", mvp: "MVP Версия 1.0" },
      common: { edit: "Редактировать", delete: "Удалить", actions: "Действия", confirm_delete: "Вы уверены, что хотите удалить?" },
      dashboard: {
        title: "SaaS Warehouse CRM",
        status: "Статус бэкенда: ",
        loading: "Загрузка...",
        offline: "Бэкенд недоступен",
        online: "Бэкенд работает!",
        stats: { products: "Всего товаров", warehouses: "Всего складов", movements: "Всего проводок", stock: "Остатки на складах", qty: "шт" }
      },
      categories: {
        title: "Категории товаров", add: "+ Создать категорию", cancel: "✖ Отмена",
        form: { title: "Форма категории", name: "Название категории *", save: "💾 Сохранить", saving: "Сохранение...", error: "Ошибка (возможно, такое имя уже есть)" },
        table: { name: "Название", empty: "Нет категорий", loading: "Ошибка загрузки" }
      },
      shipments: {
        title: "Отправления (Доставки)", add: "+ Отправить товар", cancel: "✖ Отмена",
        form: { 
          title: "Создание отправления", name: "ФИО Получателя *", address: "Адрес клиента *", method: "Служба доставки *",
          product: "Товар *", qty: "Кол-во *", warehouse: "Откуда списать (Опционально)",
          payment: "Способ оплаты *", payment_card: "Карта при получении", payment_cash: "Наличка при получении", payment_prepaid: "Предоплата онлайн", payment_bank: "По реквизитам",
          order_number: "Номер заказа (Опционально)",
          save: "🚀 Отправить", saving: "Отправка...", error: "Ошибка отправки (Возможно, на складах не хватает товара)"
        },
        table: { date: "Дата", recipient: "Получатель", address: "Адрес", method: "Способ", status: "Статус", product: "Товар", qty: "Кол-во", empty: "Нет отправлений", loading: "Ошибка загрузки" }
      },
      warehouses: {
        title: "Склады", add: "+ Добавить склад", cancel: "✖ Отмена",
        form: { title: "Форма склада", name: "Название *", address: "Адрес", save: "💾 Сохранить", saving: "Сохранение...", error: "Ошибка" },
        table: { name: "Название", address: "Адрес", status: "Статус", active: "Активен", inactive: "Неактивен", empty: "Нет складов", loading: "Ошибка загрузки" }
      },
      products: {
        title: "Номенклатура", add: "+ Создать товар", cancel: "✖ Отмена",
        form: { 
          title: "Форма товара", sku: "Артикул / SKU *", name: "Наименование *", price: "Базовая цена *", 
          warehouse: "Начальный склад (опционально)", initial_qty: "Начальный остаток",
          category: "Категория", select_category: "Выберите категорию...",
          save: "💾 Сохранить", saving: "Сохранение...", error: "Ошибка" 
        },
        table: { sku: "Артикул", name: "Наименование", price: "Цена", category: "Категория", empty: "Нет товаров", loading: "Ошибка загрузки" }
      },
      movements: {
        title: "Журнал движений", add: "+ Сделать проводку", cancel: "✖ Отмена",
        form: {
          title: "Форма проводки", type: "Тип операции *", product: "Товар *", qty: "Количество *",
          type_in: "Приход", type_out: "Списание", type_transfer: "Трансфер",
          from: "Со склада *", to: "На склад *",
          select_product: "Выберите товар...", select_warehouse: "Выберите склад...",
          save: "✅ Провести", saving: "Проведение...", error: "Ошибка проводки (недостаточно товара)"
        },
        table: { date: "Дата", type: "Тип", qty: "Кол-во", in: "Приход", out: "Списание", transfer: "Трансфер", empty: "Нет проводок", loading: "Ошибка загрузки" }
      }
    }
  },
  uk: {
    translation: {
      nav: { dashboard: "Дашборд", products: "Номенклатура", warehouses: "Склади", movements: "Рух товарів", categories: "Категорії", shipments: "Відправлення" },
      header: { welcome: "Ласкаво просимо", mvp: "MVP Версія 1.0" },
      common: { edit: "Редагувати", delete: "Видалити", actions: "Дії", confirm_delete: "Ви впевнені, що хочете видалити?" },
      dashboard: {
        title: "SaaS Warehouse CRM",
        status: "Статус бекенду: ",
        loading: "Завантаження...",
        offline: "Бекенд недоступний",
        online: "Бекенд працює!",
        stats: { products: "Всього товарів", warehouses: "Всього складів", movements: "Всього проводок", stock: "Залишки на складах", qty: "шт" }
      },
      categories: {
        title: "Категорії товарів", add: "+ Створити категорію", cancel: "✖ Скасувати",
        form: { title: "Форма категорії", name: "Назва категорії *", save: "💾 Зберегти", saving: "Збереження...", error: "Помилка (вже існує)" },
        table: { name: "Назва", empty: "Немає категорій", loading: "Помилка завантаження" }
      },
      shipments: {
        title: "Відправлення (Доставки)", add: "+ Відправити товар", cancel: "✖ Скасувати",
        form: { 
          title: "Створення відправлення", name: "ПІБ Одержувача *", address: "Адреса клієнта *", method: "Служба доставки *",
          product: "Товар *", qty: "Кіл-ть *", warehouse: "Зі складу (Опціонально)",
          payment: "Спосіб оплати *", payment_card: "Картка при отриманні", payment_cash: "Готівка при отриманні", payment_prepaid: "Передплата", payment_bank: "За реквізитами",
          order_number: "Номер замовлення (Опціонально)",
          save: "🚀 Відправити", saving: "Відправка...", error: "Помилка відправки (Недостатньо товару на складах)"
        },
        table: { date: "Дата", recipient: "Одержувач", address: "Адреса", method: "Спосіб", status: "Статус", product: "Товар", qty: "Кіл-ть", empty: "Немає відправлень", loading: "Помилка завантаження" }
      },
      warehouses: {
        title: "Склади", add: "+ Додати склад", cancel: "✖ Скасувати",
        form: { title: "Форма складу", name: "Назва *", address: "Адреса", save: "💾 Зберегти", saving: "Збереження...", error: "Помилка" },
        table: { name: "Назва", address: "Адреса", status: "Статус", active: "Активний", inactive: "Неактивний", empty: "Немає складів", loading: "Помилка завантаження" }
      },
      products: {
        title: "Номенклатура", add: "+ Створити товар", cancel: "✖ Скасувати",
        form: { 
          title: "Форма товару", sku: "Артикул / SKU *", name: "Найменування *", price: "Ціна *", 
          warehouse: "Початковий склад", initial_qty: "Початковий залишок",
          category: "Категорія", select_category: "Оберіть категорію...",
          save: "💾 Зберегти", saving: "Збереження...", error: "Помилка" 
        },
        table: { sku: "Артикул", name: "Найменування", price: "Ціна", category: "Категорія", empty: "Немає товарів", loading: "Помилка завантаження" }
      },
      movements: {
        title: "Журнал рухів", add: "+ Зробити проводку", cancel: "✖ Скасувати",
        form: {
          title: "Форма проводки", type: "Тип операції *", product: "Товар *", qty: "Кількість *",
          type_in: "Надходження", type_out: "Списання", type_transfer: "Трансфер",
          from: "Зі складу *", to: "На склад *",
          select_product: "Оберіть товар...", select_warehouse: "Оберіть склад...",
          save: "✅ Провести", saving: "Проведення...", error: "Помилка (недостатньо товару)"
        },
        table: { date: "Дата", type: "Тип", qty: "Кількість", in: "Надходження", out: "Списання", transfer: "Трансфер", empty: "Немає проводок", loading: "Помилка завантаження" }
      }
    }
  },
  en: {
    translation: {
      nav: { dashboard: "Dashboard", products: "Products", warehouses: "Warehouses", movements: "Movements", categories: "Categories", shipments: "Shipments" },
      header: { welcome: "Welcome", mvp: "MVP Version 1.0" },
      common: { edit: "Edit", delete: "Delete", actions: "Actions", confirm_delete: "Are you sure you want to delete?" },
      dashboard: {
        title: "SaaS Warehouse CRM",
        status: "Backend Status: ",
        loading: "Loading...",
        offline: "Backend is offline",
        online: "Backend is running!",
        stats: { products: "Total Products", warehouses: "Total Warehouses", movements: "Total Transactions", stock: "Warehouse Inventory", qty: "pcs" }
      },
      categories: {
        title: "Product Categories", add: "+ Create Category", cancel: "✖ Cancel",
        form: { title: "Category Form", name: "Category Name *", save: "💾 Save", saving: "Saving...", error: "Error (might already exist)" },
        table: { name: "Name", empty: "No categories", loading: "Error loading" }
      },
      shipments: {
        title: "Shipments (Deliveries)", add: "+ Ship Product", cancel: "✖ Cancel",
        form: { 
          title: "Create Shipment", name: "Recipient Name *", address: "Recipient Address *", method: "Delivery Method *",
          product: "Product *", qty: "Qty *", warehouse: "From Warehouse (Optional)",
          payment: "Payment Method *", payment_card: "Card on Delivery", payment_cash: "Cash on Delivery", payment_prepaid: "Prepaid", payment_bank: "Bank Transfer",
          order_number: "Order Number (Optional)",
          save: "🚀 Ship", saving: "Shipping...", error: "Error (Insufficient stock across all warehouses)"
        },
        table: { date: "Date", recipient: "Recipient", address: "Address", method: "Method", status: "Status", product: "Product", qty: "Qty", empty: "No shipments", loading: "Error loading" }
      },
      warehouses: {
        title: "Warehouses", add: "+ Add Warehouse", cancel: "✖ Cancel",
        form: { title: "Warehouse Form", name: "Name *", address: "Address", save: "💾 Save", saving: "Saving...", error: "Error" },
        table: { name: "Name", address: "Address", status: "Status", active: "Active", inactive: "Inactive", empty: "No warehouses", loading: "Error loading" }
      },
      products: {
        title: "Products", add: "+ Create Product", cancel: "✖ Cancel",
        form: { 
          title: "Product Form", sku: "SKU *", name: "Name *", price: "Price *", 
          warehouse: "Initial Warehouse", initial_qty: "Initial Quantity",
          category: "Category", select_category: "Select category...",
          save: "💾 Save", saving: "Saving...", error: "Error" 
        },
        table: { sku: "SKU", name: "Name", price: "Price", category: "Category", empty: "No products", loading: "Error loading" }
      },
      movements: {
        title: "Movements Journal", add: "+ Make Transaction", cancel: "✖ Cancel",
        form: {
          title: "Transaction form", type: "Type *", product: "Product *", qty: "Quantity *",
          type_in: "IN", type_out: "OUT", type_transfer: "TRANSFER",
          from: "From Warehouse *", to: "To Warehouse *",
          select_product: "Select product...", select_warehouse: "Select warehouse...",
          save: "✅ Execute", saving: "Executing...", error: "Error (Insufficient stock)"
        },
        table: { date: "Date", type: "Type", qty: "Quantity", in: "IN", out: "OUT", transfer: "TRANSFER", empty: "No transactions", loading: "Error loading" }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ru",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export const formatCurrency = (value: number, lng: string) => {
  const currencyMap: Record<string, string> = { ru: 'RUB', uk: 'UAH', en: 'USD' };
  const localesMap: Record<string, string> = { ru: 'ru-RU', uk: 'uk-UA', en: 'en-US' };
  return new Intl.NumberFormat(localesMap[lng] || 'en-US', {
    style: 'currency',
    currency: currencyMap[lng] || 'USD',
    minimumFractionDigits: 0
  }).format(value);
};

export default i18n;
