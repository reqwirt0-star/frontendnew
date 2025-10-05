"use strict";
const API_BASE_URL = 'https://backendchater.fly.dev';
let userRole = null;
let appContent = {};
let userName = null;
let userFavorites = [];
const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

const uiTexts = {
    ru: {
        lang_locale: 'ru',
        loginHeader: 'ChaterLab', 
        loginSubheader: 'Панель быстрых ответов', 
        loginUsername: 'Логин', 
        loginPassword: 'Пароль', 
        loginBtn: 'Войти',
        searchPlaceholder: '🔎 Поиск по шаблонам...',
        favoritesTitle: '⭐ Избранное',
        darkMode: 'Тёмная тема',
        logout: 'Выйти',
        navInstructions: 'Инструкция',
        navAnalytics: 'Аналитика',
        navEditor: 'Редактор',
        mobileAdminTitle: 'Админ-панель',
        editorUnavailable: 'Редактор',
        editorUnavailableMsg: 'Полноценное редактирование доступно только в версии сайта для ПК.',
        tabLayout: 'Конструктор кнопок',
        tabInstructions: 'Инструкция',
        tabManagers: 'Менеджеры',
        tabUsers: 'Пользователи',
        addUserTitle: 'Добавить нового пользователя',
        newUserUsername: 'Логин',
        newUserPassword: 'Пароль',
        roleEmployee: 'Сотрудник',
        roleManager: 'Менеджер',
        addUserBtn: 'Создать',
        existingUsersTitle: 'Существующие пользователи',
        deleteUserBtn: 'Удалить',
        deleteUserConfirm: 'Вы уверены, что хотите удалить пользователя {username}?',
        addManager: '+ Добавить менеджера',
        managerNamePlaceholder: 'Имя менеджера (для списка)',
        managerTelegramPlaceholder: 'Telegram контакт (@username)',
        managerWhatsappPlaceholder: 'WhatsApp контакт (+7123456)',
        deleteManagerTitle: 'Удалить менеджера',
        managerAssignmentTitle: 'Доступные менеджеры для этой кнопки',
        isContactButtonLabel: 'Сделать кнопкой "Контакт"',
        saveAll: 'Сохранить всё',
        cancel: 'Отмена',
        addSection: '+ Добавить новый раздел',
        addButton: '+ Добавить кнопку в раздел',
        addVariant: '+ Добавить вариант',
        sectionTitle: 'Название раздела',
        buttonLabel: 'Название кнопки',
        deleteSectionConfirm: 'Удалить этот раздел со всеми кнопками?',
        deleteButtonTitle: 'Удалить раздел',
        deleteButtonEntryTitle: 'Удалить кнопку',
        deleteVariantTitle: 'Удалить вариант',
        instructionTitleRu: 'Инструкция (RU)',
        instructionTitleEn: 'Инструкция (EN)',
        instructionTitleUk: 'Инструкция (UA)',
        analyticsTitle: 'Аналитика',
        periodDay: 'День',
        periodWeek: 'Неделя',
        periodMonth: 'Месяц',
        employeeListTitle: 'Общая статистика',
        overallSummaryHeader: 'Общая статистика',
        overallSummarySubheader: 'Сводный отчет по активности всей команды.',
        kpiTotalClicks: 'Всего действий',
        kpiMostActive: 'Самый активный',
        kpiTopTemplate: 'Топ шаблон',
        kpiPeakTime: 'Пик активности (UTC)',
        top5Employees: 'Топ-5 Сотрудников',
        top5Templates: 'Топ-5 Шаблонов',
        tableEmployee: 'Сотрудник',
        tableActions: 'Действий',
        tableTemplate: 'Шаблон',
        tableUses: 'Использований',
        userDetailHeader: 'Статистика:',
        userDetailSubheader: 'Детальный отчет по активности выбранного сотрудника.',
        kpiLastActivity: 'Последняя активность',
        kpiFavTemplate: 'Любимый шаблон',
        activityFeedTitle: 'Лента активности (последние 100 действий)',
        tableTime: 'Время',
        tableSection: 'Раздел',
        noData: 'Нет данных за этот период.',
        loading: 'Загрузка...',
        modalTitle: 'Создание контакта',
        modalChannelTitle: '1. Выберите канал связи',
        modalManagerTitle: '2. Выберите менеджера',
        modalCancel: 'Отмена',
        modalConfirm: 'Сгенерировать и скопировать',
        modalError: 'Пожалуйста, выберите канал и менеджера.',
        username_and_password_required: 'Необходимо указать имя пользователя и пароль.',
        invalid_credentials: 'Неверные данные.',
        server_error: 'Ошибка на сервере.',
        content_not_found: 'Контент не найден.',
        content_read_error: 'Ошибка при чтении контента.',
        invalid_token: 'Неверный токен.',
        access_denied: 'Доступ запрещен.',
        content_updated_successfully: 'Контент успешно обновлен!',
        server_error_on_save: 'Ошибка на сервере при сохранении.',
        user_not_found: 'Пользователь не найден.',
        invalid_data_format: 'Неверный формат данных.',
        favorites_updated: 'Избранное обновлено.',
        button_id_not_specified: 'Не указан ID кнопки.',
        click_tracking_error: 'Ошибка при записи клика.',
        analytics_db_error: 'Ошибка при получении аналитики из БД.',
        analytics_server_error: 'Ошибка на сервере при получении аналитики.',
        analytics_load_error: 'Ошибка загрузки статистики',
        no_templates_for_button: 'Нет шаблонов для этой кнопки',
        copy_success: 'Скопировано ({current}/{total})',
        copy_success_generic: 'Текст успешно скопирован!',
        favorites_load_error: 'Не удалось загрузить избранное',
        favorites_save_error: 'Ошибка сохранения избранного',
        missing_user_data: 'Необходимо указать имя пользователя и пароль.',
        invalid_role: 'Неверная роль пользователя.',
        user_created_successfully: 'Пользователь успешно создан!',
        user_already_exists: 'Пользователь с таким именем уже существует.',
        server_error_creating_user: 'Ошибка на сервере при создании пользователя.',
        username_not_provided: 'Не указано имя пользователя для удаления.',
        cannot_delete_self: 'Нельзя удалить самого себя.',
        user_deleted_successfully: 'Пользователь успешно удален!',
        server_error_deleting_user: 'Ошибка на сервере при удалении пользователя.',
        server_error_fetching_users: 'Ошибка на сервере при получении списка пользователей.'
    },
    en: {
        lang_locale: 'en',
        loginHeader: 'ChaterLab', 
        loginSubheader: 'Quick Replies Panel', 
        loginUsername: 'Username', 
        loginPassword: 'Password', 
        loginBtn: 'Login',
        searchPlaceholder: '🔎 Search templates...',
        favoritesTitle: '⭐ Favorites',
        darkMode: 'Dark Mode',
        logout: 'Logout',
        navInstructions: 'Instructions',
        navAnalytics: 'Analytics',
        navEditor: 'Editor',
        mobileAdminTitle: 'Admin Panel',
        editorUnavailable: 'Editor',
        editorUnavailableMsg: 'Full editing is only available on the desktop version of the site.',
        tabLayout: 'Button Builder',
        tabInstructions: 'Instructions',
        tabManagers: 'Managers',
        tabUsers: 'Users',
        addUserTitle: 'Add New User',
        newUserUsername: 'Username',
        newUserPassword: 'Password',
        roleEmployee: 'Employee',
        roleManager: 'Manager',
        addUserBtn: 'Create',
        existingUsersTitle: 'Existing Users',
        deleteUserBtn: 'Delete',
        deleteUserConfirm: 'Are you sure you want to delete user {username}?',
        addManager: '+ Add Manager',
        managerNamePlaceholder: 'Manager Name (for the list)',
        managerTelegramPlaceholder: 'Telegram contact (@username)',
        managerWhatsappPlaceholder: 'WhatsApp contact (+123456)',
        deleteManagerTitle: 'Delete Manager',
        managerAssignmentTitle: 'Available Managers for this Button',
        isContactButtonLabel: 'Make "Contact" button',
        saveAll: 'Save All',
        cancel: 'Cancel',
        addSection: '+ Add New Section',
        addButton: '+ Add Button to Section',
        addVariant: '+ Add Variant',
        sectionTitle: 'Section Title',
        buttonLabel: 'Button Label',
        deleteSectionConfirm: 'Delete this section with all buttons?',
        deleteButtonTitle: 'Delete Section',
        deleteButtonEntryTitle: 'Delete Button',
        deleteVariantTitle: 'Delete Variant',
        instructionTitleRu: 'Instructions (RU)',
        instructionTitleEn: 'Instructions (EN)',
        instructionTitleUk: 'Instructions (UA)',
        analyticsTitle: 'Analytics',
        periodDay: 'Day',
        periodWeek: 'Week',
        periodMonth: 'Month',
        employeeListTitle: 'Overall Statistics',
        overallSummaryHeader: 'Overall Statistics',
        overallSummarySubheader: 'Summary report on the activity of the entire team.',
        kpiTotalClicks: 'Total Actions',
        kpiMostActive: 'Most Active',
        kpiTopTemplate: 'Top Template',
        kpiPeakTime: 'Peak Activity (UTC)',
        top5Employees: 'Top 5 Employees',
        top5Templates: 'Top 5 Templates',
        tableEmployee: 'Employee',
        tableActions: 'Actions',
        tableTemplate: 'Template',
        tableUses: 'Uses',
        userDetailHeader: 'Statistics for:',
        userDetailSubheader: 'Detailed activity report for the selected employee.',
        kpiLastActivity: 'Last Activity',
        kpiFavTemplate: 'Favorite Template',
        activityFeedTitle: 'Activity Feed (last 100 actions)',
        tableTime: 'Time',
        tableSection: 'Section',
        noData: 'No data for this period.',
        loading: 'Loading...',
        modalTitle: 'Create Contact',
        modalChannelTitle: '1. Select Channel',
        modalManagerTitle: '2. Select Manager',
        modalCancel: 'Cancel',
        modalConfirm: 'Generate & Copy',
        modalError: 'Please select a channel and a manager.',
        username_and_password_required: 'Username and password are required.',
        invalid_credentials: 'Invalid credentials.',
        server_error: 'Server error.',
        content_not_found: 'Content not found.',
        content_read_error: 'Error reading content.',
        invalid_token: 'Invalid token.',
        access_denied: 'Access denied.',
        content_updated_successfully: 'Content updated successfully!',
        server_error_on_save: 'Server error on save.',
        user_not_found: 'User not found.',
        invalid_data_format: 'Invalid data format.',
        favorites_updated: 'Favorites updated.',
        button_id_not_specified: 'Button ID not specified.',
        click_tracking_error: 'Error tracking click.',
        analytics_db_error: 'Error getting analytics from DB.',
        analytics_server_error: 'Server error while getting analytics.',
        analytics_load_error: 'Error loading statistics',
        no_templates_for_button: 'No templates for this button',
        copy_success: 'Copied ({current}/{total})',
        copy_success_generic: 'Text copied successfully!',
        favorites_load_error: 'Failed to load favorites',
        favorites_save_error: 'Error saving favorites',
        missing_user_data: 'Username and password are required.',
        invalid_role: 'Invalid user role.',
        user_created_successfully: 'User created successfully!',
        user_already_exists: 'A user with this name already exists.',
        server_error_creating_user: 'Server error while creating user.',
        username_not_provided: 'Username for deletion not provided.',
        cannot_delete_self: 'You cannot delete yourself.',
        user_deleted_successfully: 'User deleted successfully!',
        server_error_deleting_user: 'Server error while deleting user.',
        server_error_fetching_users: 'Server error while fetching user list.'
    },
    uk: {
        lang_locale: 'uk',
        loginHeader: 'ChaterLab', 
        loginSubheader: 'Панель швидких відповідей', 
        loginUsername: 'Логін', 
        loginPassword: 'Пароль', 
        loginBtn: 'Увійти',
        searchPlaceholder: '🔎 Пошук по шаблонах...',
        favoritesTitle: '⭐ Обране',
        darkMode: 'Темна тема',
        logout: 'Вийти',
        navInstructions: 'Інструкція',
        navAnalytics: 'Аналітика',
        navEditor: 'Редактор',
        mobileAdminTitle: 'Адмін-панель',
        editorUnavailable: 'Редактор',
        editorUnavailableMsg: 'Повноцінне редагування доступне лише у версії сайту для ПК.',
        tabLayout: 'Конструктор кнопок',
        tabInstructions: 'Інструкція',
        tabManagers: 'Менеджери',
        tabUsers: 'Користувачі',
        addUserTitle: 'Додати нового користувача',
        newUserUsername: 'Логін',
        newUserPassword: 'Пароль',
        roleEmployee: 'Співробітник',
        roleManager: 'Менеджер',
        addUserBtn: 'Створити',
        existingUsersTitle: 'Існуючі користувачі',
        deleteUserBtn: 'Видалити',
        deleteUserConfirm: 'Ви впевнені, що хочете видалити користувача {username}?',
        addManager: '+ Додати менеджера',
        managerNamePlaceholder: 'Ім\'я менеджера (для списку)',
        managerTelegramPlaceholder: 'Telegram контакт (@username)',
        managerWhatsappPlaceholder: 'WhatsApp контакт (+38012345)',
        deleteManagerTitle: 'Видалити менеджера',
        managerAssignmentTitle: 'Доступні менеджери для цієї кнопки',
        isContactButtonLabel: 'Зробити кнопкою "Контакт"',
        saveAll: 'Зберегти все',
        cancel: 'Скасувати',
        addSection: '+ Додати новий розділ',
        addButton: '+ Додати кнопку до розділу',
        addVariant: '+ Додати варіант',
        sectionTitle: 'Назва розділу',
        buttonLabel: 'Назва кнопки',
        deleteSectionConfirm: 'Видалити цей розділ з усіма кнопками?',
        deleteButtonTitle: 'Видалити розділ',
        deleteButtonEntryTitle: 'Видалити кнопку',
        deleteVariantTitle: 'Видалити варіант',
        instructionTitleRu: 'Інструкція (RU)',
        instructionTitleEn: 'Інструкція (EN)',
        instructionTitleUk: 'Інструкція (UA)',
        analyticsTitle: 'Аналітика',
        periodDay: 'День',
        periodWeek: 'Тиждень',
        periodMonth: 'Місяць',
        employeeListTitle: 'Загальна статистика',
        overallSummaryHeader: 'Загальна статистика',
        overallSummarySubheader: 'Зведений звіт про активність всієї команди.',
        kpiTotalClicks: 'Всього дій',
        kpiMostActive: 'Найактивніший',
        kpiTopTemplate: 'Топ шаблон',
        kpiPeakTime: 'Пік активності (UTC)',
        top5Employees: 'Топ-5 Співробітників',
        top5Templates: 'Топ-5 Шаблонів',
        tableEmployee: 'Співробітник',
        tableActions: 'Дій',
        tableTemplate: 'Шаблон',
        tableUses: 'Використань',
        userDetailHeader: 'Статистика:',
        userDetailSubheader: 'Детальний звіт про активність обраного співробітника.',
        kpiLastActivity: 'Остання активність',
        kpiFavTemplate: 'Улюблений шаблон',
        activityFeedTitle: 'Стрічка активності (останні 100 дій)',
        tableTime: 'Час',
        tableSection: 'Розділ',
        noData: 'Немає даних за цей період.',
        loading: 'Завантаження...',
        modalTitle: 'Створення контакту',
        modalChannelTitle: '1. Оберіть канал зв\'язку',
        modalManagerTitle: '2. Оберіть менеджера',
        modalCancel: 'Скасувати',
        modalConfirm: 'Згенерувати та скопіювати',
        modalError: 'Будь ласка, оберіть канал та менеджера.',
        username_and_password_required: 'Необхідно вказати ім\'я користувача та пароль.',
        invalid_credentials: 'Невірні дані.',
        server_error: 'Помилка на сервері.',
        content_not_found: 'Контент не знайдено.',
        content_read_error: 'Помилка читання контенту.',
        invalid_token: 'Невірний токен.',
        access_denied: 'Доступ заборонено.',
        content_updated_successfully: 'Контент успішно оновлено!',
        server_error_on_save: 'Помилка на сервері при збереженні.',
        user_not_found: 'Користувача не знайдено.',
        invalid_data_format: 'Невірний формат даних.',
        favorites_updated: 'Обране оновлено.',
        button_id_not_specified: 'Не вказано ID кнопки.',
        click_tracking_error: 'Помилка запису кліку.',
        analytics_db_error: 'Помилка при отриманні аналітики з БД.',
        analytics_server_error: 'Помилка на сервері при отриманні аналітики.',
        analytics_load_error: 'Помилка завантаження статистики',
        no_templates_for_button: 'Немає шаблонів для цієї кнопки',
        copy_success: 'Скопировано ({current}/{total})',
        copy_success_generic: 'Текст успішно скопійовано!',
        favorites_load_error: 'Не вдалося завантажити обране',
        favorites_save_error: 'Помилка збереження обраного',
        missing_user_data: 'Необхідно вказати ім\'я користувача та пароль.',
        invalid_role: 'Невірна роль користувача.',
        user_created_successfully: 'Користувача успішно створено!',
        user_already_exists: 'Користувач з таким іменем вже існує.',
        server_error_creating_user: 'Помилка на сервері при створенні користувача.',
        username_not_provided: 'Не вказано ім\'я користувача для видалення.',
        cannot_delete_self: 'Неможливо видалити самого себе.',
        user_deleted_successfully: 'Користувача успішно видалено!',
        server_error_deleting_user: 'Помилка на сервері при видаленні користувача.',
        server_error_fetching_users: 'Помилка на сервері при отриманні списку користувачів.'
    }
};

function getLocalStorage(key, defaultValue) { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : defaultValue; } catch (e) { return defaultValue; } }
function setLocalStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); } }

function getTranslatedText(key, replacements = {}) {
    const lang = getLocalStorage('chaterlabLang', 'ru');
    let text = (uiTexts[lang] && uiTexts[lang][key]) || uiTexts.ru[key] || key;
    for (const placeholder in replacements) {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return text;
}

function showToast(message, isError = false) { 
    const t = document.getElementById('toast'); 
    t.textContent = message; 
    t.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)'; 
    t.classList.add('show'); 
    if (navigator.vibrate && !isError) navigator.vibrate(50); 
    setTimeout(() => t.classList.remove('show'), 2000); 
}

function generateId(prefix) { return prefix + Date.now() + Math.random().toString(16).slice(2); }
const userStatusTexts = { ru: { user: 'Пользователь', status: 'Статус', admin: 'Менеджер', worker: 'Сотрудник', access: 'Разрешено редактирование', noAccess: 'Редактирование не доступно' }, en: { user: 'User', status: 'Status', admin: 'Manager', worker: 'Employee', access: 'Editing is allowed', noAccess: 'Editing is not available' }, uk: { user: 'Користувач', status: 'Статус', admin: 'Менеджер', worker: 'Співробітник', access: 'Дозволено редагування', noAccess: 'Редагування не доступно' } };

function applyTranslations() {
    const lang = getLocalStorage('chaterlabLang', 'ru');
    const texts = uiTexts[lang] || uiTexts.ru;
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (texts[key]) {
            if (el.tagName === 'INPUT' && (el.placeholder !== undefined)) {
                el.placeholder = texts[key];
            } else if (el.title !== undefined && el.title !== '') {
                el.title = texts[key]
            }
            else {
                el.textContent = texts[key];
            }
        }
    });
}

function switchLanguage(lang) {
    setLocalStorage('chaterlabLang', lang);
    applyTranslations(); 
    const langButtonsLogin = document.querySelectorAll('#language-switcher-login button');
    langButtonsLogin.forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === lang); });
    if (document.getElementById('app-container').getAttribute('data-logged') === 'true') {
        const langButtonsApp = document.querySelectorAll('#language-switcher-app button');
        langButtonsApp.forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === lang); });
        updateInstructions(lang);
        renderUserStatusCard();
        const analyticsPanel = document.getElementById('analytics-panel');
        if (analyticsPanel && analyticsPanel.style.display === 'block') {
            analyticsPanel.dispatchEvent(new Event('languageChange'));
        }
    }
}

async function checkLogin() {
    const authToken = getLocalStorage('chaterlabAuthToken', null);
    const savedRole = getLocalStorage('chaterlabUserRole', null);
    const savedName = getLocalStorage('chaterlabUserName', null);
    if (authToken && savedRole && savedName) {
        userRole = savedRole;
        userName = savedName;
        document.getElementById('login-screen').style.display = 'none';
        document.body.classList.remove('login-active');
        const appContainer = document.getElementById('app-container');
        appContainer.setAttribute('data-logged', 'true');
        appContainer.style.opacity = '1';
        appContainer.style.display = 'flex';
        await fetchContent();
        await fetchFavorites();
        updateFavoritesUI();
        setupDarkMode();
        renderUserStatusCard();
        return true;
    } else {
        logout(false);
        return false;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    errorDiv.classList.remove('show');
    try {
        const response = await fetch(`${API_BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setLocalStorage('chaterlabAuthToken', data.token);
        setLocalStorage('chaterlabUserRole', data.role);
        setLocalStorage('chaterlabUserName', username);
        if (!getLocalStorage('chaterlabLang', null)) setLocalStorage('chaterlabLang', 'ru');
        userRole = data.role;
        userName = username;
        document.body.classList.remove('login-active');
        document.getElementById('login-screen').style.display = 'none';
        const overlay = document.getElementById('animation-overlay');
        overlay.style.display = 'flex';
        void overlay.offsetHeight;
        overlay.classList.add('animate');
        setTimeout(async () => {
            overlay.style.display = 'none';
            overlay.classList.remove('animate');
            const appContainer = document.getElementById('app-container');
            appContainer.style.display = 'flex';
            appContainer.setAttribute('data-logged', 'true');
            appContainer.style.opacity = '1';
            await fetchContent();
            await fetchFavorites();
            updateFavoritesUI();
            setupDarkMode();
            renderUserStatusCard();
        }, 2500);
    } catch (error) {
        errorDiv.textContent = getTranslatedText(error.message);
        errorDiv.classList.add('show'); // <-- Показываем ошибку
    }
}

function logout(doUIRefresh = true) {
    localStorage.removeItem('chaterlabAuthToken');
    localStorage.removeItem('chaterlabUserRole');
    localStorage.removeItem('chaterlabUserName');
    userRole = null;
    userName = null;
    if (doUIRefresh) {
        location.reload();
    }
}

async function fetchContent() {
    try {
        // Публичный контент не требует токена
        const response = await fetch(`${API_BASE_URL}/content`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        };
        appContent = await response.json();
        renderSidebar();
        const currentLang = getLocalStorage('chaterlabLang', 'ru');
        updateInstructions(currentLang);
        checkUserRoleAndSetupManagerUI();
        setupSearch();
        setupAccordion();
        applyTranslations();
    } catch (error) {
        showToast(getTranslatedText(error.message), true);
    }
}

function findButtonById(buttonId) {
    if (!appContent.layout) return null;
    for (const section of appContent.layout) {
        const button = section.buttons.find(b => b.id === buttonId);
        if (button) return button;
    }
    return null;
}

function handleSidebarButtonClick(buttonId) {
    const buttonData = findButtonById(buttonId);
    if (!buttonData) return;

    if (buttonData.type === 'contact_generator') {
        openContactModal(buttonData);
    } else {
        copyDynamicTemplate(buttonId);
    }
}

const contactModal = document.getElementById('contact-generator-modal');
const managerSelect = document.getElementById('manager-select');
const confirmBtn = document.getElementById('modal-confirm-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');

function openContactModal(buttonData) {
    managerSelect.innerHTML = '';
    if (buttonData.manager_ids && appContent.managers) {
        buttonData.manager_ids.forEach(managerId => {
            const manager = appContent.managers[managerId];
            if (manager) {
                const option = document.createElement('option');
                option.value = managerId;
                option.textContent = manager.name;
                managerSelect.appendChild(option);
            }
        });
    }
    
    confirmBtn.onclick = () => generateAndCopyContact(buttonData);
    
    contactModal.classList.add('show');
}

function closeContactModal() {
    contactModal.classList.remove('show');
    confirmBtn.onclick = null;
}

cancelBtn.addEventListener('click', closeContactModal);
contactModal.addEventListener('click', (e) => {
     if(e.target === contactModal) closeContactModal();
});

function generateAndCopyContact(buttonData) {
    const selectedChannelEl = document.querySelector('input[name="channel"]:checked');
    const selectedManagerId = managerSelect.value;

    if (!selectedChannelEl || !selectedManagerId) {
        showToast(getTranslatedText('modalError'), true);
        return;
    }

    const channelName = selectedChannelEl.value;
    const manager = appContent.managers[selectedManagerId];

    if (!manager) {
        showToast('Ошибка: не удалось найти данные менеджера.', true);
        return;
    }
    
    const managerContact = channelName.toLowerCase() === 'telegram' ? manager.telegram : manager.whatsapp;

    if (buttonData.currentIndex === undefined) buttonData.currentIndex = 0;
    const baseTemplate = buttonData.templates[buttonData.currentIndex];
    
    let finalText = baseTemplate; 
    finalText = finalText.replace(/\{contact_method\}/g, channelName);
    finalText = finalText.replace(/\{manager_contact\}/g, managerContact);
    
    navigator.clipboard.writeText(finalText).then(() => {
        let message = getTranslatedText('copy_success');
        const nextIndex = (buttonData.currentIndex + 1) % buttonData.templates.length;
        message = message.replace('{current}', buttonData.currentIndex + 1).replace('{total}', buttonData.templates.length);
        showToast(message);
        trackClick(buttonData.id);
        buttonData.currentIndex = nextIndex;
    });

    closeContactModal();
}

function renderSidebar() {
    const container = document.getElementById('sidebar-content');
    container.innerHTML = '';
    appContent.layout?.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'sidebar-section';
        const title = document.createElement('h2');
        title.textContent = section.title;
        sectionDiv.appendChild(title);

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';

        section.buttons.forEach(buttonData => {
            const button = document.createElement('button');
            button.className = 'sidebar-button';
            button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/></svg><span>${buttonData.label}</span><div class="favorite-star" data-button-id="${buttonData.id}">☆</div>`;
            button.onclick = (e) => { 
                if (e.target.classList.contains('favorite-star')) return; 
                handleSidebarButtonClick(buttonData.id);
            };
            buttonsContainer.appendChild(button);
        });
        sectionDiv.appendChild(buttonsContainer);
        container.appendChild(sectionDiv);
    });
    document.querySelector('.sidebar-scrollable-content').addEventListener('click', handleFavoriteClick);
}

function renderUserStatusCard() {
    const card = document.getElementById('user-status-card');
    if (!card || !userName || !userRole) return;
    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    const texts = userStatusTexts[currentLang] || userStatusTexts.ru;
    let statusText, accessText, statusColor;
    if (userRole === 'manager') {
        statusText = texts.admin;
        accessText = texts.access;
        statusColor = 'var(--accent-purple)';
    } else {
        statusText = texts.worker;
        accessText = texts.noAccess;
        statusColor = 'var(--text-secondary)';
    }
    card.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">${texts.user}:</span><span style="font-weight: 700; color: var(--primary-blue);">${userName}</span></div><div style="display: flex; align-items: center; justify-content: space-between;"><span style="font-weight: 600; color: var(--text-primary);">${texts.status}:</span><span style="font-weight: 700; color: ${statusColor};">${statusText}</span></div><div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; text-align: center;"><span style="color: ${userRole === 'manager' ? 'var(--success-color)' : 'var(--text-secondary)'}; font-weight: 500;">${accessText}</span></div>`;
}

function updateInstructions(lang) {
    const instructionsDiv = document.getElementById('instructions');
    if (appContent.instructionsContent && appContent.instructionsContent[lang]) {
        instructionsDiv.innerHTML = appContent.instructionsContent[lang];
    } else {
        const fallbackMessage = { 'ru': '<h3>Инструкция не найдена</h3><p>Для выбранного языка нет инструкции в базе данных.</p>', 'en': '<h3>Instructions Not Found</h3><p>No instructions are available for the selected language in the database.</p>', 'uk': '<h3>Інструкція не знайдена</h3><p>Для вибраної мови немає інструкції в базі даних.</p>' };
        instructionsDiv.innerHTML = fallbackMessage[lang] || fallbackMessage['ru'];
    }
}

async function trackClick(buttonId) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    if (!token) return;
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        await fetch(`${API_BASE_URL}/api/track-click`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ buttonId: buttonId })
        });
    } catch (error) {
        console.error('Failed to track click:', error);
    }
}

function copyDynamicTemplate(buttonId) {
    let targetButton = findButtonById(buttonId);
    if (!targetButton || !targetButton.templates || targetButton.templates.length === 0) {
        showToast(getTranslatedText('no_templates_for_button'), true);
        return;
    }
    if (targetButton.currentIndex === undefined) targetButton.currentIndex = 0;
    const textToCopy = targetButton.templates[targetButton.currentIndex];
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        let message = getTranslatedText('copy_success');
        message = message.replace('{current}', targetButton.currentIndex + 1).replace('{total}', targetButton.templates.length);
        showToast(message);
        trackClick(buttonId);
    });

    targetButton.currentIndex = (targetButton.currentIndex + 1) % targetButton.templates.length;
}

async function fetchFavorites() {
    const token = getLocalStorage('chaterlabAuthToken', '');
    if (!token) return;
    try {
         // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/api/favorites`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error(getTranslatedText('favorites_load_error'));
        const data = await response.json();
        userFavorites = data.favorites || [];
    } catch (error) {
        showToast(error.message, true);
        userFavorites = [];
    }
}

async function saveFavorites() {
    const token = getLocalStorage('chaterlabAuthToken', '');
    if (!token) return;
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        await fetch(`${API_BASE_URL}/api/favorites`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ favorites: userFavorites })
        });
    } catch (error) {
        showToast(getTranslatedText('favorites_save_error'), true);
    }
}

function handleFavoriteClick(event) {
    const star = event.target;
    if (!star.classList.contains('favorite-star')) return;
    const buttonId = star.dataset.buttonId;
    if (!buttonId) return;
    const index = userFavorites.indexOf(buttonId);
    if (index > -1) {
        userFavorites.splice(index, 1);
    } else {
        userFavorites.push(buttonId);
    }
    updateFavoritesUI();
    saveFavorites();
}

function updateFavoritesUI() {
    const favoritesContainer = document.getElementById('favorites-content');
    const favoritesSection = document.getElementById('favorites-section');
    if (!favoritesContainer || !favoritesSection) return;
    favoritesContainer.innerHTML = '';
    const allButtons = new Map();
    appContent.layout?.forEach(section => { section.buttons.forEach(btn => allButtons.set(btn.id, btn)); });
    userFavorites.forEach(favId => {
        const buttonData = allButtons.get(favId);
        if (buttonData) {
            const button = document.createElement('button');
            button.className = 'sidebar-button';
            button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/></svg><span>${buttonData.label}</span><div class="favorite-star favorited" data-button-id="${buttonData.id}">★</div>`;
            button.onclick = (e) => { 
                if (e.target.classList.contains('favorite-star')) return; 
                handleSidebarButtonClick(buttonData.id);
            };
            favoritesContainer.appendChild(button);
        }
    });
    if (userFavorites.length > 0) {
        favoritesSection.style.display = 'block';
    } else {
        favoritesSection.style.display = 'none';
    }
    document.querySelectorAll('.sidebar-button .favorite-star').forEach(star => {
        const buttonId = star.dataset.buttonId;
        if (userFavorites.includes(buttonId)) {
            star.classList.add('favorited');
            star.innerHTML = '★';
        } else {
            star.classList.remove('favorited');
            star.innerHTML = '☆';
        }
    });
}

function setupDarkMode() {
    const toggle = document.getElementById('theme-checkbox');
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        if (toggle) toggle.checked = (theme === 'dark');
        if (!isMobile() && document.getElementById('content-editor') && document.getElementById('content-editor').style.display === 'block') {
            tinymce.remove();
            initInstructionsEditor();
        }
    };
    const savedTheme = getLocalStorage('chaterlabTheme', 'light');
    applyTheme(savedTheme);
    if (toggle) toggle.addEventListener('change', () => {
        const theme = toggle.checked ? 'dark' : 'light';
        setLocalStorage('chaterlabTheme', theme);
        applyTheme(theme);
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        document.querySelectorAll('#sidebar-content .sidebar-section').forEach(section => {
            let sectionHasVisibleButton = false;
            const buttons = section.querySelectorAll('.sidebar-button');
            buttons.forEach(button => {
                const buttonLabel = button.querySelector('span').textContent.toLowerCase();
                if (buttonLabel.includes(searchTerm)) {
                    button.style.display = 'flex';
                    sectionHasVisibleButton = true;
                } else {
                    button.style.display = 'none';
                }
            });

            const sectionTitle = section.querySelector('h2');
            if (isMobile()) {
                 section.style.display = sectionHasVisibleButton ? 'block' : 'none';
            } else {
                 if(sectionTitle) sectionTitle.style.display = sectionHasVisibleButton ? 'block' : 'none';
            }
        });
    });
}

function checkUserRoleAndSetupManagerUI() {
    if (userRole === 'manager') {
        if (isMobile()) {
            const toggleBtn = document.getElementById('mobile-admin-panel-toggle');
            const overlay = document.getElementById('mobile-admin-overlay');
            const closeBtn = document.getElementById('mobile-panel-close');
            if(toggleBtn) toggleBtn.style.display = 'block';

            if(toggleBtn) toggleBtn.onclick = () => {
                if(overlay) {
                    overlay.style.display = 'block';
                    setTimeout(() => overlay.classList.add('show'), 10);
                }
                fetchAndRenderMobileAnalytics();
            };
            
            const closePanel = () => {
                 if(overlay) {
                    overlay.classList.remove('show');
                    setTimeout(() => { if(overlay) overlay.style.display = 'none'; }, 300);
                }
            };

            if(closeBtn) closeBtn.onclick = closePanel;
            if(overlay) overlay.onclick = (e) => { if (e.target === overlay) closePanel(); };

        } else {
            const managerControls = document.querySelector('.manager-controls-segmented');
            if(managerControls) managerControls.style.display = 'flex';
            const triggerAnalyticsLoad = setupAnalytics();
            
            const buttons = document.querySelectorAll('.manager-controls-segmented button');
            const glider = document.querySelector('.manager-controls-segmented .glider');
            const mainContentPanel = document.getElementById('main-content-wrapper');
            const analyticsPanel = document.getElementById('analytics-panel');

            function moveGlider(target) {
                buttons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                glider.style.width = `${target.offsetWidth}px`;
                glider.style.left = `${target.offsetLeft}px`;
            }
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    moveGlider(e.currentTarget);
                    if(button.id === 'show-instructions-btn') switchManagerView('instructions');
                    if(button.id === 'show-analytics-btn') switchManagerView('analytics');
                    if(button.id === 'edit-mode-btn') switchManagerView('editor');
                });
            });
            
            // Initial position
            const activeButton = document.querySelector('.manager-controls-segmented button.active');
            if(activeButton) {
                 setTimeout(() => moveGlider(activeButton), 50);
            }

            function switchManagerView(view) {
                mainContentPanel.style.display = 'none';
                if (analyticsPanel) analyticsPanel.style.display = 'none';
                
                if (view === 'instructions' || view === 'editor') {
                    mainContentPanel.style.display = 'block';
                    if (view === 'instructions') {
                        hideContentEditor();
                    } else {
                        showContentEditor();
                    }
                } else if (view === 'analytics') {
                   if (analyticsPanel) analyticsPanel.style.display = 'block';
                    if(triggerAnalyticsLoad) triggerAnalyticsLoad();
                }
            }
            
            document.getElementById('cancel-edit-btn').addEventListener('click', () => {
                const instructionButton = document.getElementById('show-instructions-btn');
                if (instructionButton) instructionButton.click();
            });
        }
    }
}

async function fetchAndRenderMobileAnalytics() {
    const contentDiv = document.getElementById('mobile-analytics-content');
    if(!contentDiv) return;
    contentDiv.innerHTML = `<p>${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/api/analytics?period=day`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!response.ok) throw new Error(getTranslatedText('analytics_load_error'));
        const data = await response.json();
        
        const texts = uiTexts[getLocalStorage('chaterlabLang', 'ru')];
        const totalClicks = data.detailed_log.length;
        const topEmployee = data.employee_summary?.[0]?.username || '—';
        const topTemplateId = data.template_summary?.[0]?.button_id;
        const topTemplateLabel = topTemplateId ? (findButtonById(topTemplateId)?.label || '—') : '—';

        contentDiv.innerHTML = `
            <div class="kpi-grid">
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${totalClicks}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiMostActive}</p><h3 class="kpi-card-value">${topEmployee}</h3></div>
            </div>
             <div class="kpi-card" style="margin-top: 16px;"><p class="kpi-card-title">${texts.kpiTopTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div>
        `;

    } catch (error) {
        contentDiv.innerHTML = `<p style="color: var(--error-color);">${error.message}</p>`;
    }
}

function setupAnalytics() {
    const mainPanel = document.getElementById('analytics-main');
    const employeeList = document.getElementById('employee-list');
    const periodSelector = document.querySelector('.analytics-period-selector');
    const analyticsPanel = document.getElementById('analytics-panel');
    
    if(!mainPanel || !employeeList || !periodSelector || !analyticsPanel) return;

    let currentPeriod = 'day';
    let selectedUser = null;
    let fullData = null;
    const DateTime = luxon.DateTime;

    analyticsPanel.addEventListener('languageChange', renderAnalytics);
    
    periodSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            periodSelector.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentPeriod = e.target.dataset.period;
            fetchAndRenderAnalytics();
        }
    });
    
    employeeList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const username = li.dataset.username;
            selectedUser = (username === 'all') ? null : username;
            renderAnalytics();
        }
    });

    async function fetchAndRenderAnalytics() {
        mainPanel.innerHTML = `<div id="analytics-loader">${getTranslatedText('loading')}</div>`;
        employeeList.innerHTML = '';
        const token = getLocalStorage('chaterlabAuthToken', '');
        
        try {
            // ИЗМЕНЕНО: Добавлен заголовок Authorization
            const response = await fetch(`${API_BASE_URL}/api/analytics?period=${currentPeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(getTranslatedText('analytics_load_error'));
            
            fullData = await response.json();
            renderAnalytics();

        } catch (error) {
            showToast(error.message, true);
            mainPanel.innerHTML = `<div class="no-data-message">${error.message}</div>`;
        }
    }

    function renderAnalytics() {
        if (!fullData) return;
        const lang = getLocalStorage('chaterlabLang', 'ru');
        const texts = uiTexts[lang] || uiTexts.ru;
        renderEmployeeList(fullData.employee_summary, texts);
        if (selectedUser) {
            renderUserDetailView(selectedUser, fullData, texts);
        } else {
            renderOverallSummaryView(fullData, texts);
        }
    }
    
    function renderEmployeeList(summary, texts) {
        employeeList.innerHTML = `<li data-username="all" class="${!selectedUser ? 'active' : ''}"><span class="employee-name">${texts.employeeListTitle}</span></li>`;
        if(summary && summary.length > 0) {
            summary.forEach(emp => {
                const li = document.createElement('li');
                li.dataset.username = emp.username;
                li.className = (selectedUser === emp.username) ? 'active' : '';
                li.innerHTML = `<span class="employee-name">${emp.username}</span><span class="employee-clicks">${emp.count}</span>`;
                employeeList.appendChild(li);
            });
        }
    }

    function getButtonData(buttonId) {
         if (!appContent.layout) return { label: `(ID: ${buttonId})`, section: 'N/A' };
         for (const section of appContent.layout) {
            const button = section.buttons.find(b => b.id === buttonId);
            if (button) return { label: button.label, section: section.title };
         }
         return { label: `(удален: ${buttonId})`, section: 'N/A' };
    }

    function formatRelativeTime(isoString, lang) {
        if (!isoString) return 'никогда';
        return DateTime.fromISO(isoString).setLocale(lang).toRelative();
    }

    function renderOverallSummaryView(data, texts) {
        const topEmployee = data.employee_summary?.[0]?.username || '—';
        const topTemplateId = data.template_summary?.[0]?.button_id;
        const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—';
        const peakHour = data.peak_hour;
        const peakTimeText = (peakHour !== null && peakHour !== undefined) ? `${String(peakHour).padStart(2, '0')}:00 - ${String(peakHour + 1).padStart(2, '0')}:00` : '—';

        let topTemplatesHtml = data.template_summary?.slice(0, 5).map(t => `<tr><td>${getButtonData(t.button_id).label}</td><td class="count-cell">${t.count}</td></tr>`).join('') || `<tr><td colspan="2">${texts.noData}</td></tr>`;
        let topEmployeesHtml = data.employee_summary?.slice(0, 5).map(e => `<tr><td>${e.username}</td><td class="count-cell">${e.count}</td></tr>`).join('') || `<tr><td colspan="2">${texts.noData}</td></tr>`;
        
        if (!data.detailed_log || data.detailed_log.length === 0) {
            mainPanel.innerHTML = `<div class="no-data-message">${texts.noData}</div>`;
            return;
        }
        
        mainPanel.innerHTML = `
            <div class="analytics-main-header">
                <h2>${texts.overallSummaryHeader}</h2>
                <p>${texts.overallSummarySubheader}</p>
            </div>
            <div class="kpi-grid">
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${data.detailed_log.length}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiMostActive}</p><h3 class="kpi-card-value">${topEmployee}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTopTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiPeakTime}</p><h3 class="kpi-card-value">${peakTimeText}</h3></div>
            </div>
            <div class="analytics-section">
                <h4>${texts.top5Employees}</h4>
                <table class="analytics-table"><thead><tr><th>${texts.tableEmployee}</th><th style="text-align:right;">${texts.tableActions}</th></tr></thead><tbody>${topEmployeesHtml}</tbody></table>
            </div>
            <div class="analytics-section">
                <h4>${texts.top5Templates}</h4>
                <table class="analytics-table"><thead><tr><th>${texts.tableTemplate}</th><th style="text-align:right;">${texts.tableUses}</th></tr></thead><tbody>${topTemplatesHtml}</tbody></table>
            </div>
        `;
    }

    function renderUserDetailView(username, data, texts) {
        const userData = data.employee_summary.find(e => e.username === username);
        const userLog = data.detailed_log.filter(log => log.username === username);
        
        const userTemplateCounts = userLog.reduce((acc, log) => {
            acc[log.button_id] = (acc[log.button_id] || 0) + 1;
            return acc;
        }, {});

        const topTemplateId = Object.keys(userTemplateCounts).sort((a, b) => userTemplateCounts[b] - userTemplateCounts[a])[0];
        const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—';
        
        let logHtml = userLog.slice(0, 100).map(log => {
            const btnData = getButtonData(log.button_id);
            return `<tr>
                <td class="time-cell">${DateTime.fromISO(log.created_at).toFormat('HH:mm:ss')}</td>
                <td>${btnData.label}</td>
                <td class="time-cell">${btnData.section}</td>
            </tr>`
        }).join('');

        mainPanel.innerHTML = `
            <div class="analytics-main-header">
                <h2>${texts.userDetailHeader} ${username}</h2>
                <p>${texts.userDetailSubheader}</p>
            </div>
            <div class="kpi-grid">
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${userData?.count || 0}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiLastActivity}</p><h3 class="kpi-card-value">${formatRelativeTime(userData?.last_activity, texts.lang_locale || 'ru')}</h3></div>
                <div class="kpi-card"><p class="kpi-card-title">${texts.kpiFavTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div>
            </div>
            <div class="analytics-section">
                <h4>${texts.activityFeedTitle}</h4>
                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="analytics-table">
                        <thead><tr><th>${texts.tableTime}</th><th>${texts.tableTemplate}</th><th>${texts.tableSection}</th></tr></thead>
                        <tbody>${logHtml || `<tr><td colspan="3" style="text-align:center;">${texts.noData}</td></tr>`}</tbody>
                    </table>
                </div>
            </div>
        `;
    }
    return fetchAndRenderAnalytics;
}

function switchEditorTab(tabName) { document.querySelectorAll('.editor-panel').forEach(p => p.classList.remove('active')); document.querySelectorAll('.editor-tabs button').forEach(b => b.classList.remove('active')); document.getElementById(`panel-${tabName}`).classList.add('active'); document.getElementById(`tab-btn-${tabName}`).classList.add('active'); if(tabName === 'users') { fetchAndRenderUsers(); } applyTranslations(); }
function showContentEditor() { document.getElementById('main-content-wrapper').style.display = 'block'; document.getElementById('content-editor').style.display = 'block'; document.getElementById('instructions').style.display = 'none'; buildLayoutEditor(); initInstructionsEditor(); buildManagerEditor(); switchEditorTab('layout'); applyTranslations(); }
function hideContentEditor() { document.getElementById('main-content-wrapper').style.display = 'block'; document.getElementById('content-editor').style.display = 'none'; document.getElementById('instructions').style.display = 'block'; tinymce.remove(); }
function buildLayoutEditor() { const container = document.getElementById('panel-layout'); if(!container) return; while (container.firstChild && container.firstChild.id !== 'add-section-btn') { container.removeChild(container.firstChild); } appContent.layout?.forEach(section => { const sectionNode = createSectionEditor(section); container.insertBefore(sectionNode, document.getElementById('add-section-btn')); }); }

function createSectionEditor(section) { 
    const sectionDiv = document.createElement('div'); 
    sectionDiv.className = 'editor-section'; 
    sectionDiv.dataset.id = section.id; 
    sectionDiv.innerHTML = `<div class="editor-section-header"><input type="text" class="section-title-input" value="${section.title}" data-key="sectionTitle" placeholder="Название раздела"><div class="editor-controls"><button class="delete-btn" data-key="deleteButtonTitle" title="Удалить раздел">🗑</button></div></div><div class="buttons-container"></div><button class="add-btn add-button-btn" data-key="addButton">+ Добавить кнопку в раздел</button>`; 
    const buttonsContainer = sectionDiv.querySelector('.buttons-container'); 
    section.buttons.forEach(button => { buttonsContainer.appendChild(createButtonEditor(button)); }); 
    sectionDiv.querySelector('.delete-btn').onclick = () => { if (confirm(getTranslatedText('deleteSectionConfirm'))) sectionDiv.remove(); }; 
    sectionDiv.querySelector('.add-button-btn').onclick = () => { const newButton = { id: generateId('btn_'), label: getTranslatedText('buttonLabel'), templates: ['Новый шаблон'] }; buttonsContainer.appendChild(createButtonEditor(newButton)); applyTranslations(); }; 
    return sectionDiv; 
}

function createButtonEditor(button) {
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'editor-button-entry';
    buttonDiv.dataset.id = button.id;
    buttonDiv.innerHTML = `
        <div class="editor-button-header">
            <input type="text" class="button-label-input" value="${button.label}" data-key="buttonLabel" placeholder="Название кнопки">
            <div class="editor-controls"><button class="delete-btn" data-key="deleteButtonEntryTitle" title="Удалить кнопку">🗑</button></div>
        </div>
        <div class="variants-container"></div>
        <div class="button-options">
            <div class="checkbox-wrapper">
                 <input type="checkbox" id="is-contact-btn-${button.id}" class="is-contact-btn-toggle" ${button.type === 'contact_generator' ? 'checked' : ''}>
                 <label for="is-contact-btn-${button.id}" data-key="isContactButtonLabel">Сделать кнопкой "Контакт"</label>
            </div>
        </div>
    `;
    
    const variantsContainer = buttonDiv.querySelector('.variants-container');
    if (button.templates) {
        button.templates.forEach(template => { variantsContainer.appendChild(createVariantInput(template)); });
    }
    
    const assignmentContainer = document.createElement('div');
    assignmentContainer.className = 'manager-assignment-container';
    buttonDiv.querySelector('.button-options').insertAdjacentElement('afterend', assignmentContainer);


    const addVariantBtn = document.createElement('button');
    addVariantBtn.className = 'add-variant-btn';
    addVariantBtn.dataset.key = 'addVariant';
    addVariantBtn.textContent = getTranslatedText('addVariant');
    addVariantBtn.onclick = () => {
        const newVariant = createVariantInput('');
        variantsContainer.appendChild(newVariant);
        newVariant.querySelector('textarea').focus();
        applyTranslations();
    };

    buttonDiv.querySelector('.button-options').insertAdjacentElement('beforebegin', addVariantBtn);
    buttonDiv.querySelector('.delete-btn').onclick = () => buttonDiv.remove();

    const renderManagerAssignment = (currentButtonData) => {
        if (buttonDiv.querySelector('.is-contact-btn-toggle').checked) {
            let managerCheckboxesHTML = `<h4 data-key="managerAssignmentTitle">${getTranslatedText('managerAssignmentTitle')}</h4><div class="manager-assignment-grid">`;
            
            if (appContent.managers && Object.keys(appContent.managers).length > 0) {
                for (const [id, manager] of Object.entries(appContent.managers)) {
                    const isChecked = currentButtonData.manager_ids && currentButtonData.manager_ids.includes(id) ? 'checked' : '';
                    const checkboxId = `chk-${button.id}-${id}`;
                    managerCheckboxesHTML += `
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="${checkboxId}" value="${id}" class="manager-checkbox" ${isChecked}>
                            <label for="${checkboxId}">${manager.name}</label>
                        </div>`;
                }
            }
            managerCheckboxesHTML += `</div>`;
            assignmentContainer.innerHTML = managerCheckboxesHTML;
        } else {
            assignmentContainer.innerHTML = '';
        }
    };

    buttonDiv.querySelector('.is-contact-btn-toggle').addEventListener('change', () => {
        const tempData = { ...button, manager_ids: [] }; 
        renderManagerAssignment(tempData);
        applyTranslations();
    });
    
    renderManagerAssignment(button);
    
    return buttonDiv;
}

function createVariantInput(text) { const variantDiv = document.createElement('div'); variantDiv.className = 'template-variant'; variantDiv.innerHTML = `<textarea>${text}</textarea><button class="delete-variant-btn" data-key="deleteVariantTitle" title="Удалить вариант">🗑</button>`; variantDiv.querySelector('.delete-variant-btn').onclick = () => variantDiv.remove(); return variantDiv; }
function addSection() { const newSection = { id: generateId('sec_'), title: 'Новый раздел', buttons: [] }; const sectionNode = createSectionEditor(newSection); const container = document.getElementById('panel-layout'); container.insertBefore(sectionNode, document.getElementById('add-section-btn')); applyTranslations();}
function initInstructionsEditor() { const skin = document.body.classList.contains('dark-mode') ? 'oxide-dark' : 'oxide'; const content_css = document.body.classList.contains('dark-mode') ? 'dark' : 'default'; tinymce.init({ selector: '#instructions-editor-ru, #instructions-editor-en, #instructions-editor-uk', height: 500, menubar: false, plugins: 'lists link image code help wordcount autoresize table', toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | code | table | help', skin: skin, content_css: content_css, setup: editor => { editor.on('init', () => { const langKey = editor.id.split('-')[2]; editor.setContent(appContent.instructionsContent?.[langKey] || ''); }); } }); }

function buildManagerEditor() {
    const container = document.getElementById('panel-managers');
    const addButton = document.getElementById('add-manager-btn');
    if(!container || !addButton) return;
    container.innerHTML = ''; 
    if (appContent.managers) {
        for (const [id, manager] of Object.entries(appContent.managers)) {
            container.appendChild(createManagerEditorEntry(id, manager));
        }
    }
    container.appendChild(addButton);
    addButton.onclick = addManagerEntry;
}

function createManagerEditorEntry(id, manager) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'manager-editor-entry';
    entryDiv.dataset.id = id;
    entryDiv.innerHTML = `
        <div class="manager-editor-header">
            <input type="text" class="manager-name-input" value="${manager.name}" data-key="managerNamePlaceholder" placeholder="Имя менеджера">
            <div class="editor-controls">
                <button class="delete-btn" data-key="deleteManagerTitle" title="Удалить менеджера">🗑</button>
            </div>
        </div>
        <div class="manager-editor-fields">
            <div class="manager-editor-field">
                <label>Telegram</label>
                <input type="text" class="manager-telegram-input" value="${manager.telegram}" data-key="managerTelegramPlaceholder" placeholder="@username">
            </div>
            <div class="manager-editor-field">
                <label>WhatsApp</label>
                <input type="text" class="manager-whatsapp-input" value="${manager.whatsapp}" data-key="managerWhatsappPlaceholder" placeholder="+123...">
            </div>
        </div>
    `;
    entryDiv.querySelector('.delete-btn').onclick = () => entryDiv.remove();
    return entryDiv;
}

function addManagerEntry() {
    const newId = generateId('mgr_');
    const newManager = { name: 'Новый менеджер', telegram: '@username', whatsapp: '+123456789' };
    const entryNode = createManagerEditorEntry(newId, newManager);
    const container = document.getElementById('panel-managers');
    const addButton = document.getElementById('add-manager-btn');
    container.insertBefore(entryNode, addButton);
    applyTranslations();
    entryNode.querySelector('.manager-name-input').focus();
}

async function saveContent() {
    const newLayout = [];
    document.querySelectorAll('#panel-layout .editor-section').forEach(sectionNode => {
        const section = { id: sectionNode.dataset.id, title: sectionNode.querySelector('.section-title-input').value.trim(), buttons: [] };
        if (!section.title) return;
        sectionNode.querySelectorAll('.editor-button-entry').forEach(buttonNode => {
            
            const newButtonObject = { 
                id: buttonNode.dataset.id, 
                label: buttonNode.querySelector('.button-label-input').value.trim(), 
                templates: Array.from(buttonNode.querySelectorAll('.variants-container .template-variant textarea')).map(t => t.value.trim()).filter(v => v)
            };

            const isContactToggle = buttonNode.querySelector('.is-contact-btn-toggle');
            if (isContactToggle && isContactToggle.checked) {
                newButtonObject.type = 'contact_generator';
                const selectedIds = [];
                const managerCheckboxes = buttonNode.querySelectorAll('.manager-checkbox:checked');
                managerCheckboxes.forEach(checkbox => {
                    selectedIds.push(checkbox.value);
                });
                newButtonObject.manager_ids = selectedIds;
            }

            if (newButtonObject.label) section.buttons.push(newButtonObject);
        });
        newLayout.push(section);
    });

    const newInstructions = {};
    for (const lang of ['ru', 'en', 'uk']) {
        const editor = tinymce.get(`instructions-editor-${lang}`);
        if (editor) newInstructions[lang] = editor.getContent();
    }

    const newManagers = {};
    document.querySelectorAll('#panel-managers .manager-editor-entry').forEach(entryNode => {
        const id = entryNode.dataset.id;
        const name = entryNode.querySelector('.manager-name-input').value.trim();
        const telegram = entryNode.querySelector('.manager-telegram-input').value.trim();
        const whatsapp = entryNode.querySelector('.manager-whatsapp-input').value.trim();
        if (name) {
            newManagers[id] = { name, telegram, whatsapp };
        }
    });

    const newContent = { layout: newLayout, instructionsContent: newInstructions, managers: newManagers };
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/update-content`, { 
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            }, 
            body: JSON.stringify(newContent) 
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        showToast(getTranslatedText(data.message));
        appContent = newContent;
        renderSidebar();
        updateInstructions(getLocalStorage('chaterlabLang', 'ru'));
        hideContentEditor();
    } catch (error) {
        showToast(getTranslatedText(error.message), true);
    }
}

async function fetchAndRenderUsers() {
    const listContainer = document.getElementById('user-list');
    if (!listContainer) return;
    listContainer.innerHTML = `<p>${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/api/users`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const users = await response.json();
        if (!response.ok) throw new Error(users.message);
        
        listContainer.innerHTML = '';
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-list-item';
            const roleText = getTranslatedText(user.role === 'manager' ? 'roleManager' : 'roleEmployee');
            userDiv.innerHTML = `
                <div class="user-info">
                    <span class="username">${user.username}</span>
                    <span class="role">${roleText}</span>
                </div>
                <div class="user-actions">
                    <button class="delete-user-btn" data-username="${user.username}" ${userName === user.username ? 'disabled' : ''}>${getTranslatedText('deleteUserBtn')}</button>
                </div>
            `;
            listContainer.appendChild(userDiv);
        });

        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const userToDelete = e.target.dataset.username;
                const confirmMsg = getTranslatedText('deleteUserConfirm', { username: userToDelete });
                if(confirm(confirmMsg)){
                    await deleteUser(userToDelete);
                }
            };
        });
        applyTranslations();
    } catch (error) {
        listContainer.innerHTML = `<p style="color: var(--error-color);">${getTranslatedText(error.message)}</p>`;
    }
}

async function createUser(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('new-username');
    const passwordInput = document.getElementById('new-password');
    const roleSelect = document.getElementById('new-user-role');

    const userData = {
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
        role: roleSelect.value
    };

    if(!userData.username || !userData.password) {
        showToast(getTranslatedText('missing_user_data'), true);
        return;
    }

    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/api/users/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(userData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        showToast(getTranslatedText(result.message));
        usernameInput.value = '';
        passwordInput.value = '';
        fetchAndRenderUsers();
    } catch (error) {
         showToast(getTranslatedText(error.message), true);
    }
}

async function deleteUser(username) {
     const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        // ИЗМЕНЕНО: Добавлен заголовок Authorization
        const response = await fetch(`${API_BASE_URL}/api/users/delete`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ username: username })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        showToast(getTranslatedText(result.message));
        fetchAndRenderUsers();
    } catch (error) {
         showToast(getTranslatedText(error.message), true);
    }
}

function setupAccordion() {
    if (!isMobile()) return;
    const sidebar = document.getElementById('sidebar-content');
    if (!sidebar) return;
    sidebar.addEventListener('click', (e) => {
        const header = e.target.closest('h2');
        if (header) {
            const section = header.parentElement;
            if(section) section.classList.toggle('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getLocalStorage('chaterlabLang', 'ru');
    switchLanguage(initialLang);
    document.querySelectorAll('#language-switcher-login button').forEach(button => { button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); });
    document.querySelectorAll('#language-switcher-app button').forEach(button => { button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); });
    checkLogin();
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    const addUserForm = document.getElementById('add-user-form');
    if(addUserForm) addUserForm.addEventListener('submit', createUser);

    const tabLayout = document.getElementById('tab-btn-layout');
    if(tabLayout) tabLayout.addEventListener('click', () => switchEditorTab('layout'));
    
    const tabInstructions = document.getElementById('tab-btn-instructions');
    if(tabInstructions) tabInstructions.addEventListener('click', () => switchEditorTab('instructions'));

    const tabManagers = document.getElementById('tab-btn-managers');
    if(tabManagers) tabManagers.addEventListener('click', () => switchEditorTab('managers'));

    const tabUsers = document.getElementById('tab-btn-users');
    if(tabUsers) tabUsers.addEventListener('click', () => switchEditorTab('users'));

    const saveBtn = document.getElementById('save-content-btn');
    if(saveBtn) saveBtn.addEventListener('click', saveContent);

    const addSectionBtn = document.getElementById('add-section-btn');
    if(addSectionBtn) addSectionBtn.addEventListener('click', addSection);
});