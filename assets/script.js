function setupMobileNavigation() {
    if (!isMobile()) return;
    
    const navItems = document.querySelectorAll('.mobile-bottom-nav .nav-item');
    const screens = document.querySelectorAll('.mobile-screen');
    const headerTitle = document.getElementById('mobile-header-title');
    const backBtn = document.getElementById('mobile-back-btn');
    
    let currentScreen = 'templates';
    
    const switchScreen = (screenName) => {
        screens.forEach(screen => screen.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));
        
        const targetScreen = document.getElementById(`mobile-${screenName}-screen`);
        const targetNavItem = document.querySelector(`.nav-item[data-screen="${screenName}"]`);
        
        if (targetScreen) targetScreen.classList.add('active');
        if (targetNavItem) targetNavItem.classList.add('active');
        
        currentScreen = screenName;
        
        const titles = {
            templates: 'ChaterLab',
            instructions: getTranslatedText('navInstructions'),
            schedule: getTranslatedText('navSchedule'), // <-- ИЗМЕНЕНИЕ (которое было)
            menu: 'Меню',
            analytics: getTranslatedText('navAnalytics'),
            editor: getTranslatedText('navEditor'),
            'editor-info': getTranslatedText('navEditor'),
            'users-management': getTranslatedText('tabUsers')
        };
        headerTitle.textContent = titles[screenName] || 'ChaterLab';
        
        backBtn.style.display = (screenName === 'analytics' || screenName === 'editor' || screenName === 'editor-info' || screenName === 'users-management' || screenName === 'schedule') ? 'flex' : 'none';
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenName = item.dataset.screen;
            switchScreen(screenName);
        });
    });
    
    backBtn.addEventListener('click', () => {
        switchScreen('menu');
    });
    
    const editorInfoBtn = document.getElementById('mobile-editor-info-btn');
    const usersBtn = document.getElementById('mobile-users-btn');
    
    if (userRole === 'manager') {
        if (editorInfoBtn) {
            editorInfoBtn.style.display = 'flex';
            editorInfoBtn.addEventListener('click', () => {
                switchScreen('editor-info');
            });
        }
        
        if (usersBtn) {
            usersBtn.style.display = 'flex';
            usersBtn.addEventListener('click', () => {
                switchScreen('users-management');
                fetchAndRenderMobileUsers();
            });
        }
    }
    
    const mobileLangButtons = document.querySelectorAll('.mobile-lang-btn');
    mobileLangButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });
    
    // Attach to all mobile user forms
    document.querySelectorAll('.mobile-user-form').forEach(form => {
        form.addEventListener('submit', createMobileUser);
    });
}

function setupMobileEditorTabs() {
    const tabs = document.querySelectorAll('.mobile-editor-tabs button');
    const panels = document.querySelectorAll('.mobile-editor-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            const targetPanel = document.getElementById(`mobile-editor-panel-${targetTab}`);
            if (targetPanel) targetPanel.classList.add('active');
            
            if (targetTab === 'users') {
                fetchAndRenderMobileUsers();
            }
        });
    });
    
    document.querySelectorAll('.mobile-user-form').forEach(form => {
        form.addEventListener('submit', createMobileUser);
    });
}

async function fetchAndRenderMobileUsers() {
    const listContainer = document.getElementById('mobile-user-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text-secondary);">${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    
    try {
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
                if (confirm(confirmMsg)) {
                    await deleteUser(userToDelete);
                    fetchAndRenderMobileUsers();
                }
            };
        });
    } catch (error) {
        const errorKey = error.message || 'server_error_on_save';
        showToast(getTranslatedText(errorKey), true);
        
        // Добавьте эту проверку:
        if (errorKey === 'invalid_token' || errorKey === 'access_denied') {
            logout(); // Принудительный выход из системы
        }
    }
}

async function createMobileUser(event) {
    event.preventDefault();
    const form = event.currentTarget || event.target;
    const usernameInput = form.querySelector('[data-field="username"]');
    const passwordInput = form.querySelector('[data-field="password"]');
    const roleSelect = form.querySelector('[data-field="role"]');

    const userData = {
        username: (usernameInput?.value || '').trim(),
        password: (passwordInput?.value || '').trim(),
        role: (roleSelect?.value || 'employee')
    };

    if (!userData.username || !userData.password) {
        showToast(getTranslatedText('missing_user_data'), true);
        return;
    }

    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
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
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        fetchAndRenderMobileUsers();
    } catch (error) {
        showToast(getTranslatedText(error.message), true);
    }
}

"use strict";
const API_BASE_URL = 'https://backendchater.fly.dev';
let userRole = null;
let appContent = {};
let userName = null;
let userFavorites = [];
// НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ГРАФИКА
let scheduleData = [];
let scheduleCurrentDate = null; // <-- ИСПРАВЛЕНО: Убрана инициализация luxon
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
        server_error_fetching_users: 'Ошибка на сервере при получении списка пользователей.',
        
        // НОВЫЕ ПЕРЕВОДЫ ДЛЯ ГРАФИКА
        navSchedule: 'График',
        scheduleLoading: 'Загрузка графика...',
        legendAvailable: 'Доступно',
        legendMyDay: 'Мой выходной',
        legendGroupConflict: 'Занято (группа)',
        legendRuleConflict: 'Конфликт (правило)',
        legendManagerAll: 'Занято (другие)',
        conflict_group_conflict: 'Этот день уже занят кем-то из вашей группы.',
        conflict_weekly_limit: 'Вы уже выбрали выходной на этой неделе.',
        conflict_consecutive_day: 'Нельзя брать два выходных дня подряд.',
        dayOffDeleted: 'Выходной удален.',
        deleteDayOffConfirm: 'Вы уверены, что хотите удалить этот выходной?',
        deleteForUserConfirm: 'Удалить выходной для пользователя {username}?',

        analyticsNotAvailable: 'Аналитика доступна только менеджерам',
        headerSubtitle: 'Быстрые ответы',
        notificationsTitle: 'Оповещения',
        criticalAckBtn: 'Я ознакомлен'
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
        navSchedule: 'Schedule', // <-- ИЗМЕНЕНИЕ (которое было)
        editorUnavailable: 'Editor',
        editorUnavailableMsg: 'Full editing is only available on the desktop version.',
        analyticsNotAvailable: 'Analytics available for managers only',
        headerSubtitle: 'Quick Replies',
        notificationsTitle: 'Notifications',
        criticalAckBtn: 'Acknowledge'
    },
    uk: {
        lang_locale: 'uk',
        loginHeader: 'ChaterLab', 
        loginSubheader: 'Панель швидких відповідей', 
        loginUsername: 'Логін', 
        loginPassword: 'Пароль', 
        loginBtn: 'Увійти',
        searchPlaceholder: '🔎 Пошук по шаблонам...',
        favoritesTitle: '⭐ Обране',
        darkMode: 'Темна тема',
        logout: 'Вийти',
        navInstructions: 'Інструкція',
        navAnalytics: 'Аналітика',
        navEditor: 'Редактор',
        navSchedule: 'Графік', // <-- ИЗМЕНЕНИЕ (которое было)
        editorUnavailable: 'Редактор',
        editorUnavailableMsg: 'Повноцінне редагування доступне лише у версії сайту для ПК.',
        analyticsNotAvailable: 'Аналітика доступна лише менеджерам',
        headerSubtitle: 'Швидкі відповіді',
        notificationsTitle: 'Сповіщення',
        criticalAckBtn: 'Ознайомлений'
    }
};

function getLocalStorage(key, defaultValue) { 
    try { 
        const val = localStorage.getItem(key); 
        return val ? JSON.parse(val) : defaultValue; 
    } catch (e) { 
        return defaultValue; 
    } 
}

function setLocalStorage(key, value) { 
    try { 
        localStorage.setItem(key, JSON.stringify(value)); 
    } catch (e) { 
        console.error(e); 
    } 
}

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

function generateId(prefix) { 
    return prefix + Date.now() + Math.random().toString(16).slice(2); 
}

const userStatusTexts = { 
    ru: { 
        user: 'Пользователь', 
        status: 'Статус', 
        admin: 'Менеджер', 
        worker: 'Сотрудник', 
        access: 'Разрешено редактирование', 
        noAccess: 'Редактирование не доступно' 
    }, 
    en: { 
        user: 'User', 
        status: 'Status', 
        admin: 'Manager', 
        worker: 'Employee', 
        access: 'Editing is allowed', 
        noAccess: 'Editing is not available' 
    }, 
    uk: { 
        user: 'Користувач', 
        status: 'Статус', 
        admin: 'Менеджер', 
        worker: 'Співробітник', 
        access: 'Дозволено редагування', 
        noAccess: 'Редагування не доступно' 
    } 
};

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
            } else {
                el.textContent = texts[key];
            }
        }
    });

    // On language change, clear desktop subtitle; typing setup will handle rendering
    try {
        if (!isMobile()) {
            const typingEl = document.getElementById('typing-text');
            if (typingEl) typingEl.textContent = '';
        }
    } catch (_) {}
    // Modal static texts
    const tTitle = document.querySelector('[data-key="notificationsTitle"]'); if (tTitle) tTitle.textContent = getTranslatedText('notificationsTitle') || 'Оповещения';
    const ackBtn = document.querySelector('[data-key="criticalAckBtn"]'); if (ackBtn) ackBtn.textContent = getTranslatedText('criticalAckBtn') || 'Я ознакомлен';
}
// Notifications API helpers
async function fetchNotifications() {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.notifications || [];
}

async function publishNotification(note) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await fetch(`${API_BASE_URL}/api/notifications/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(note) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return true;
}

async function markNotificationRead(notificationId) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await fetch(`${API_BASE_URL}/api/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ notification_id: notificationId }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
}

function getCurrentLanguage() {
    return getLocalStorage('chaterlabLang', 'ru');
}

function filterNotesByLanguage(notes) { return notes; }

function updateNotificationBadges(unreadCount) {
    const desktopBadge = document.getElementById('notifications-badge');
    const mobileBadge = document.getElementById('mobile-notifications-badge');
    if (desktopBadge) { desktopBadge.textContent = unreadCount; desktopBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none'; }
    if (mobileBadge) { mobileBadge.textContent = unreadCount; mobileBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none'; }
}

function renderNotificationsList(notes) {
    const wrap = document.getElementById('notifications-list');
    if (!wrap) return;
    const filtered = filterNotesByLanguage(notes);
    if (filtered.length === 0) {
        wrap.innerHTML = `<p style="color: var(--text-secondary);">${getTranslatedText('noData')}</p>`;
        return;
    }
    wrap.innerHTML = '';
    filtered.forEach(n => {
        const item = document.createElement('div');
        item.className = 'editor-section' + (n.is_critical ? ' critical' : '');
        const readMark = n.is_read ? '' : `<span style="color: var(--error-color);font-weight:600;margin-left:8px;">•</span>`;
        item.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
            <div style="flex:1;min-width:0">
                <div style="font-weight:700;margin-bottom:6px;">${n.title || ''}${readMark}</div>
                <div style="white-space:pre-wrap;color:var(--text-secondary)">${n.body || ''}</div>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0">
                ${n.is_read ? '' : `<button class="mark-read-btn" data-id="${n.id}">${getTranslatedText('criticalAckBtn')}</button>`}
            </div>
        </div>`;
        wrap.appendChild(item);
    });
    wrap.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            await markNotificationRead(btn.dataset.id);
            await refreshNotificationsUI();
        });
    });
}

async function refreshNotificationsUI() {
    try {
        const notes = await fetchNotifications();
        const filtered = filterNotesByLanguage(notes);
        const unread = filtered.filter(n => !n.is_read).length;
        updateNotificationBadges(unread);
        renderNotificationsList(notes);
        return notes;
    } catch (e) {
        // silent failure to avoid blocking
    }
}

function setupNotificationsUI() {
    const btn = document.getElementById('notifications-btn');
    const modal = document.getElementById('notifications-modal');
    const closeBtn = document.getElementById('notifications-close-btn');
    if (btn && modal && closeBtn) {
        btn.onclick = async () => {
            await refreshNotificationsUI();
            modal.classList.add('show');
        };
        closeBtn.onclick = () => modal.classList.remove('show');
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
    }
    const mbtn = document.getElementById('mobile-notifications-btn');
    if (mbtn && modal) {
        mbtn.onclick = async () => { await refreshNotificationsUI(); modal.classList.add('show'); };
    }
}

// Manager tab: notifications publish form
function setupNotificationsEditor() {
    const form = document.getElementById('notifications-form');
    const tabBtn = document.getElementById('tab-btn-notifications');
    const panel = document.getElementById('panel-notifications');
    // Only show for managers
    if (userRole !== 'manager') {
        if (tabBtn) tabBtn.style.display = 'none';
        if (panel) panel.style.display = 'none';
        return;
    }
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = (document.getElementById('notif-title')?.value || '').trim();
            const body = (document.getElementById('notif-body')?.value || '').trim();
            const is_critical = !!document.getElementById('notif-critical')?.checked;
            const languages = Array.from(document.querySelectorAll('.notif-lang:checked')).map(el => el.value);
            if (!title || !body || languages.length === 0) {
                showToast(getTranslatedText('invalid_data_format'), true);
                return;
            }
            try {
                await publishNotification({ title, body, is_critical, languages, is_active: true });
                showToast(getTranslatedText('content_updated_successfully'));
                (document.getElementById('notif-title') || {}).value = '';
                (document.getElementById('notif-body') || {}).value = '';
                document.querySelectorAll('.notif-lang').forEach(el => { el.checked = true; });
                document.getElementById('notif-critical').checked = false;
                await refreshNotificationsUI();
            } catch (err) {
                showToast(getTranslatedText(err.message || 'server_error'), true);
            }
        });
    }
}

async function showCriticalIfAny() {
    try {
        const notes = await refreshNotificationsUI();
        const critical = (notes || []).find(n => n.is_critical && !n.is_read);
        if (critical) {
            const modal = document.getElementById('critical-modal');
            const title = document.getElementById('critical-title');
            const body = document.getElementById('critical-body');
            const ack = document.getElementById('critical-ack-btn');
            if (title) title.textContent = critical.title || 'Важное объявление';
            if (body) body.textContent = critical.body || '';
            if (modal && ack) {
                modal.classList.add('show');
                ack.onclick = async () => {
                    await markNotificationRead(critical.id);
                    modal.classList.remove('show');
                    await refreshNotificationsUI();
                };
            }
        }
    } catch (_) {}
}

// History fetch and render
async function fetchNotificationsHistory() {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await fetch(`${API_BASE_URL}/api/notifications/history`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.notifications || [];
}

async function renderNotificationsHistory() {
    try {
        const list = document.getElementById('notifications-history-list');
        if (!list) return;
        list.innerHTML = `<p style="color: var(--text-secondary);">${getTranslatedText('loading')}</p>`;
        const notes = await fetchNotificationsHistory();
        if (!notes.length) { list.innerHTML = `<p style="color: var(--text-secondary);">${getTranslatedText('noData')}</p>`; return; }
        list.innerHTML = '';
        notes.forEach(n => {
            const div = document.createElement('div');
            div.className = 'history-item' + (n.is_critical ? ' critical' : '');
            const date = new Date(n.created_at).toLocaleString();
            div.innerHTML = `<div class="title">${n.title || ''}</div><div class="meta">${date}${n.is_critical ? ' • critical' : ''}</div>`;
            list.appendChild(div);
        });
    } catch (_) {}
}

function switchLanguage(lang) {
    setLocalStorage('chaterlabLang', lang);
    applyTranslations(); 
    
    const langButtonsLogin = document.querySelectorAll('#language-switcher-login button');
    langButtonsLogin.forEach(btn => { 
        btn.classList.toggle('active', btn.dataset.lang === lang); 
    });
    
    if (document.getElementById('app-container').getAttribute('data-logged') === 'true') {
        const langButtonsApp = document.querySelectorAll('#language-switcher-app button');
        langButtonsApp.forEach(btn => { 
            btn.classList.toggle('active', btn.dataset.lang === lang); 
        });
        
        // Mobile language buttons
        const mobileLangButtons = document.querySelectorAll('.mobile-lang-btn');
        mobileLangButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        updateInstructions(lang);
        renderUserStatusCard();
        
        const analyticsPanel = document.getElementById('analytics-panel');
        if (analyticsPanel && analyticsPanel.style.display === 'block') {
            analyticsPanel.dispatchEvent(new Event('languageChange'));
        }
        // Recalculate segmented control glider after translated labels change width
        const managerControls = document.querySelector('.manager-controls-segmented');
        if (managerControls) {
            const glider = managerControls.querySelector('.glider');
            const activeBtn = managerControls.querySelector('button.active');
            if (glider && activeBtn) {
                glider.style.width = `${activeBtn.offsetWidth}px`;
                glider.style.left = `${activeBtn.offsetLeft}px`;
            }
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
        setupMobileNavigation();
        setupHeaderTypingOnAllTargets();
        setupNotificationsUI();
        showCriticalIfAny();
        setupScheduleCalendar(); // <-- ИЗМЕНЕНИЕ (которое было)
        
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
        const response = await fetch(`${API_BASE_URL}/login`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ username, password }) 
        });
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
            setupMobileNavigation();
            setupHeaderTypingOnAllTargets();
            setupNotificationsUI();
            showCriticalIfAny();
            setupNotificationsEditor();
            setupScheduleCalendar(); // <-- ИЗМЕНЕНИЕ (которое было)
        }, 2500);
    } catch (error) {
        errorDiv.textContent = getTranslatedText(error.message);
        errorDiv.classList.add('show');
    }
}

// Desktop-only typing animation for header subtitle
function setupDesktopHeaderTyping(target = { typingId: 'typing-text', caretSelector: '.app-header-subtitle .typing-caret' }) {
    try {
        const typingEl = document.getElementById(target.typingId);
        const caretEl = document.querySelector(target.caretSelector);
        if (!typingEl || !caretEl) return;

        const getPhrase = () => String(getTranslatedText('headerSubtitle') || '');
        const typeDelayMs = 120; // slower typing
        const eraseDelayMs = 70;
        const holdAfterTypeMs = 5000;
        const pauseBetweenCyclesMs = 800;

        let isErasing = false;
        let charIndex = 0;
        let phrase = getPhrase();
        let activeTimer = null;

        const clearTimer = () => { if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; } };

        const safeStep = () => {
            try {
                if (!document.body.contains(typingEl)) { clearTimer(); return; }
                // Refresh phrase on each full cycle to reflect language changes
                if (!isErasing && charIndex === 0) phrase = getPhrase();
                if (!isErasing) {
                    if (charIndex < phrase.length) {
                        typingEl.textContent = phrase.slice(0, charIndex + 1);
                        charIndex++;
                        activeTimer = setTimeout(safeStep, typeDelayMs);
                    } else {
                        activeTimer = setTimeout(() => { isErasing = true; safeStep(); }, holdAfterTypeMs);
                    }
                } else {
                    if (charIndex > 0) {
                        typingEl.textContent = phrase.slice(0, charIndex - 1);
                        charIndex--;
                        activeTimer = setTimeout(safeStep, eraseDelayMs);
                    } else {
                        isErasing = false;
                        activeTimer = setTimeout(safeStep, pauseBetweenCyclesMs);
                    }
                }
            } catch (e) {
                // Fail-safe: disable animation and show static text
                clearTimer();
                try { typingEl.textContent = getPhrase(); } catch (_) {}
            }
        };

        clearTimer();
        typingEl.textContent = '';
        charIndex = 0;
        isErasing = false;
        phrase = getPhrase();
        safeStep();
    } catch (e) {
        // Absolute fail-safe
        try {
            const typingEl = document.getElementById(target.typingId);
            if (typingEl) typingEl.textContent = getTranslatedText('headerSubtitle');
        } catch (_) {}
    }
}

// Reusable initializer to run typing on both desktop and mobile header areas
function setupHeaderTypingOnAllTargets() {
    try {
        // Desktop
        setupDesktopHeaderTyping({ typingId: 'typing-text', caretSelector: '.app-header-subtitle .typing-caret' });
        // Mobile
        const mobileSubtitle = document.getElementById('mobile-header-subtitle');
        const mobileTitle = document.getElementById('mobile-header-title');
        const mobileTyping = document.getElementById('typing-text-mobile');
        if (mobileSubtitle && mobileTitle && mobileTyping) {
            mobileSubtitle.style.display = 'flex';
            mobileTitle.textContent = 'ChaterLab';
            setupDesktopHeaderTyping({ typingId: 'typing-text-mobile', caretSelector: '#mobile-header-subtitle .typing-caret' });
        }
    } catch (_) {}
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
        const response = await fetch(`${API_BASE_URL}/content`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
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
    finalText = finalText.replace(/\{manager_name\}/g, manager.name);
    
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
    // Desktop render
    const container = document.getElementById('sidebar-content');
    if (container) {
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
        
        const scrollableContent = document.querySelector('.sidebar-scrollable-content');
        if (scrollableContent) {
            scrollableContent.addEventListener('click', handleFavoriteClick);
        }
    }
    
    // Mobile render
    const mobileContainer = document.getElementById('mobile-sidebar-content');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        appContent.layout?.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'mobile-section';
            const title = document.createElement('h2');
            title.textContent = section.title;
            sectionDiv.appendChild(title);

            section.buttons.forEach(buttonData => {
                const button = document.createElement('button');
                button.className = 'sidebar-button';
                button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/></svg><span>${buttonData.label}</span><div class="favorite-star" data-button-id="${buttonData.id}">☆</div>`;
                button.onclick = (e) => { 
                    if (e.target.classList.contains('favorite-star')) return; 
                    handleSidebarButtonClick(buttonData.id);
                };
                sectionDiv.appendChild(button);
            });
            
            mobileContainer.appendChild(sectionDiv);
        });
        
        mobileContainer.addEventListener('click', handleFavoriteClick);
    }
}

function renderUserStatusCard() {
    const renderCard = (cardElement) => {
        if (!cardElement || !userName || !userRole) return;
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
        
        cardElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">${texts.user}:</span><span style="font-weight: 700; color: var(--primary-blue);">${userName}</span></div><div style="display: flex; align-items: center; justify-content: space-between;"><span style="font-weight: 600; color: var(--text-primary);">${texts.status}:</span><span style="font-weight: 700; color: ${statusColor};">${statusText}</span></div><div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; text-align: center;"><span style="color: ${userRole === 'manager' ? 'var(--success-color)' : 'var(--text-secondary)'}; font-weight: 500;">${accessText}</span></div>`;
    };
    
    const desktopCard = document.getElementById('user-status-card');
    const mobileCard = document.getElementById('mobile-user-status-card');
    
    renderCard(desktopCard);
    renderCard(mobileCard);
}

function updateInstructions(lang) {
    const updateInstructionsContent = (instructionsDiv) => {
        if (!instructionsDiv) return;
        if (appContent.instructionsContent && appContent.instructionsContent[lang]) {
            instructionsDiv.innerHTML = appContent.instructionsContent[lang];
        } else {
            const fallbackMessage = { 
                'ru': '<h3>Инструкция не найдена</h3><p>Для выбранного языка нет инструкции в базе данных.</p>', 
                'en': '<h3>Instructions Not Found</h3><p>No instructions are available for the selected language in the database.</p>', 
                'uk': '<h3>Інструкція не знайдена</h3><p>Для вибраної мови немає інструкції в базі даних.</p>' 
            };
            instructionsDiv.innerHTML = fallbackMessage[lang] || fallbackMessage['ru'];
        }
    };
    
    updateInstructionsContent(document.getElementById('instructions'));
    updateInstructionsContent(document.getElementById('mobile-instructions'));
}

async function trackClick(buttonId) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    if (!token) return;
    try {
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
    const allButtons = new Map();
    appContent.layout?.forEach(section => { 
        section.buttons.forEach(btn => allButtons.set(btn.id, btn)); 
    });
    
    // Desktop favorites
    const favoritesContainer = document.getElementById('favorites-content');
    const favoritesSection = document.getElementById('favorites-section');
    if (favoritesContainer && favoritesSection) {
        favoritesContainer.innerHTML = '';
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
        favoritesSection.style.display = userFavorites.length > 0 ? 'block' : 'none';
    }
    
    // Mobile favorites
    const mobileFavoritesContainer = document.getElementById('mobile-favorites-content');
    const mobileFavoritesSection = document.getElementById('mobile-favorites-section');
    if (mobileFavoritesContainer && mobileFavoritesSection) {
        mobileFavoritesContainer.innerHTML = '';
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
                mobileFavoritesContainer.appendChild(button);
            }
        });
        mobileFavoritesSection.style.display = userFavorites.length > 0 ? 'block' : 'none';
    }
    
    // Update all star icons
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
    const mobileToggle = document.getElementById('mobile-theme-checkbox');
    const mobileToggleSwitch = document.querySelector('.mobile-toggle-switch');
    
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        const isDark = theme === 'dark';
        if (toggle) toggle.checked = isDark;
        if (mobileToggle) mobileToggle.checked = isDark;
        if (mobileToggleSwitch) {
            if (isDark) {
                mobileToggleSwitch.classList.add('checked');
            } else {
                mobileToggleSwitch.classList.remove('checked');
            }
        }
    };
    
    const savedTheme = getLocalStorage('chaterlabTheme', 'light');
    applyTheme(savedTheme);
    
    const handleThemeChange = (checked) => {
        const theme = checked ? 'dark' : 'light';
        setLocalStorage('chaterlabTheme', theme);
        applyTheme(theme);
    };
    
    if (toggle) toggle.addEventListener('change', () => handleThemeChange(toggle.checked));
    
    const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
    if (mobileThemeToggleBtn && mobileToggle) {
        mobileThemeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const newState = !mobileToggle.checked;
            mobileToggle.checked = newState;
            handleThemeChange(newState);
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('searchInputMobile');
    
    const handleSearch = (searchTerm, targetContainer) => {
        const sections = targetContainer.querySelectorAll('.sidebar-section, .mobile-section');
        sections.forEach(section => {
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
            if (sectionTitle) {
                sectionTitle.style.display = sectionHasVisibleButton ? 'block' : 'none';
            }
        });
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            handleSearch(searchTerm, document.getElementById('sidebar-content'));
        });
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            handleSearch(searchTerm, document.getElementById('mobile-sidebar-content'));
        });
    }
}

function showAnalyticsStub() {
    const stub = document.getElementById('mobile-analytics-stub');
    const content = document.getElementById('mobile-analytics-content');
    
    if (stub && content) {
        stub.style.display = 'flex';
        content.style.display = 'none';
        
        const stubText = stub.querySelector('p');
        if (stubText) {
            stubText.textContent = getTranslatedText('analyticsNotAvailable');
        }
    }
}

async function loadMobileAnalytics() {
    const stub = document.getElementById('mobile-analytics-stub');
    const content = document.getElementById('mobile-analytics-content');
    
    if (!stub || !content) return;
    
    stub.style.display = 'none';
    content.style.display = 'block';
    content.innerHTML = `<p style="text-align:center;padding:40px;color:var(--text-secondary);">${getTranslatedText('loading')}</p>`;
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    let currentPeriod = 'day';
    let selectedUser = null;
    let fullData = null;
    
    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analytics?period=${currentPeriod}`, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            if (!response.ok) throw new Error(getTranslatedText('analytics_load_error'));
            fullData = await response.json();
            renderMobileAnalytics();
        } catch (error) {
            content.innerHTML = `<p style="color: var(--error-color);text-align:center;padding:40px;">${error.message}</p>`;
        }
    };
    
    const renderMobileAnalytics = () => {
        const texts = uiTexts[getLocalStorage('chaterlabLang', 'ru')];
        
        let html = `
            <div class="mobile-analytics-period">
                <button data-period="day" class="${currentPeriod === 'day' ? 'active' : ''}">${texts.periodDay}</button>
                <button data-period="week" class="${currentPeriod === 'week' ? 'active' : ''}">${texts.periodWeek}</button>
                <button data-period="month" class="${currentPeriod === 'month' ? 'active' : ''}">${texts.periodMonth}</button>
            </div>
        `;
        
        if (selectedUser) {
            const userData = fullData.employee_summary.find(e => e.username === selectedUser);
            const userLog = fullData.detailed_log.filter(log => log.username === selectedUser);
            const userTemplateCounts = userLog.reduce((acc, log) => {
                acc[log.button_id] = (acc[log.button_id] || 0) + 1;
                return acc;
            }, {});
            const topTemplateId = Object.keys(userTemplateCounts).sort((a, b) => userTemplateCounts[b] - userTemplateCounts[a])[0];
            const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—';
            
            html += `
                <button onclick="window.mobileAnalyticsBackToList()" style="margin:0 12px 16px;padding:10px;background:var(--background-card);border:1px solid var(--border-color);border-radius:12px;width:calc(100% - 24px);text-align:left;font-weight:600;color:var(--primary-blue);">← ${texts.employeeListTitle}</button>
                <h3 style="margin:0 12px 12px;font-size:18px;">${selectedUser}</h3>
                <div class="kpi-grid" style="padding:0 12px;">
                    <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${userData?.count || 0}</h3></div>
                    <div class="kpi-card"><p class="kpi-card-title">${texts.kpiFavTemplate}</p><h3 class="kpi-card-value" style="font-size:16px;">${topTemplateLabel}</h3></div>
                </div>
            `;
        } else {
            const totalClicks = fullData.detailed_log.length;
            const topEmployee = fullData.employee_summary?.[0]?.username || '—';
            const topTemplateId = fullData.template_summary?.[0]?.button_id;
            const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—';

            html += `
                <div class="kpi-grid" style="padding:0 12px;">
                    <div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${totalClicks}</h3></div>
                    <div class="kpi-card"><p class="kpi-card-title">${texts.kpiMostActive}</p><h3 class="kpi-card-value">${topEmployee}</h3></div>
                </div>
                <div class="kpi-card" style="margin:16px 12px;"><p class="kpi-card-title">${texts.kpiTopTemplate}</p><h3 class="kpi-card-value" style="font-size:18px;">${topTemplateLabel}</h3></div>
                <ul class="mobile-user-list">
            `;
            
            if (fullData.employee_summary && fullData.employee_summary.length > 0) {
                fullData.employee_summary.forEach(emp => {
                    html += `<li data-username="${emp.username}"><span class="username">${emp.username}</span><span class="count">${emp.count}</span></li>`;
                });
            }
            
            html += `</ul>`;
        }
        
        content.innerHTML = html;
        
        // Period buttons
        content.querySelectorAll('.mobile-analytics-period button').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPeriod = btn.dataset.period;
                fetchData();
            });
        });
        
        // User list
        content.querySelectorAll('.mobile-user-list li').forEach(li => {
            li.addEventListener('click', () => {
                selectedUser = li.dataset.username;
                renderMobileAnalytics();
            });
        });
    };
    
    const getButtonData = (buttonId) => {
        if (!appContent.layout) return { label: `(ID: ${buttonId})`, section: 'N/A' };
        for (const section of appContent.layout) {
            const button = section.buttons.find(b => b.id === buttonId);
            if (button) return { label: button.label, section: section.title };
        }
        return { label: `(ID: ${buttonId})`, section: 'N/A' };
    };
    
    window.mobileAnalyticsBackToList = () => {
        selectedUser = null;
        renderMobileAnalytics();
    };
    
    await fetchData();
}

function checkUserRoleAndSetupManagerUI() {
    if (userRole === 'manager') {
        if (isMobile()) {
            const openEditorBtn = document.getElementById('mobile-open-editor-btn');
            if (openEditorBtn) openEditorBtn.style.display = 'flex';
        } else {
            const managerControls = document.querySelector('.manager-controls-segmented');
            if (managerControls) managerControls.style.display = 'flex';
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
                    if (button.id === 'show-instructions-btn') switchManagerView('instructions');
                    if (button.id === 'show-schedule-btn') switchManagerView('schedule'); // <-- ИЗМЕНЕНИЕ (которое было)
                    if (button.id === 'show-analytics-btn') switchManagerView('analytics');
                    if (button.id === 'edit-mode-btn') switchManagerView('editor');
                });
            });
            
            const activeButton = document.querySelector('.manager-controls-segmented button.active');
            if (activeButton) {
                setTimeout(() => moveGlider(activeButton), 50);
            }

            function switchManagerView(view) {
                const schedulePanel = document.getElementById('schedule-panel'); // <-- ИЗМЕНЕНИЕ (которое было)
                mainContentPanel.style.display = 'none';
                if (analyticsPanel) analyticsPanel.style.display = 'none';
                if (schedulePanel) schedulePanel.style.display = 'none'; // <-- ИЗМЕНЕНИЕ (которое было)
                
                if (view === 'instructions' || view === 'editor') {
                    mainContentPanel.style.display = 'block';
                    if (view === 'instructions') {
                        hideContentEditor();
                    } else {
                        showContentEditor();
                    }
                } else if (view === 'analytics') {
                    if (analyticsPanel) analyticsPanel.style.display = 'block';
                    if (triggerAnalyticsLoad) triggerAnalyticsLoad();
                } else if (view === 'schedule') { // <-- ИЗМЕНЕНИЕ (которое было)
                    if (schedulePanel) schedulePanel.style.display = 'block';
                    fetchAndRenderSchedule(); // Обновляем при переключении
                }
            }
            
            const cancelBtn = document.getElementById('cancel-edit-btn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    const instructionButton = document.getElementById('show-instructions-btn');
                    if (instructionButton) instructionButton.click();
                });
            }
        }
    }
}

function setupAnalytics() {
    const mainPanel = document.getElementById('analytics-main');
    const employeeList = document.getElementById('employee-list');
    const periodSelector = document.querySelector('.analytics-period-selector');
    const analyticsPanel = document.getElementById('analytics-panel');
    
    if (!mainPanel || !employeeList || !periodSelector || !analyticsPanel) return;

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
        if (summary && summary.length > 0) {
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

// Desktop editor functions
function switchEditorTab(tabName) {
    document.querySelectorAll('.editor-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.editor-tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById(`panel-${tabName}`).classList.add('active');
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');
    
    // Call the correct function for each tab
    if (tabName === 'users') {
        fetchAndRenderUsers();
    } else if (tabName === 'managers') {
        buildManagerEditor();
    } else if (tabName === 'notifications') {
        renderNotificationsHistory();
    }
    
    applyTranslations();
}

function showContentEditor() { 
    document.getElementById('main-content-wrapper').style.display = 'block'; 
    document.getElementById('content-editor').style.display = 'block'; 
    document.getElementById('instructions').style.display = 'none'; 
    buildLayoutEditor(); 
    initInstructionsEditor(); 
    buildManagerEditor(); 
    switchEditorTab('layout'); 
}

function hideContentEditor() { 
    document.getElementById('main-content-wrapper').style.display = 'block'; 
    document.getElementById('content-editor').style.display = 'none'; 
    document.getElementById('instructions').style.display = 'block'; 
    destroyInstructionsEditor();
}

function buildLayoutEditor() { 
    const container = document.getElementById('panel-layout'); 
    if (!container) return; 
    while (container.firstChild && container.firstChild.id !== 'add-section-btn') { 
        container.removeChild(container.firstChild); 
    } 
    appContent.layout?.forEach(section => { 
        const sectionNode = createSectionEditor(section); 
        container.insertBefore(sectionNode, document.getElementById('add-section-btn')); 
    }); 
    applyTranslations(); 
}

function createSectionEditor(section) { 
    const sectionDiv = document.createElement('div'); 
    sectionDiv.className = 'editor-section'; 
    sectionDiv.dataset.id = section.id; 
    sectionDiv.innerHTML = `<div class="editor-section-header"><input type="text" class="section-title-input" value="${section.title}" data-key="sectionTitle" placeholder="Название раздела"><div class="editor-controls"><button class="delete-btn" data-key="deleteButtonTitle" title="Удалить раздел">🗑</button></div></div><div class="buttons-container"></div><button class="add-btn add-button-btn" data-key="addButton">+ Добавить кнопку в раздел</button>`; 
    const buttonsContainer = sectionDiv.querySelector('.buttons-container'); 
    section.buttons.forEach(button => { buttonsContainer.appendChild(createButtonEditor(button)); }); 
    sectionDiv.querySelector('.delete-btn').onclick = () => { if (confirm(getTranslatedText('deleteSectionConfirm'))) sectionDiv.remove(); }; 
    sectionDiv.querySelector('.add-button-btn').onclick = () => { const newButton = { id: generateId('btn_'), label: getTranslatedText('buttonLabel'), templates: ['Новый шаблон'] }; buttonsContainer.appendChild(createButtonEditor(newButton)); }; 
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
         applyTranslations();
    };

    buttonDiv.querySelector('.is-contact-btn-toggle').addEventListener('change', () => {
        const tempData = { ...button, manager_ids: [] }; 
        renderManagerAssignment(tempData);
    });
    
    renderManagerAssignment(button);
    
    return buttonDiv;
}

function createVariantInput(text) { 
    const variantDiv = document.createElement('div'); 
    variantDiv.className = 'template-variant'; 
    variantDiv.innerHTML = `<textarea>${text}</textarea><button class="delete-variant-btn" data-key="deleteVariantTitle" title="Удалить вариант">🗑</button>`; 
    variantDiv.querySelector('.delete-variant-btn').onclick = () => variantDiv.remove(); 
    return variantDiv; 
}

function addSection() { 
    const newSection = { id: generateId('sec_'), title: 'Новый раздел', buttons: [] }; 
    const sectionNode = createSectionEditor(newSection); 
    const container = document.getElementById('panel-layout'); 
    container.insertBefore(sectionNode, document.getElementById('add-section-btn')); 
    applyTranslations();
}

function initInstructionsEditor() {
    const selectors = ['#instructions-editor-ru', '#instructions-editor-en', '#instructions-editor-uk'];
    selectors.forEach(selector => {
        const textarea = $(selector);
        if (textarea.length && !textarea.hasClass('note-codable')) { // Initialize only if not already initialized
            textarea.summernote({
                height: 400,
                minHeight: 200,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
                    ['fontname', ['fontname']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']],
                    ['table', ['table']],
                    ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                callbacks: {
                    onInit: function() {
                        const langKey = this.id.split('-')[2];
                        const content = appContent.instructionsContent?.[langKey] || '';
                        $(this).summernote('code', content);
                    }
                }
            });
        }
    });
}

function destroyInstructionsEditor() {
    const selectors = ['#instructions-editor-ru', '#instructions-editor-en', '#instructions-editor-uk'];
    selectors.forEach(selector => {
        const textarea = $(selector);
        if (textarea.length && textarea.hasClass('note-codable')) { // Check if initialized
            textarea.summernote('destroy');
        }
    });
}

function buildManagerEditor() {
    const container = document.getElementById('panel-managers');
    const addButton = document.getElementById('add-manager-btn');
    if (!container || !addButton) return;
    
    // Clear previous entries but keep the add button
    while (container.firstChild && container.firstChild.id !== 'add-manager-btn') {
        container.removeChild(container.firstChild);
    }

    if (appContent.managers) {
        for (const [id, manager] of Object.entries(appContent.managers)) {
            container.insertBefore(createManagerEditorEntry(id, manager), addButton);
        }
    }
    addButton.onclick = addManagerEntry;
    applyTranslations();
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
    try {
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
            newInstructions[lang] = $(`#instructions-editor-${lang}`).summernote('code');
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
        
        // Return to instructions view after saving
        const instructionButton = document.getElementById('show-instructions-btn');
        if(instructionButton) instructionButton.click();

    } catch (error) {
        showToast(getTranslatedText(error.message || 'server_error_on_save'), true);
    }
}

async function fetchAndRenderUsers() {
    const listContainer = document.getElementById('user-list');
    if (!listContainer) return;
    listContainer.innerHTML = `<p>${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
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
                if (confirm(confirmMsg)) {
                    await deleteUser(userToDelete);
                }
            };
        });
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

    if (!userData.username || !userData.password) {
        showToast(getTranslatedText('missing_user_data'), true);
        return;
    }

    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
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
            if (section) section.classList.toggle('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // --- ИСПРАВЛЕНИЕ: Инициализация вынесена сюда ---
    // Эта строка теперь безопасна, так как DOM (и luxon из <head>) гарантированно загружены
    scheduleCurrentDate = luxon.DateTime.local().startOf('day');
    
    const initialLang = getLocalStorage('chaterlabLang', 'ru');
    switchLanguage(initialLang);
    
    document.querySelectorAll('#language-switcher-login button').forEach(button => { 
        button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); 
    });
    
    document.querySelectorAll('#language-switcher-app button').forEach(button => { 
        button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); 
    });
    
    checkLogin();
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    const addUserForm = document.getElementById('add-user-form');
    if (addUserForm) addUserForm.addEventListener('submit', createUser);

    const tabLayout = document.getElementById('tab-btn-layout');
    if (tabLayout) tabLayout.addEventListener('click', () => switchEditorTab('layout'));
    
    const tabInstructions = document.getElementById('tab-btn-instructions');
    if (tabInstructions) tabInstructions.addEventListener('click', () => switchEditorTab('instructions'));

    const tabManagers = document.getElementById('tab-btn-managers');
    if (tabManagers) tabManagers.addEventListener('click', () => switchEditorTab('managers'));

    const tabUsers = document.getElementById('tab-btn-users');
    if (tabUsers) tabUsers.addEventListener('click', () => switchEditorTab('users'));

    const tabNotifications = document.getElementById('tab-btn-notifications');
    if (tabNotifications) tabNotifications.addEventListener('click', () => switchEditorTab('notifications'));

    const saveBtn = document.getElementById('save-content-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveContent);

    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) addSectionBtn.addEventListener('click', addSection);
});


// --- ЛОГИКА МОДУЛЯ ГРАФИКА ВЫХОДНЫХ (НОВЫЙ КОД) ---

function setupScheduleCalendar() {
    // Привязка кнопок управления месяцем
    const targets = [
        { container: 'schedule-container', prev: 'schedule-prev-month', next: 'schedule-next-month', monthYear: 'schedule-month-year', legend: 'schedule-legend' },
        { container: 'mobile-schedule-container', prev: 'mobile-schedule-prev-month', next: 'mobile-schedule-next-month', monthYear: 'mobile-schedule-month-year', legend: 'mobile-schedule-legend' }
    ];

    targets.forEach(target => {
        const prevBtn = document.getElementById(target.prev);
        const nextBtn = document.getElementById(target.next);
        
        if(prevBtn) prevBtn.onclick = () => {
            scheduleCurrentDate = scheduleCurrentDate.minus({ months: 1 });
            fetchAndRenderSchedule();
        };
        
        if(nextBtn) nextBtn.onclick = () => {
            scheduleCurrentDate = scheduleCurrentDate.plus({ months: 1 });
            fetchAndRenderSchedule();
        };
    });

    fetchAndRenderSchedule(); // Теперь этот вызов безопасен
}

async function fetchAndRenderSchedule() {
    const start = scheduleCurrentDate.startOf('month').toISODate();
    const end = scheduleCurrentDate.endOf('month').toISODate();
    
    // Показываем лоадер
    renderScheduleUI(true, []);
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await fetch(`${API_BASE_URL}/api/days-off/schedule?start=${start}&end=${end}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        scheduleData = data;
        renderScheduleUI(false, scheduleData);
    } catch (error) {
        console.error("Failed to fetch schedule", error);
        showToast(getTranslatedText(error.message || 'server_error'), true);
        renderScheduleUI(false, [], getTranslatedText(error.message));
    }
}

function renderScheduleUI(isLoading, data, errorMsg = '') {
    const targets = [
        { container: 'schedule-container', monthYear: 'schedule-month-year', legend: 'schedule-legend' },
        { container: 'mobile-schedule-container', monthYear: 'mobile-schedule-month-year', legend: 'mobile-schedule-legend' }
    ];
    
    const monthName = scheduleCurrentDate.setLocale(getLocalStorage('chaterlabLang', 'ru')).toFormat('LLLL yyyy');
    
    targets.forEach(target => {
        const container = document.getElementById(target.container);
        const monthYearEl = document.getElementById(target.monthYear);
        const legendEl = document.getElementById(target.legend);

        if (!container || !monthYearEl || !legendEl) return;

        monthYearEl.textContent = monthName;

        // Очищаем старые дни (сохраняем заголовки)
        const dayHeaders = container.querySelectorAll('.schedule-day-header');
        container.innerHTML = '';
        dayHeaders.forEach(header => container.appendChild(header));

        if (isLoading) {
            container.innerHTML += `<div class="schedule-loader">${getTranslatedText('scheduleLoading')}</div>`;
            return;
        }
        
        if (errorMsg) {
             container.innerHTML += `<div class="schedule-loader" style="color:var(--error-color)">${errorMsg}</div>`;
            return;
        }

        const startOfMonth = scheduleCurrentDate.startOf('month');
        const firstDayOfWeek = startOfMonth.weekday; // 1 = Пн, 7 = Вс

        // Добавляем пустые ячейки для отступа
        for (let i = 1; i < firstDayOfWeek; i++) {
            container.appendChild(document.createElement('div'));
        }

        const daysInMonth = scheduleCurrentDate.daysInMonth;
        const jwtData = parseJwt(getLocalStorage('chaterlabAuthToken', ''));
        if (!jwtData) return; // Не можем работать без данных пользователя
        
        const myUserId = jwtData.id;
        const mySchedule = data.filter(d => (d.user_id || d.user?.id) === myUserId).map(d => d.date_off);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'schedule-day';
            
            const dayDate = scheduleCurrentDate.set({ day: day }).toISODate();
            dayEl.dataset.date = dayDate;
            
            let status = 'available';
            let label = '';
            
            const dayData = data.find(d => d.date_off === dayDate);

            if (userRole === 'manager') {
                // --- ЛОГИКА МЕНЕДЖЕРА ---
                dayEl.innerHTML = `<span>${day}</span>`;
                const usersOnDay = data.filter(d => d.date_off === dayDate);
                if (usersOnDay.length > 0) {
                    status = 'manager-occupied';
                    label = usersOnDay.map(d => d.user.username).join(', ');
                    dayEl.innerHTML += `<div class="schedule-day-label">${label}</div>`;
                    dayEl.dataset.users = JSON.stringify(usersOnDay);
                }
            } else {
                // --- ЛОГИКА СОТРУДНИКА ---
                dayEl.innerHTML = `<span>${day}</span>`;
                const [reqYear, reqWeek] = getWeekNumber(new Date(dayDate));
                const weekConflict = mySchedule.find(d => {
                    if (d === dayDate) return false;
                    const [dYear, dWeek] = getWeekNumber(new Date(d));
                    return dYear === reqYear && dWeek === reqWeek;
                });
                
                const dayBefore = luxon.DateTime.fromISO(dayDate).minus({ days: 1 }).toISODate();
                const dayAfter = luxon.DateTime.fromISO(dayDate).plus({ days: 1 }).toISODate();
                const consecutiveConflict = mySchedule.find(d => d === dayBefore || d === dayAfter);

                if (mySchedule.includes(dayDate)) {
                    status = 'my-day';
                } else if (dayData) { // Занято кем-то другим (из группы)
                    status = 'group-conflict';
                } else if (weekConflict || consecutiveConflict) {
                    status = 'rule-conflict';
                }
            }
            
            dayEl.classList.add(status);
            dayEl.onclick = handleDayClick;
            container.appendChild(dayEl);
        }
        
        // Рендер легенды
        if (userRole === 'manager') {
            legendEl.innerHTML = `
                <span class="legend-item available">${getTranslatedText('legendAvailable')}</span>
                <span class="legend-item manager-occupied">${getTranslatedText('legendManagerAll')}</span>
            `;
        } else {
             legendEl.innerHTML = `
                <span class="legend-item available">${getTranslatedText('legendAvailable')}</span>
                <span class="legend-item my-day">${getTranslatedText('legendMyDay')}</span>
                <span class="legend-item group-conflict">${getTranslatedText('legendGroupConflict')}</span>
                <span class="legend-item rule-conflict">${getTranslatedText('legendRuleConflict')}</span>
            `;
        }
    });
}

async function handleDayClick(event) {
    const dayEl = event.currentTarget;
    const date = dayEl.dataset.date;
    const status = dayEl.className;
    const token = getLocalStorage('chaterlabAuthToken', '');

    if (userRole === 'manager') {
        // --- ЛОГИКА КЛИКА МЕНЕДЖЕРА ---
        if (dayEl.dataset.users) {
            const usersOnDay = JSON.parse(dayEl.dataset.users);
            const userToDelete = usersOnDay[0]; // Для простоты удаляем первого
            const confirmMsg = getTranslatedText('deleteForUserConfirm', { username: userToDelete.user.username });
            
            if (confirm(confirmMsg)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/days-off/request`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ date: date, userId: userToDelete.user.id })
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.message);
                    showToast(getTranslatedText('dayOffDeleted'));
                    fetchAndRenderSchedule();
                } catch (error) {
                    showToast(getTranslatedText(error.message), true);
                }
            }
        }
        return; // Менеджер не может "выбирать" дни, только удалять
    }

    // --- ЛОГИКА КЛИКА СОТРУДНИКА ---
    if (status.includes('available')) {
        // Попытка забронировать
        try {
            const response = await fetch(`${API_BASE_URL}/api/days-off/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ date: date })
            });
            const result = await response.json();
            if (!response.ok) {
                // Используем ключ из ответа сервера для перевода
                const errorKey = `conflict_${result.reason}`;
                showToast(getTranslatedText(errorKey) || result.message, true);
            } else {
                showToast(getTranslatedText('OK')); // 'OK' - это просто успешный ответ, можно заменить на 'dayOffBooked'
                fetchAndRenderSchedule();
            }
        } catch (error) {
            showToast(getTranslatedText('server_error'), true);
        }
    } else if (status.includes('my-day')) {
        // Попытка удалить
        if (confirm(getTranslatedText('deleteDayOffConfirm'))) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/days-off/request`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ date: date })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                showToast(getTranslatedText('dayOffDeleted'));
                fetchAndRenderSchedule();
            } catch (error) {
                showToast(getTranslatedText(error.message), true);
            }
        }
    } else {
        // Клик по недоступному дню
        if(status.includes('group-conflict')) showToast(getTranslatedText('conflict_group_conflict'), true);
        if(status.includes('rule-conflict')) showToast(getTranslatedText('conflict_consecutive_day'), true);
    }
}

// Хелпер для парсинга JWT
function parseJwt (token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null; // Ошибка парсинга
    }
}

// Хелпер для календаря
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
};