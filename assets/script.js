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
        
        // --- ИЗМЕНЕНИЕ: Добавлена 'schedule' в список для кнопки "назад" ---
        backBtn.style.display = (screenName === 'analytics' || screenName === 'editor' || screenName === 'editor-info' || screenName === 'users-management' || screenName === 'schedule') ? 'flex' : 'none';
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const screenName = item.dataset.screen;
            switchScreen(screenName);
        });
    });
    
    backBtn.addEventListener('click', () => {
        // --- ИЗМЕНЕНИЕ: Кнопка "назад" теперь возвращает в МЕНЮ ---
        switchScreen('menu');
    });
    
    const editorInfoBtn = document.getElementById('mobile-editor-info-btn');
    const usersBtn = document.getElementById('mobile-users-btn');
    
    if (userRole === 'manager' || userRole === 'super_manager') {
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
        const response = await apiFetch(`${API_BASE_URL}/api/users`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const users = await response.json();
        if (!response.ok) throw new Error(users.message);
        
        listContainer.innerHTML = '';
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-list-item';
            let roleText = 'roleEmployee';
            if (user.role === 'manager') roleText = 'roleManager';
            else if (user.role === 'super_manager') roleText = 'roleSuperManager';
            roleText = getTranslatedText(roleText);
            const groupText = user.group ? `, Группа ${user.group}` : '';
            userDiv.innerHTML = `
                <div class="user-info">
                    <span class="username">${user.username}</span>
                    <span class="role">${roleText}${groupText}</span>
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
    
    // Добавляем группу, если есть поле выбора группы
    const groupSelect = form.querySelector('[data-field="group"]');
    if (groupSelect && groupSelect.value) {
        userData.group = parseInt(groupSelect.value);
    }

    if (!userData.username || !userData.password) {
        showToast(getTranslatedText('missing_user_data'), true);
        return;
    }

    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/users/create`, {
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
let userGroup = null;
let appContent = {};
let userName = null;
let userFavorites = [];

// --- ГЛОБАЛЬНАЯ ОБРАБОТКА ОШИБОК АВТОРИЗАЦИИ ---
// Обертка для fetch, которая автоматически обрабатывает ошибки авторизации
async function apiFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        // Проверяем статусы ошибок авторизации
        if (response.status === 401 || response.status === 403) {
            const data = await response.json().catch(() => ({}));
            const errorMessage = data.message || '';
            
            // Если это ошибка авторизации (invalid_token, access_denied, user_not_found и т.д.)
            if (errorMessage === 'invalid_token' || 
                errorMessage === 'access_denied' || 
                errorMessage === 'user_not_found' ||
                errorMessage === 'token_not_provided' ||
                response.status === 401 || 
                response.status === 403) {
                // Принудительный логаут
                logout();
                throw new Error(errorMessage || 'unauthorized');
            }
        }
        
        return response;
    } catch (error) {
        // Если это уже обработанная ошибка авторизации, пробрасываем дальше
        if (error.message === 'unauthorized' || 
            error.message === 'invalid_token' || 
            error.message === 'access_denied' || 
            error.message === 'user_not_found') {
            throw error;
        }
        
        // Для других ошибок просто пробрасываем
        throw error;
    }
}
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
        roleSuperManager: 'Супер-менеджер',
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
        schedule_future_blocked: 'Бронирование доступно только на 2 месяца вперед.', // НОВЫЙ

        analyticsNotAvailable: 'Аналитика доступна только менеджерам',
        headerSubtitle: 'Быстрые ответы',
        notificationsTitle: 'Оповещения',
        criticalAckBtn: 'Я ознакомлен',
        notificationsHistory: 'История оповещений',
        notifyTitleLabel: 'Заголовок',
        notifyBodyLabel: 'Текст',
        notifyCriticalLabel: 'Критическое оповещение',
        publishBtn: 'Опубликовать',
        tabNotifications: 'Оповещения',
        deleteNotification: 'Удалить оповещение',
        deleteNotificationConfirm: 'Вы уверены, что хотите удалить это оповещение?',
        notification_deactivated: 'Оповещение деактивировано',
        active: 'Активно',
        inactive: 'Неактивно',
        OK: 'OK',
        weekdayMon: 'Пн',
        weekdayTue: 'Вт',
        weekdayWed: 'Ср',
        weekdayThu: 'Чт',
        weekdayFri: 'Пт',
        weekdaySat: 'Сб',
        weekdaySun: 'Вс',
        addMyDayOff: 'Поставити свій вихідний',
        userLabel: 'Користувач:',
        startDateLabel: 'Дата початку:',
        endDateLabel: 'Дата закінчення:',
        blockDayLabel: 'Заблокувати день',
        dateLabel: 'Дата:',
        selectGroupLabel: 'Виберіть групу:',
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
        criticalAckBtn: 'Acknowledge',
        schedule_future_blocked: 'Booking is only available 2 months in advance.', // НОВЫЙ
        roleEmployee: 'Employee',
        roleManager: 'Manager',
        roleSuperManager: 'Super Manager',
        notificationsHistory: 'Notifications History',
        notifyTitleLabel: 'Title',
        notifyBodyLabel: 'Text',
        notifyCriticalLabel: 'Critical notification',
        publishBtn: 'Publish',
        tabNotifications: 'Notifications',
        deleteNotification: 'Delete notification',
        deleteNotificationConfirm: 'Are you sure you want to delete this notification?',
        notification_deactivated: 'Notification deactivated',
        active: 'Active',
        inactive: 'Inactive',
        OK: 'OK',
        legendAvailable: 'Available',
        legendMyDay: 'My day off',
        legendGroupConflict: 'Occupied (group)',
        legendRuleConflict: 'Conflict (rule)',
        legendManagerAll: 'Occupied (others)',
        conflict_group_conflict: 'This day is already taken by someone from your group.',
        conflict_weekly_limit: 'You have already chosen a day off this week.',
        conflict_consecutive_day: 'Cannot take two consecutive days off.',
        dayOffDeleted: 'Day off deleted.',
        deleteDayOffConfirm: 'Are you sure you want to delete this day off?',
        deleteForUserConfirm: 'Delete day off for user {username}?',
        pastDay: 'Past day',
        group1: 'Group 1',
        group2: 'Group 2',
        group1Other: 'Group 1 (other)',
        group2Other: 'Group 2 (other)',
        assignDayOff: 'Assign day off',
        selectEmployee: 'Select employee',
        selectGroup: 'Select group',
        allGroups: 'All groups',
        assignVacation: 'Assign vacation',
        blockDay: 'Block day for group',
        removeMyDayOff: 'Remove my day off',
        assignDayOffToEmployee: 'Assign day off to employee',
        removeDayOffFor: 'Remove day off for',
        assignVacationPeriod: 'Assign vacation for period',
        blockDayForGroup: 'Block day for group',
        selectStartDate: 'Select start date',
        selectEndDate: 'Select end date',
        selectBlockType: 'Select block type',
        errorLoadingEmployees: 'Error loading employees',
        errorLoadingUsers: 'Error loading users',
        dayOffAssigned: 'Day off assigned',
        dayOffAssignedTo: 'Day off assigned to user {username}',
        errorAssigningDayOff: 'Error assigning day off',
        errorDeletingDayOff: 'Error deleting day off',
        dayOffRemoved: 'Day off removed',
        dayOffRemovedFor: 'Day off removed for {username}',
        weekLimitMessage: 'You can only assign days off for the current and next week',
        weekdayMon: 'Mon',
        weekdayTue: 'Tue',
        weekdayWed: 'Wed',
        weekdayThu: 'Thu',
        weekdayFri: 'Fri',
        weekdaySat: 'Sat',
        weekdaySun: 'Sun',
        addMyDayOff: 'Add my day off',
        userLabel: 'User:',
        startDateLabel: 'Start date:',
        endDateLabel: 'End date:',
        blockDayLabel: 'Block day',
        dateLabel: 'Date:',
        selectGroupLabel: 'Select group:',
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
        criticalAckBtn: 'Ознайомлений',
        schedule_future_blocked: 'Бронювання доступне лише на 2 місяці вперед.', // НОВЫЙ
        roleEmployee: 'Співробітник',
        roleManager: 'Менеджер',
        roleSuperManager: 'Супер-менеджер',
        notificationsHistory: 'Історія сповіщень',
        notifyTitleLabel: 'Заголовок',
        notifyBodyLabel: 'Текст',
        notifyCriticalLabel: 'Критичне сповіщення',
        publishBtn: 'Опублікувати',
        tabNotifications: 'Сповіщення',
        deleteNotification: 'Видалити сповіщення',
        deleteNotificationConfirm: 'Ви впевнені, що хочете видалити це сповіщення?',
        notification_deactivated: 'Сповіщення деактивовано',
        active: 'Активно',
        inactive: 'Неактивно',
        OK: 'OK',
        legendAvailable: 'Доступно',
        legendMyDay: 'Мій вихідний',
        legendGroupConflict: 'Зайнято (група)',
        legendRuleConflict: 'Конфлікт (правило)',
        legendManagerAll: 'Зайнято (інші)',
        conflict_group_conflict: 'Цей день вже зайнятий кимось з вашої групи.',
        conflict_weekly_limit: 'Ви вже вибрали вихідний на цьому тижні.',
        conflict_consecutive_day: 'Не можна брати два вихідні дні підряд.',
        dayOffDeleted: 'Вихідний видалено.',
        deleteDayOffConfirm: 'Ви впевнені, що хочете видалити цей вихідний?',
        deleteForUserConfirm: 'Видалити вихідний для користувача {username}?',
        pastDay: 'Минулий день',
        group1: 'Група 1',
        group2: 'Група 2',
        group1Other: 'Група 1 (інша)',
        group2Other: 'Група 2 (інша)',
        assignDayOff: 'Призначити вихідний',
        selectEmployee: 'Виберіть співробітника',
        selectGroup: 'Виберіть групу',
        allGroups: 'Всі групи',
        assignVacation: 'Призначити відпустку',
        blockDay: 'Заблокувати день для групи',
        removeMyDayOff: 'Прибрати свій вихідний',
        assignDayOffToEmployee: 'Призначити вихідний співробітнику',
        removeDayOffFor: 'Видалити вихідний для',
        assignVacationPeriod: 'Призначити відпустку на період',
        blockDayForGroup: 'Заблокувати день для групи',
        selectStartDate: 'Виберіть дату початку',
        selectEndDate: 'Виберіть дату закінчення',
        selectBlockType: 'Виберіть тип блокування',
        errorLoadingEmployees: 'Помилка завантаження співробітників',
        errorLoadingUsers: 'Помилка завантаження користувачів',
        dayOffAssigned: 'Вихідний призначено',
        dayOffAssignedTo: 'Вихідний призначено користувачу {username}',
        errorAssigningDayOff: 'Помилка призначення вихідного',
        errorDeletingDayOff: 'Помилка видалення вихідного',
        dayOffRemoved: 'Вихідний видалено',
        dayOffRemovedFor: 'Вихідний видалено для {username}',
        weekLimitMessage: 'Ви можете призначати вихідні лише на поточний та наступний тиждень',
        weekdayMon: 'Пн',
        weekdayTue: 'Вт',
        weekdayWed: 'Ср',
        weekdayThu: 'Чт',
        weekdayFri: 'Пт',
        weekdaySat: 'Сб',
        weekdaySun: 'Нд',
        addMyDayOff: 'Поставить свой выходной',
        userLabel: 'Пользователь:',
        startDateLabel: 'Дата начала:',
        endDateLabel: 'Дата окончания:',
        blockDayLabel: 'Блокировать день',
        dateLabel: 'Дата:',
        selectGroupLabel: 'Выберите группу:',
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
    const res = await apiFetch(`${API_BASE_URL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data.notifications || [];
}

async function publishNotification(note) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await apiFetch(`${API_BASE_URL}/api/notifications/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(note) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return true;
}

async function markNotificationRead(notificationId) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    const res = await apiFetch(`${API_BASE_URL}/api/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ notification_id: notificationId }) });
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
    const res = await apiFetch(`${API_BASE_URL}/api/notifications/history`, { headers: { 'Authorization': `Bearer ${token}` } });
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
            div.className = 'history-item' + (n.is_critical ? ' critical' : '') + (n.is_active ? '' : ' inactive');
            const date = new Date(n.created_at).toLocaleString();
            const activeStatus = n.is_active ? getTranslatedText('active') : getTranslatedText('inactive');
            div.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                    <div style="flex:1;min-width:0">
                        <div class="title">${n.title || ''}</div>
                        <div class="meta">${date}${n.is_critical ? ' • critical' : ''} • ${activeStatus}</div>
                    </div>
                    ${n.is_active ? `<button class="delete-notification-btn" data-id="${n.id}" title="${getTranslatedText('deleteNotification')}">🗑</button>` : ''}
                </div>
            `;
            list.appendChild(div);
        });
        
        // Добавляем обработчики для кнопок удаления
        list.querySelectorAll('.delete-notification-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const notificationId = btn.dataset.id;
                if (confirm(getTranslatedText('deleteNotificationConfirm'))) {
                    try {
                        const token = getLocalStorage('chaterlabAuthToken', '');
                        const response = await apiFetch(`${API_BASE_URL}/api/notifications/deactivate`, {
                            method: 'PATCH',
                            headers: { 
                                'Content-Type': 'application/json', 
                                'Authorization': `Bearer ${token}` 
                            },
                            body: JSON.stringify({ notification_id: notificationId })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message);
                        
                        showToast(getTranslatedText('notification_deactivated'));
                        await renderNotificationsHistory(); // Обновляем список
                    } catch (error) {
                        showToast(getTranslatedText(error.message || 'server_error'), true);
                    }
                }
            });
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
        
        // Обновляем календарь при смене языка для корректного отображения групп
        if (scheduleCurrentDate) {
            fetchAndRenderSchedule();
        }
        // Recalculate segmented control glider after translated labels change width
        // --- ИЗМЕНЕНИЕ: Добавлена проверка на оба меню ---
        const managerControls = document.querySelector('div.manager-controls-segmented:not(#employee-controls-segmented)');
        if (managerControls) {
            const glider = managerControls.querySelector('.glider');
            const activeBtn = managerControls.querySelector('button.active');
            if (glider && activeBtn) {
                glider.style.width = `${activeBtn.offsetWidth}px`;
                glider.style.left = `${activeBtn.offsetLeft}px`;
            }
        }
        const employeeControls = document.querySelector('#employee-controls-segmented');
         if (employeeControls) {
            const glider = employeeControls.querySelector('.glider');
            const activeBtn = employeeControls.querySelector('button.active');
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
        // --- ИЗМЕНЕНИЕ: Проверяем токен на сервере перед показом приложения ---
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/auth/check`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) {
                // Токен невалиден или пользователь удален - принудительный логаут
                logout();
                return false;
            }
            
            const data = await response.json();
            if (!data.success) {
                logout();
                return false;
            }
            
            // Токен валиден, обновляем данные пользователя
            userRole = data.user.role;
            userName = data.user.username;
            setLocalStorage('chaterlabUserRole', data.user.role);
            setLocalStorage('chaterlabUserName', data.user.username);
            
        } catch (error) {
            // Ошибка сети или сервера - принудительный логаут
            console.error('Auth check error:', error);
            logout();
            return false;
        }
        
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
        
        if (userRole === 'manager' || userRole === 'super_manager') {
            statusText = userRole === 'super_manager' ? getTranslatedText('roleSuperManager') : texts.admin;
            accessText = texts.access;
            statusColor = userRole === 'super_manager' ? 'var(--error-color)' : 'var(--accent-purple)';
        } else {
            statusText = texts.worker;
            accessText = texts.noAccess;
            statusColor = 'var(--text-secondary)';
        }
        
        const hasAccess = userRole === 'manager' || userRole === 'super_manager';
        const groupText = userGroup ? `Группа ${userGroup}` : 'Без группы';
        cardElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">${texts.user}:</span><span style="font-weight: 700; color: var(--primary-blue);">${userName}</span></div><div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">${texts.status}:</span><span style="font-weight: 700; color: ${statusColor};">${statusText}</span></div><div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">Группа:</span><span style="font-weight: 700; color: var(--text-secondary);">${groupText}</span></div><div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; text-align: center;"><span style="color: ${hasAccess ? 'var(--success-color)' : 'var(--text-secondary)'}; font-weight: 500;">${accessText}</span></div>`;
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
        await apiFetch(`${API_BASE_URL}/api/track-click`, {
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
        const response = await apiFetch(`${API_BASE_URL}/api/favorites`, { 
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
        await apiFetch(`${API_BASE_URL}/api/favorites`, {
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
            const response = await apiFetch(`${API_BASE_URL}/api/analytics?period=${currentPeriod}`, { 
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
    if (userRole === 'manager' || userRole === 'super_manager') {
        if (isMobile()) {
            const openEditorBtn = document.getElementById('mobile-open-editor-btn');
            if (openEditorBtn) openEditorBtn.style.display = 'flex';
        } else {
            // --- ИСПРАВЛЕНИЕ: Используем более конкретный селектор ---
            const managerControls = document.querySelector('div.manager-controls-segmented:not(#employee-controls-segmented)');
            if (managerControls) managerControls.style.display = 'flex';
            
            const triggerAnalyticsLoad = setupAnalytics();
            
            // --- ИСПРАВЛЕНИЕ: Используем более конкретный селектор ---
            const buttons = document.querySelectorAll('div.manager-controls-segmented:not(#employee-controls-segmented) button');
            const glider = document.querySelector('div.manager-controls-segmented:not(#employee-controls-segmented) .glider');
            
            const mainContentPanel = document.getElementById('main-content-wrapper');
            const analyticsPanel = document.getElementById('analytics-panel');

            function moveGlider(target) {
                if (!glider || !target) return; // --- Добавлена проверка ---
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
            
            // --- ИСПРАВЛЕНИЕ: Используем более конкретный селектор ---
            const activeButton = document.querySelector('div.manager-controls-segmented:not(#employee-controls-segmented) button.active');
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
    } else { // --- НОВЫЙ БЛОК ELSE ДЛЯ СОТРУДНИКОВ ---
        // Это для 'employee'
        if (!isMobile()) {
            const employeeControls = document.getElementById('employee-controls-segmented');
            if (employeeControls) employeeControls.style.display = 'flex';

            const buttons = document.querySelectorAll('#employee-controls-segmented button');
            const glider = document.querySelector('#employee-controls-segmented .glider');
            
            const mainContentPanel = document.getElementById('main-content-wrapper');
            const schedulePanel = document.getElementById('schedule-panel');

            function moveEmployeeGlider(target) {
                if (!glider || !target) return;
                buttons.forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                glider.style.width = `${target.offsetWidth}px`;
                glider.style.left = `${target.offsetLeft}px`;
            }

            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    moveEmployeeGlider(e.currentTarget);
                    if (button.id === 'show-instructions-btn-employee') switchEmployeeView('instructions');
                    if (button.id === 'show-schedule-btn-employee') switchEmployeeView('schedule');
                });
            });

            const activeButton = document.querySelector('#employee-controls-segmented button.active');
            if (activeButton) {
                setTimeout(() => moveEmployeeGlider(activeButton), 50);
            }

            function switchEmployeeView(view) {
                // Сначала все прячем
                mainContentPanel.style.display = 'none';
                if (schedulePanel) schedulePanel.style.display = 'none';
                
                if (view === 'instructions') {
                    mainContentPanel.style.display = 'block';
                    // У сотрудника нет редактора, просто показываем инструкции
                    document.getElementById('content-editor').style.display = 'none'; 
                    document.getElementById('instructions').style.display = 'block';
                } else if (view === 'schedule') {
                    if (schedulePanel) schedulePanel.style.display = 'block';
                    fetchAndRenderSchedule(); // Обновляем при переключении
                }
            }
        }
    } // --- КОНЕЦ БЛОКА ELSE ---
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
            const response = await apiFetch(`${API_BASE_URL}/api/analytics?period=${currentPeriod}`, {
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
        loadGroupsForUserForm();
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
        
        const response = await apiFetch(`${API_BASE_URL}/update-content`, { 
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

async function loadGroupsForUserForm() {
    const groupSelect = document.getElementById('new-user-group');
    const mobileGroupSelect = document.getElementById('mobile-new-user-group');
    if (!groupSelect && !mobileGroupSelect) return;
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/groups`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        const groups = data.groups || [];
        
        // Обновляем десктопную форму
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">Без группы</option>';
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group;
                option.textContent = `Группа ${group}`;
                groupSelect.appendChild(option);
            });
        }
        
        // Обновляем мобильную форму
        if (mobileGroupSelect) {
            mobileGroupSelect.innerHTML = '<option value="">Без группы</option>';
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group;
                option.textContent = `Группа ${group}`;
                mobileGroupSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function fetchAndRenderUsers() {
    const listContainer = document.getElementById('user-list');
    if (!listContainer) return;
    listContainer.innerHTML = `<p>${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/users`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const users = await response.json();
        if (!response.ok) throw new Error(users.message);
        
        listContainer.innerHTML = '';
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-list-item';
            let roleText = 'roleEmployee';
            if (user.role === 'manager') roleText = 'roleManager';
            else if (user.role === 'super_manager') roleText = 'roleSuperManager';
            roleText = getTranslatedText(roleText);
            const groupText = user.group ? `, Группа ${user.group}` : '';
            userDiv.innerHTML = `
                <div class="user-info">
                    <span class="username">${user.username}</span>
                    <span class="role">${roleText}${groupText}</span>
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
    const groupSelect = document.getElementById('new-user-group');

    const userData = {
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
        role: roleSelect.value
    };
    
    // Добавляем группу, если выбрана
    if (groupSelect && groupSelect.value) {
        userData.group = parseInt(groupSelect.value);
    }

    if (!userData.username || !userData.password) {
        showToast(getTranslatedText('missing_user_data'), true);
        return;
    }

    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/users/create`, {
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
        if (groupSelect) groupSelect.value = '';
        fetchAndRenderUsers();
    } catch (error) {
        showToast(getTranslatedText(error.message), true);
    }
}

async function deleteUser(username) {
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/users/delete`, {
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
    scheduleCurrentDate = luxon.DateTime.local().startOf('month'); // <-- ИЗМЕНЕНИЕ: Начинаем с НАЧАЛА текущего месяца
    
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

// --- НОВАЯ ЖЕСТКАЯ ЛОГИКА: ОТПРАВНАЯ ТОЧКА ---
// Мы жестко задаем, что раньше этой даты ничего не существует
const SCHEDULE_START_DATE = luxon.DateTime.fromISO('2025-11-01').startOf('month');

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

    // Убедимся, что при первой загрузке мы не на прошлом месяце
    const now = luxon.DateTime.local().startOf('month');
    
    // Если текущая дата (сегодня) раньше, чем СТАРТ, то начинаем со СТАРТ
    if (now < SCHEDULE_START_DATE) {
        scheduleCurrentDate = SCHEDULE_START_DATE;
    } else {
        scheduleCurrentDate = now; // В нормальной ситуации начинаем с "сегодня"
    }
    // (Эта строка заменяет scheduleCurrentDate = luxon.DateTime.local().startOf('month'); в DOMContentLoaded)

    fetchAndRenderSchedule(); 
}

async function fetchAndRenderSchedule() {
    const start = scheduleCurrentDate.startOf('month').toISODate();
    const end = scheduleCurrentDate.endOf('month').toISODate();
    
    // Показываем лоадер
    renderScheduleUI(true, []);
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/schedule?start=${start}&end=${end}`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
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
        { container: 'schedule-container', monthYear: 'schedule-month-year', legend: 'schedule-legend', prev: 'schedule-prev-month', next: 'schedule-next-month' },
        { container: 'mobile-schedule-container', monthYear: 'mobile-schedule-month-year', legend: 'mobile-schedule-legend', prev: 'mobile-schedule-prev-month', next: 'mobile-schedule-next-month' }
    ];
    
    const monthName = scheduleCurrentDate.setLocale(getLocalStorage('chaterlabLang', 'ru')).toFormat('LLLL yyyy');
    
    targets.forEach(target => {
        const container = document.getElementById(target.container);
        const monthYearEl = document.getElementById(target.monthYear);
        const legendEl = document.getElementById(target.legend);
        // --- ИЗМЕНЕНИЕ: Получаем кнопки навигации ---
        const prevBtn = document.getElementById(target.prev);
        const nextBtn = document.getElementById(target.next);

        if (!container || !monthYearEl || !legendEl) return;

        // --- ИЗМЕНЕНИЕ: НОВАЯ ЖЕСТКАЯ ЛОГИКА НАВИГАЦИИ ---
        if (prevBtn && nextBtn) {
            const now = luxon.DateTime.local().startOf('month');
            
            // Правило "1 месяц назад":
            // 1. Берем "сегодня" (startOf('month'))
            // 2. Отнимаем 1 месяц.
            // 3. Выбираем БОЛЬШЕЕ из (полученной даты, ДАТЫ_СТАРТА)
            // Это гарантирует, что мы никогда не уйдем раньше СТАРТА
            const minMonth = luxon.DateTime.max(
                SCHEDULE_START_DATE, 
                now.minus({ months: 1 })
            );

            // Правило "2 месяца вперед":
            // 1. Берем "сегодня" (startOf('month'))
            // 2. Добавляем 2 месяца.
            const maxMonth = now.plus({ months: 2 }); 

            const currentMonthStart = scheduleCurrentDate.startOf('month');

            // Блокируем кнопку "назад"
            prevBtn.disabled = currentMonthStart <= minMonth;
            
            // Блокируем кнопку "вперед"
            nextBtn.disabled = currentMonthStart >= maxMonth;
        }
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

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
        const myGroup = jwtData.group || userGroup; // Получаем группу из токена или из переменной
        if (myGroup && !userGroup) userGroup = myGroup; // Сохраняем группу в переменную
        
        // --- ИЗМЕНЕНИЕ: Разная логика для mySchedule ---
        let mySchedule = [];
        if (userRole === 'manager' || userRole === 'super_manager') {
            // Менеджер и super_manager получают data с { user: {id: ...} }
            mySchedule = data.filter(d => d.user && d.user.id === myUserId).map(d => d.date_off);
        } else {
            // Сотрудник получает data с { user_id: ... } или { user: {id: ...} }
            mySchedule = data.filter(d => {
                if (d.user && d.user.id === myUserId) return true;
                if (d.user_id === myUserId) return true;
                return false;
            }).map(d => d.date_off);
        }
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        // --- ИЗМЕНЕНИЕ: Определяем "сегодня" ---
        const today = luxon.DateTime.local().startOf('day');
        // --- КОНЕЦ ИЗМЕНЕНИЯ ---

        // --- НОВАЯ ФУНКЦИЯ: Форматирование информации о пользователе ---
        const formatUserInfo = (user, useInitials = false) => {
            const username = user.user ? user.user.username : (user.user_id ? 'ID: ' + user.user_id : '???');
            const role = user.user ? user.user.role : '???';
            const group = user.user ? user.user.group : null;
            
            // Сокращения ролей
            let roleShort = '';
            if (role === 'super_manager') roleShort = 'SM';
            else if (role === 'manager') roleShort = 'M';
            else if (role === 'employee') roleShort = 'E';
            else roleShort = '?';
            
            // Имя или инициалы
            let nameDisplay = username;
            if (useInitials && username.length > 0) {
                nameDisplay = username.charAt(0).toUpperCase();
            }
            
            // Группа: показываем число или "—" если нет группы
            const groupText = group !== null && group !== undefined ? group : '—';
            return `${nameDisplay} (${roleShort}, ${groupText})`;
        };

        // --- НОВАЯ ФУНКЦИЯ: Форматирование списка пользователей для отображения ---
        const formatUsersList = (users, maxVisible = 2, useInitials = false) => {
            if (users.length === 0) return '';
            if (users.length <= maxVisible) {
                return users.map(u => formatUserInfo(u, useInitials)).join(', ');
            }
            const visible = users.slice(0, maxVisible);
            const remaining = users.length - maxVisible;
            return visible.map(u => formatUserInfo(u, useInitials)).join(', ') + `, +${remaining}`;
        };

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'schedule-day';
            
            // --- ИЗМЕНЕНИЕ: Получаем дату как объект Luxon ---
            const dayLuxon = scheduleCurrentDate.set({ day: day });
            const dayDate = dayLuxon.toISODate();
            dayEl.dataset.date = dayDate;

            // Правило: Проверяем, является ли день прошедшим
            // (ИЛИ раньше, чем наша ОТПРАВНАЯ ТОЧКА)
            const isPastDay = dayLuxon < today || dayLuxon < SCHEDULE_START_DATE.startOf('day');
            // --- КОНЕЦ ИЗМЕНЕНИЯ ---
            
            let status = 'available';
            let usersOnDay = data.filter(d => d.date_off === dayDate);
            const isMobileDevice = isMobile();
            const useInitials = isMobileDevice;
            
            // Определяем статус и цвет в зависимости от роли и группы
            if (usersOnDay.length > 0) {
                const myBooking = usersOnDay.find(d => {
                    if (d.user && d.user.id === myUserId) return true;
                    if (d.user_id === myUserId) return true;
                    return false;
                });
                
                if (myBooking) {
                    status = 'my-day';
                    // Добавляем класс группы для своего выходного
                    const myGroupValue = myBooking.user ? myBooking.user.group : myGroup;
                    if (myGroupValue === 1) {
                        dayEl.classList.add('group-1');
                    } else if (myGroupValue === 2) {
                        dayEl.classList.add('group-2');
                    }
                } else {
                    // Определяем группы всех пользователей
                    const userGroups = usersOnDay.map(u => u.user ? u.user.group : null).filter(g => g !== null);
                    const uniqueGroups = [...new Set(userGroups)];
                    const firstUser = usersOnDay[0];
                    const firstUserGroup = firstUser.user ? firstUser.user.group : null;
                    
                    // Проверяем, является ли день блокировкой (все пользователи одной группы и их 2+)
                    const isBlocked = uniqueGroups.length === 1 && usersOnDay.length >= 2;
                    
                    if (isBlocked) {
                        // Блокировка - специальный статус
                        status = 'blocked-day';
                        dayEl.classList.add('blocked');
                        if (uniqueGroups[0] === 1) {
                            dayEl.classList.add('blocked-group-1');
                        } else if (uniqueGroups[0] === 2) {
                            dayEl.classList.add('blocked-group-2');
                        }
                    } else if (userRole === 'manager' || userRole === 'super_manager') {
                        // Менеджеры видят все дни
                        status = 'manager-occupied';
                        // Цвет по группе первого пользователя (или приоритет группе 1, если смешанные)
                        // Если есть группа 1 - используем синий, иначе фиолетовый для группы 2
                        if (uniqueGroups.includes(1)) {
                            dayEl.classList.add('group-1');
                            status = 'manager-occupied'; // Синий цвет для группы 1
                        } else if (uniqueGroups.includes(2)) {
                            dayEl.classList.add('group-2');
                            status = 'manager-occupied'; // Фиолетовый цвет для группы 2
                        }
                    } else {
                        // Для сотрудников определяем статус по группе
                        // Проверяем, есть ли пользователи из нашей группы
                        const hasMyGroup = userGroups.includes(myGroup);
                        const isSuperManagerDay = usersOnDay.some(u => u.user && u.user.role === 'super_manager' && u.user.group === myGroup);
                        
                        if (isSuperManagerDay) {
                            status = 'group-conflict'; // Блокируется super_manager из своей группы
                        } else if (hasMyGroup) {
                            status = 'group-conflict'; // Своя группа - красный
                        } else {
                            status = 'other-group'; // Другая группа - фиолетовый по умолчанию
                            // Добавляем класс группы для цвета (приоритет группе 1)
                            if (uniqueGroups.includes(1)) {
                                dayEl.classList.add('group-1');
                                // Для группы 1 используем синий цвет вместо фиолетового
                            } else if (uniqueGroups.includes(2)) {
                                dayEl.classList.add('group-2');
                                // Для группы 2 используем фиолетовый цвет
                            }
                        }
                    }
                }
            } else {
                // Проверяем правила для сотрудников
                if (userRole !== 'manager' && userRole !== 'super_manager') {
                    const dayLuxonForWeek = luxon.DateTime.fromISO(dayDate);
                    const weekStart = dayLuxonForWeek.startOf('week');
                    const weekEnd = dayLuxonForWeek.endOf('week');
                    
                    const weekConflict = mySchedule.find(d => {
                        if (d === dayDate) return false;
                        const dLuxon = luxon.DateTime.fromISO(d);
                        return dLuxon >= weekStart && dLuxon <= weekEnd;
                    });
                    
                    const dayBefore = luxon.DateTime.fromISO(dayDate).minus({ days: 1 }).toISODate();
                    const dayAfter = luxon.DateTime.fromISO(dayDate).plus({ days: 1 }).toISODate();
                    const consecutiveConflict = mySchedule.find(d => d === dayBefore || d === dayAfter);
                    
                    if (weekConflict || consecutiveConflict) {
                        status = 'rule-conflict';
                    }
                }
            }
            
            // Прошедшие дни всегда недоступны (перекрывает все остальные статусы)
            if (isPastDay) {
                status = 'past-day';
            }
            
            // Формируем содержимое квадратика
            let dayContent = `<span class="schedule-day-number">${day}</span>`;
            
            if (usersOnDay.length > 0) {
                // Проверяем, является ли день блокировкой
                const userGroups = usersOnDay.map(u => u.user ? u.user.group : null).filter(g => g !== null);
                const uniqueGroups = [...new Set(userGroups)];
                const isBlocked = uniqueGroups.length === 1 && usersOnDay.length >= 2;
                
                if (isBlocked) {
                    // Для блокировки показываем специальную надпись
                    const groupNum = uniqueGroups[0];
                    dayContent += `<div class="schedule-day-blocked">🔒 Блокировка Г${groupNum}</div>`;
                } else {
                    // Показываем информацию о пользователях внутри квадратика
                    const maxVisible = isMobileDevice ? 2 : 3;
                    const usersText = formatUsersList(usersOnDay, maxVisible, useInitials);
                    dayContent += `<div class="schedule-day-users">${usersText}</div>`;
                }
                dayEl.dataset.users = JSON.stringify(usersOnDay);
            }
            
            dayEl.innerHTML = dayContent;
            
            dayEl.classList.add(status);
            
            // Для недоступных дней скрываем номер дня, показываем только крестик
            if (status === 'rule-conflict' || status === 'group-conflict' || status === 'past-day') {
                const numberEl = dayEl.querySelector('.schedule-day-number');
                if (numberEl) {
                    numberEl.style.opacity = '0.3';
                }
                const usersEl = dayEl.querySelector('.schedule-day-users');
                if (usersEl) {
                    usersEl.style.display = 'none';
                }
            }

            // --- НОВОЕ: Добавляем hover-информацию (tooltip) с полной информацией ---
            if (usersOnDay.length > 0) {
                const tooltipText = usersOnDay.map(d => formatUserInfo(d, false)).join('\n');
                dayEl.title = tooltipText;
            } else if (status === 'available') {
                dayEl.title = getTranslatedText('legendAvailable');
            } else if (status === 'rule-conflict') {
                dayEl.title = getTranslatedText('legendRuleConflict');
            } else if (status === 'past-day') {
                dayEl.title = getTranslatedText('pastDay');
            } else if (status === 'group-conflict') {
                dayEl.title = getTranslatedText('legendGroupConflict');
            }
            
            // --- ИЗМЕНЕНИЕ: Блокируем клики на прошедших днях ---
            if (isPastDay) {
                dayEl.classList.add('past-day');
                // Не добавляем .onclick, делая ячейку неактивной
            } else if (status === 'rule-conflict' || status === 'group-conflict') {
                // Недоступные дни также неактивны
                // Не добавляем .onclick
            } else {
                // Для мобильной версии: если день занят другими, показываем popup при клике
                if (isMobileDevice && usersOnDay.length > 0 && status !== 'my-day' && status !== 'available' && status !== 'other-group' && userRole !== 'super_manager') {
                    dayEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        showMobileDayPopup(dayDate, usersOnDay);
                    });
                } else {
                    // Для всех остальных случаев используем стандартный обработчик
                    dayEl.onclick = handleDayClick;
                }
            }
            // --- КОНЕЦ ИЗМЕНЕНИЯ ---
            
            container.appendChild(dayEl);
        }
        
        // Рендер легенды
        if (userRole === 'manager' || userRole === 'super_manager') {
            // --- ИЗМЕНЕНИЕ: Менеджер и super_manager теперь видят "Мой выходной" ---
            legendEl.innerHTML = `
                <span class="legend-item available">${getTranslatedText('legendAvailable')}</span>
                <span class="legend-item my-day">${getTranslatedText('legendMyDay')}</span>
                <span class="legend-item manager-occupied group-1">${getTranslatedText('group1')}</span>
                <span class="legend-item manager-occupied group-2">${getTranslatedText('group2')}</span>
            `;
            // --- КОНЕЦ ИЗМЕНЕНИЯ ---
        } else {
             legendEl.innerHTML = `
                <span class="legend-item available">${getTranslatedText('legendAvailable')}</span>
                <span class="legend-item my-day group-1">${getTranslatedText('legendMyDay')}</span>
                <span class="legend-item other-group group-1">${getTranslatedText('group1Other')}</span>
                <span class="legend-item other-group group-2">${getTranslatedText('group2Other')}</span>
                <span class="legend-item group-conflict">${getTranslatedText('legendGroupConflict')}</span>
                <span class="legend-item rule-conflict">${getTranslatedText('legendRuleConflict')}</span>
                <span class="legend-item past-day">${getTranslatedText('pastDay')}</span>
            `;
        }
    });
}

async function handleDayClick(event) {
    const dayEl = event.currentTarget;
    const date = dayEl.dataset.date;
    const status = dayEl.className;
    const token = getLocalStorage('chaterlabAuthToken', '');
    const myUserId = parseJwt(token)?.id;

    const dayLuxon = luxon.DateTime.fromISO(date);
    const today = luxon.DateTime.local().startOf('day');
    
    // --- ИЗМЕНЕНИЕ: Для сотрудников и менеджеров ограничение - только текущая и следующая неделя ---
    if (userRole !== 'super_manager') {
        const currentWeekStart = today.startOf('week');
        const nextWeekEnd = currentWeekStart.plus({ weeks: 2 }).endOf('week');
        
        if (dayLuxon < currentWeekStart || dayLuxon > nextWeekEnd) {
            showToast(getTranslatedText('weekLimitMessage'), true);
            return;
        }
    } else {
        // Для super_manager - ограничение 2 месяца вперед
        const now = luxon.DateTime.local().startOf('month');
        const maxMonth = now.plus({ months: 2 });
        
        if (dayLuxon.startOf('month') > maxMonth) {
            showToast(getTranslatedText('schedule_future_blocked'), true);
            return;
        }
    }
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    // --- НОВОЕ: Для супер-менеджеров показываем мини-меню при клике на любой день ---
    if (userRole === 'super_manager') {
        const usersData = dayEl.dataset.users ? JSON.parse(dayEl.dataset.users) : [];
        
        // Показываем меню на любом дне (кроме прошедших)
        if (!status.includes('past-day')) {
            event.stopPropagation();
            showSuperManagerMenu(date, dayEl, usersData, myUserId);
            return;
        }
    }

    // --- ИЗМЕНЕНИЕ: Полностью переписана логика ---

    // 1. Попытка забронировать (для всех: менеджер + сотрудник)
    // Также разрешаем бронирование дней другой группы (other-group)
    if (status.includes('available') || status.includes('other-group')) {
        try {
            const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`,
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({ date: date })
            });
            const result = await response.json();
            if (!response.ok) {
                let errorMessage = result.message;
                if (result.reason === 'week_limit') {
                    errorMessage = 'Вы можете назначать выходные только на текущую и следующую неделю';
                } else {
                    const errorKey = `conflict_${result.reason}`;
                    errorMessage = getTranslatedText(errorKey) || result.message;
                }
                showToast(errorMessage, true);
            } else {
                showToast(getTranslatedText('OK')); 
                // --- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Принудительно обновляем UI после успешного бронирования ---
                // Добавляем небольшую задержку, чтобы сервер успел обработать запрос
                setTimeout(() => {
                    fetchAndRenderSchedule();
                }, 100);
            }
        } catch (error) {
            showToast(getTranslatedText('server_error'), true);
        }

    // 2. Попытка удалить СВОЙ (для всех: менеджер + сотрудник)
    } else if (status.includes('my-day')) {
        if (confirm(getTranslatedText('deleteDayOffConfirm'))) {
            try {
                const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache'
                    },
                    body: JSON.stringify({ date: date }) // Сервер удалит по userId из токена
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                showToast(getTranslatedText('dayOffDeleted'));
                // --- ИСПРАВЛЕНИЕ: Обновляем UI после удаления ---
                setTimeout(() => {
                    fetchAndRenderSchedule();
                }, 100);
            } catch (error) {
                showToast(getTranslatedText(error.message), true);
            }
        }
    
    // 3. Попытка удалить ЧУЖОЙ (только для менеджера и super_manager)
    } else if ((userRole === 'manager' || userRole === 'super_manager') && (status.includes('manager-occupied') || status.includes('group-conflict') || status.includes('other-group'))) {
        if (dayEl.dataset.users) {
            const usersOnDay = JSON.parse(dayEl.dataset.users);
            // --- ИСПРАВЛЕНИЕ: Убедимся, что user.id существует (он вложен) ---
            const userToDelete = usersOnDay[0]; 
            const userIdToDelete = userToDelete.user?.id || userToDelete.user_id; // Используем user.id
            const usernameToDelete = userToDelete.user?.username || '???'; // Используем user.username
            // ---
            const confirmMsg = getTranslatedText('deleteForUserConfirm', { username: usernameToDelete });
            
            if (confirm(confirmMsg)) {
                try {
                    const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
                        method: 'DELETE',
                        headers: { 
                            'Content-Type': 'application/json', 
                            'Authorization': `Bearer ${token}`,
                            'Cache-Control': 'no-cache'
                        },
                        // ВАЖНО: передаем ID пользователя, которого хотим удалить
                        body: JSON.stringify({ date: date, userId: userIdToDelete }) 
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
    
    // 4. Клик по недоступному (для сотрудника)
    } else if (userRole !== 'manager') {
        if(status.includes('group-conflict')) showToast(getTranslatedText('conflict_group_conflict'), true);
        if(status.includes('rule-conflict')) showToast(getTranslatedText('conflict_consecutive_day'), true);
    }
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---
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

// --- НОВАЯ ФУНКЦИЯ: Показ popup для мобильной версии ---
function showMobileDayPopup(date, users) {
    // Создаем или получаем popup элемент
    let popup = document.getElementById('schedule-day-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'schedule-day-popup';
        popup.className = 'schedule-day-popup';
        document.body.appendChild(popup);
    }
    
    // Форматируем дату
    const dateObj = luxon.DateTime.fromISO(date);
    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    const dateFormatted = dateObj.setLocale(currentLang).toFormat('d MMMM yyyy');
    
    // Формируем список пользователей с полной информацией
    const usersList = users.map(u => {
        const username = u.user ? u.user.username : '???';
        const role = u.user ? u.user.role : '???';
        const group = u.user ? u.user.group : null;
        
        let roleText = '';
        if (role === 'super_manager') roleText = getTranslatedText('roleSuperManager');
        else if (role === 'manager') roleText = getTranslatedText('roleManager');
        else if (role === 'employee') roleText = getTranslatedText('roleEmployee');
        else roleText = '???';
        
        const groupText = group !== null && group !== undefined ? `, Группа ${group}` : '';
        return `<div class="popup-user-item">${username} (${roleText}${groupText})</div>`;
    }).join('');
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header">
                <h3>${dateFormatted}</h3>
                <button class="popup-close" onclick="closeScheduleDayPopup()">×</button>
            </div>
            <div class="popup-users-list">${usersList}</div>
        </div>
    `;
    
    popup.classList.add('show');
    
    // Закрытие по клику вне popup
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!popup.contains(e.target) && e.target !== popup) {
                closeScheduleDayPopup();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

function closeScheduleDayPopup() {
    const popup = document.getElementById('schedule-day-popup');
    if (popup) {
        popup.classList.remove('show');
    }
}

// --- НОВАЯ ФУНКЦИЯ: Показ мини-меню для супер-менеджеров ---
async function showSuperManagerMenu(date, dayEl, usersData, myUserId) {
    // Создаем или получаем меню элемент
    let menu = document.getElementById('super-manager-day-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'super-manager-day-menu';
        menu.className = 'super-manager-day-menu';
        document.body.appendChild(menu);
    }
    
    // Определяем позицию дня для позиционирования меню
    const rect = dayEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Проверяем, есть ли у пользователя выходной на этот день
    const myBooking = usersData.find(u => {
        const userId = u.user ? u.user.id : u.user_id;
        return userId === myUserId;
    });
    
    // Формируем список других пользователей
    const otherUsers = usersData.filter(u => {
        const userId = u.user ? u.user.id : u.user_id;
        return userId !== myUserId;
    });
    
    // Форматируем дату
    const dateObj = luxon.DateTime.fromISO(date);
    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    const dateFormatted = dateObj.setLocale(currentLang).toFormat('d MMMM yyyy');
    
    // Загружаем список всех пользователей для назначения выходного
    let allUsers = [];
    try {
        const token = getLocalStorage('chaterlabAuthToken', '');
        const response = await apiFetch(`${API_BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            allUsers = await response.json();
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    
    let menuContent = `
        <div class="menu-header">
            <h3>${dateFormatted}</h3>
            <button class="menu-close" onclick="closeSuperManagerMenu()">×</button>
        </div>
        <div class="menu-content">
    `;
    
    // Опция 1: Поставить/убрать свой выходной
    if (myBooking) {
        menuContent += `
            <button class="menu-item menu-item-danger" onclick="removeMyDayOff('${date}')">
                <span>${getTranslatedText('removeMyDayOff')}</span>
            </button>
        `;
    } else {
        menuContent += `
            <button class="menu-item menu-item-primary" onclick="addMyDayOff('${date}')">
                <span>${getTranslatedText('addMyDayOff')}</span>
            </button>
        `;
    }
    
    menuContent += `<div class="menu-divider"></div>`;
    
    // Опция 2: Назначить выходной другому пользователю (сначала группа, потом сотрудник)
    menuContent += `
        <button class="menu-item" onclick="showAssignDayOffDialog('${date}')">
            <span>${getTranslatedText('assignDayOffToEmployee')}</span>
        </button>
    `;
    
    // Опция 3: Удалить выходной других пользователей
    if (otherUsers.length > 0) {
        menuContent += `<div class="menu-divider"></div>`;
        menuContent += `<div class="menu-section-title">${getTranslatedText('removeDayOffFor')}:</div>`;
        otherUsers.forEach(user => {
            const username = user.user ? user.user.username : '???';
            const role = user.user ? user.user.role : '???';
            const group = user.user ? user.user.group : null;
            const userId = user.user ? user.user.id : user.user_id;
            
            let roleText = '';
            if (role === 'super_manager') roleText = ' (Супер-менеджер)';
            else if (role === 'manager') roleText = ' (Менеджер)';
            else if (role === 'employee') roleText = ' (Сотрудник)';
            
            const groupText = group ? `, Группа ${group}` : '';
            menuContent += `
                <button class="menu-item menu-item-danger" onclick="removeUserDayOff('${date}', '${userId}', '${username.replace(/'/g, "\\'")}')">
                    <span>${username}${roleText}${groupText}</span>
                </button>
            `;
        });
    }
    
    menuContent += `<div class="menu-divider"></div>`;
    
    // Опция 4: Назначить отпуск на период
    menuContent += `
        <button class="menu-item menu-item-vacation" onclick="showVacationDialog('${date}')">
            <span>📅 ${getTranslatedText('assignVacationPeriod')}</span>
        </button>
    `;
    
    // Опция 5: Блокировать день для группы
    menuContent += `
        <button class="menu-item menu-item-warning" onclick="showBlockDayDialog('${date}')">
            <span>🔒 ${getTranslatedText('blockDayForGroup')}</span>
        </button>
    `;
    
    menuContent += `</div>`;
    menu.innerHTML = menuContent;
    
    // Позиционируем меню с улучшенной логикой
    const isMobile = window.innerWidth <= 768;
    const menuWidth = isMobile ? Math.min(320, window.innerWidth - 20) : 320;
    menu.style.width = `${menuWidth}px`;
    
    // Ждем рендеринга для правильного расчета высоты
    await new Promise(resolve => setTimeout(resolve, 10));
    const menuHeight = menu.offsetHeight || 200;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    if (isMobile) {
        // На мобильных центрируем меню
        menu.style.left = '50%';
        menu.style.top = '50%';
        menu.style.transform = 'translate(-50%, -50%) scale(0.95)';
    } else {
        // На десктопе позиционируем относительно дня с учетом границ экрана
        let left = rect.left + scrollLeft + (rect.width / 2) - (menuWidth / 2);
        let top = rect.bottom + scrollTop + 8;
        
        // Проверяем горизонтальные границы
        if (left < 10) left = 10;
        if (left + menuWidth > viewportWidth - 10) {
            left = viewportWidth - menuWidth - 10;
        }
        
        // Проверяем вертикальные границы - если не помещается снизу, показываем сверху
        const spaceBelow = viewportHeight + scrollTop - (rect.bottom + scrollTop);
        const spaceAbove = rect.top + scrollTop;
        
        if (spaceBelow < menuHeight + 20 && spaceAbove > menuHeight + 20) {
            // Показываем сверху
            top = rect.top + scrollTop - menuHeight - 8;
        } else if (spaceBelow < menuHeight + 20) {
            // Если не помещается ни сверху, ни снизу - центрируем вертикально
            top = Math.max(10, (viewportHeight - menuHeight) / 2 + scrollTop);
        }
        
        // Дополнительная проверка, чтобы меню не выходило за верхнюю границу
        if (top < scrollTop + 10) {
            top = scrollTop + 10;
        }
        
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
        menu.style.transform = 'scale(0.95)';
    }
    
    menu.classList.add('show');
    
    // Обновляем transform после показа
    setTimeout(() => {
        if (isMobile) {
            menu.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
            menu.style.transform = 'scale(1)';
        }
    }, 10);
    
    // Закрытие по клику вне меню
    setTimeout(() => {
        const closeHandler = (e) => {
            if (!menu.contains(e.target) && e.target !== menu) {
                closeSuperManagerMenu();
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }, 100);
}

function closeSuperManagerMenu() {
    const menu = document.getElementById('super-manager-day-menu');
    if (menu) {
        menu.classList.remove('show');
    }
}

// Функции для действий меню
async function addMyDayOff(date) {
    closeSuperManagerMenu();
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ date: date })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при добавлении выходного');
        }
        showToast(getTranslatedText('dayOffAssigned'));
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при добавлении выходного', true);
    }
}

async function removeMyDayOff(date) {
    closeSuperManagerMenu();
    const token = getLocalStorage('chaterlabAuthToken', '');
    const myUserId = parseJwt(token)?.id;
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ date: date, userId: myUserId })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при удалении выходного');
        }
        showToast(getTranslatedText('dayOffRemoved'));
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при удалении выходного', true);
    }
}

async function removeUserDayOff(date, userId, username) {
    closeSuperManagerMenu();
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/request`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ date: date, userId: userId })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при удалении выходного');
        }
        showToast(`Выходной ${username} успешно удален`);
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при удалении выходного', true);
    }
}

// Показать диалог для назначения выходного (сначала группа, потом сотрудник)
function showAssignDayOffDialog(date) {
    closeSuperManagerMenu();
    
    let dialog = document.getElementById('assign-dayoff-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'assign-dayoff-dialog';
        dialog.className = 'vacation-dialog';
        document.body.appendChild(dialog);
    }
    
    const dateObj = luxon.DateTime.fromISO(date);
    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    const dateFormatted = dateObj.setLocale(currentLang).toFormat('d MMMM yyyy');
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>${getTranslatedText('assignDayOff')}</h3>
                <button class="dialog-close" onclick="closeAssignDayOffDialog()">×</button>
            </div>
            <div class="dialog-body">
                <p>${getTranslatedText('dateLabel')} <strong>${dateFormatted}</strong></p>
                <div class="form-group">
                    <label>${getTranslatedText('selectGroupLabel')}:</label>
                    <select id="assign-group-select" class="form-input" onchange="updateAssignUserList('${date}')">
                        <option value="">-- ${getTranslatedText('selectGroupLabel')} --</option>
                        <option value="1">${getTranslatedText('group1')}</option>
                        <option value="2">${getTranslatedText('group2')}</option>
                    </select>
                </div>
                <div class="form-group" id="assign-user-group" style="display: none;">
                    <label>${getTranslatedText('selectEmployee')}:</label>
                    <select id="assign-user-select" class="form-input">
                        <option value="">-- ${getTranslatedText('selectEmployee')} --</option>
                    </select>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" onclick="closeAssignDayOffDialog()">${getTranslatedText('cancel')}</button>
                <button class="btn btn-primary" onclick="assignDayOffFromDialog('${date}')" disabled id="assign-submit-btn">${getTranslatedText('assignDayOff')}</button>
            </div>
        </div>
    `;
    
    dialog.classList.add('show');
    dialog.dataset.date = date;
}

function closeAssignDayOffDialog() {
    const dialog = document.getElementById('assign-dayoff-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
}

// Обновить список сотрудников при выборе группы
async function updateAssignUserList(date) {
    const groupSelect = document.getElementById('assign-group-select');
    const userGroup = document.getElementById('assign-user-group');
    const userSelect = document.getElementById('assign-user-select');
    const submitBtn = document.getElementById('assign-submit-btn');
    
    const selectedGroup = groupSelect.value;
    
    if (!selectedGroup) {
        userGroup.style.display = 'none';
        userSelect.innerHTML = `<option value="">-- ${getTranslatedText('selectEmployee')} --</option>`;
        submitBtn.disabled = true;
        return;
    }
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        // Получаем данные о выходных на эту дату
        const scheduleResponse = await apiFetch(`${API_BASE_URL}/api/days-off/schedule?start=${date}&end=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const scheduleData = await scheduleResponse.json();
        const usersWithDayOff = scheduleData.map(d => d.user ? d.user.id : d.user_id);
        
        // Фильтруем пользователей по группе и исключаем тех, у кого уже есть выходной
        const groupUsers = users.filter(u => 
            u.group == selectedGroup && 
            !usersWithDayOff.includes(u.id) &&
            u.role !== 'super_manager' // Исключаем super_manager из списка
        );
        
        userSelect.innerHTML = `<option value="">-- ${getTranslatedText('selectEmployee')} --</option>`;
        groupUsers.forEach(user => {
            let roleText = '';
            if (user.role === 'manager') roleText = ' (Менеджер)';
            else if (user.role === 'employee') roleText = ' (Сотрудник)';
            
            userSelect.innerHTML += `<option value="${user.id}">${user.username}${roleText}</option>`;
        });
        
        userGroup.style.display = groupUsers.length > 0 ? 'block' : 'none';
        submitBtn.disabled = groupUsers.length === 0 || !userSelect.value;
        
        // Обновляем кнопку при выборе сотрудника
        userSelect.onchange = () => {
            submitBtn.disabled = !userSelect.value;
        };
    } catch (error) {
        showToast(getTranslatedText('errorLoadingEmployees'), true);
    }
}

// Назначить выходной из диалога
async function assignDayOffFromDialog(date) {
    const userId = document.getElementById('assign-user-select').value;
    
    if (!userId) {
        showToast(getTranslatedText('selectEmployee'), true);
        return;
    }
    
    closeAssignDayOffDialog();
    const token = getLocalStorage('chaterlabAuthToken', '');
    
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/assign`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ date: date, userId: userId })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при назначении выходного');
        }
        showToast(getTranslatedText('dayOffAssigned'));
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при назначении выходного', true);
    }
}

// Назначить выходной другому пользователю (старая функция для обратной совместимости)
async function assignDayOffToUser(date, userId, username) {
    closeSuperManagerMenu();
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/assign`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ date: date, userId: userId })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при назначении выходного');
        }
        showToast(`Выходной успешно назначен пользователю ${username}`);
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при назначении выходного', true);
    }
}

// Показать диалог для назначения отпуска
function showVacationDialog(startDate) {
    closeSuperManagerMenu();
    
    // Создаем диалог
    let dialog = document.getElementById('vacation-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'vacation-dialog';
        dialog.className = 'vacation-dialog';
        document.body.appendChild(dialog);
    }
    
    // Загружаем список пользователей
    const token = getLocalStorage('chaterlabAuthToken', '');
    apiFetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(response => response.json()).then(users => {
        const dateObj = luxon.DateTime.fromISO(startDate);
        const currentLang = getLocalStorage('chaterlabLang', 'ru');
        const startDateFormatted = dateObj.setLocale(currentLang).toFormat('d MMMM yyyy');
        const endDateFormatted = dateObj.plus({ days: 6 }).setLocale(currentLang).toFormat('d MMMM yyyy');
        
        let usersOptions = users.map(u => {
            let roleText = '';
            if (u.role === 'super_manager') roleText = ' (Супер-менеджер)';
            else if (u.role === 'manager') roleText = ' (Менеджер)';
            else if (u.role === 'employee') roleText = ' (Сотрудник)';
            const groupText = u.group ? `, Группа ${u.group}` : '';
            return `<option value="${u.id}">${u.username}${roleText}${groupText}</option>`;
        }).join('');
        
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>${getTranslatedText('assignVacation')}</h3>
                    <button class="dialog-close" onclick="closeVacationDialog()">×</button>
                </div>
                <div class="dialog-body">
                    <div class="form-group">
                        <label>${getTranslatedText('userLabel')}</label>
                        <select id="vacation-user-select" class="form-input">
                            ${usersOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${getTranslatedText('startDateLabel')}</label>
                        <input type="date" id="vacation-start-date" class="form-input" value="${startDate}">
                    </div>
                    <div class="form-group">
                        <label>${getTranslatedText('endDateLabel')}</label>
                        <input type="date" id="vacation-end-date" class="form-input" value="${dateObj.plus({ days: 6 }).toISODate()}">
                    </div>
                </div>
                <div class="dialog-footer">
                    <button class="btn btn-secondary" onclick="closeVacationDialog()">${getTranslatedText('cancel')}</button>
                    <button class="btn btn-primary" onclick="assignVacation()">${getTranslatedText('assignVacation')}</button>
                </div>
            </div>
        `;
        
        dialog.classList.add('show');
    }).catch(error => {
        showToast(getTranslatedText('errorLoadingUsers'), true);
    });
}

function closeVacationDialog() {
    const dialog = document.getElementById('vacation-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
}

// Назначить отпуск
async function assignVacation() {
    const userId = document.getElementById('vacation-user-select').value;
    const startDate = document.getElementById('vacation-start-date').value;
    const endDate = document.getElementById('vacation-end-date').value;
    
    if (!userId || !startDate || !endDate) {
        showToast('Заполните все поля', true);
        return;
    }
    
    if (startDate > endDate) {
        showToast('Дата начала не может быть позже даты окончания', true);
        return;
    }
    
    closeVacationDialog();
    const token = getLocalStorage('chaterlabAuthToken', '');
    
    try {
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/vacation`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                userId: userId, 
                startDate: startDate, 
                endDate: endDate 
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при назначении отпуска');
        }
        showToast('Отпуск успешно назначен');
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при назначении отпуска', true);
    }
}

// Показать диалог для блокировки дня
function showBlockDayDialog(date) {
    closeSuperManagerMenu();
    
    let dialog = document.getElementById('block-day-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'block-day-dialog';
        dialog.className = 'vacation-dialog';
        document.body.appendChild(dialog);
    }
    
    const dateObj = luxon.DateTime.fromISO(date);
    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    const dateFormatted = dateObj.setLocale(currentLang).toFormat('d MMMM yyyy');
    
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>${getTranslatedText('blockDayLabel')}</h3>
                <button class="dialog-close" onclick="closeBlockDayDialog()">×</button>
            </div>
            <div class="dialog-body">
                <p>${getTranslatedText('blockDayLabel')} <strong>${dateFormatted}</strong> ${getTranslatedText('selectGroupLabel').toLowerCase()}:</p>
                <div class="form-group">
                    <label>
                        <input type="radio" name="block-type" value="group-1" checked>
                        ${getTranslatedText('group1')}
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="radio" name="block-type" value="group-2">
                        ${getTranslatedText('group2')}
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="radio" name="block-type" value="all">
                        ${getTranslatedText('allGroups')}
                    </label>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn btn-secondary" onclick="closeBlockDayDialog()">${getTranslatedText('cancel')}</button>
                <button class="btn btn-warning" onclick="blockDay('${date}')">${getTranslatedText('blockDay')}</button>
            </div>
        </div>
    `;
    
    dialog.classList.add('show');
}

function closeBlockDayDialog() {
    const dialog = document.getElementById('block-day-dialog');
    if (dialog) {
        dialog.classList.remove('show');
    }
}

// Заблокировать день для группы
async function blockDay(date) {
    const blockType = document.querySelector('input[name="block-type"]:checked').value;
    closeBlockDayDialog();
    
    const token = getLocalStorage('chaterlabAuthToken', '');
    
    try {
        // Используем специальный API для блокировки
        const response = await apiFetch(`${API_BASE_URL}/api/days-off/block`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ 
                date: date, 
                blockType: blockType 
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Ошибка при блокировке дня');
        }
        const blockTypeText = blockType === 'all' ? 'всех групп' : blockType === 'group-1' ? 'группы 1' : 'группы 2';
        showToast(`День успешно заблокирован для ${blockTypeText}`);
        fetchAndRenderSchedule();
    } catch (error) {
        showToast(error.message || 'Ошибка при блокировке дня', true);
    }
}