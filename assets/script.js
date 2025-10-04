"use strict";
const API_BASE_URL = 'https://backendchater.fly.dev';
let userRole = null;
let appContent = {};
let userName = null;
let userFavorites = [];
const isMobile = () => window.matchMedia("(max-width: 768px)").matches;

// ДОБАВЛЕНО: Новые ключи для мобильного интерфейса
const uiTexts = {
    ru: {
        // ... старые ключи ...
        navTemplates: 'Шаблоны',
        navMenu: 'Меню',
        backToMenu: 'Назад',
        analyticsOnlyForManagers: 'Аналитика доступна только менеджерам',
        openEditor: 'Открыть редактор',
        manager: 'Менеджер',
        employee: 'Сотрудник',
        // ... остальные ключи без изменений ...
        lang_locale: 'ru', loginHeader: 'ChaterLab', loginSubheader: 'Панель быстрых ответов', loginUsername: 'Логин', loginPassword: 'Пароль', loginBtn: 'Войти', searchPlaceholder: '🔎 Поиск по шаблонам...', favoritesTitle: '⭐ Избранное', darkMode: 'Тёмная тема', logout: 'Выйти', navInstructions: 'Инструкция', navAnalytics: 'Аналитика', navEditor: 'Редактор', mobileAdminTitle: 'Админ-панель', editorUnavailable: 'Редактор', editorUnavailableMsg: 'Полноценное редактирование доступно только в версии сайта для ПК.', tabLayout: 'Конструктор кнопок', tabInstructions: 'Инструкция', tabManagers: 'Менеджеры', tabUsers: 'Пользователи', addUserTitle: 'Добавить нового пользователя', newUserUsername: 'Логин', newUserPassword: 'Пароль', roleEmployee: 'Сотрудник', roleManager: 'Менеджер', addUserBtn: 'Создать', existingUsersTitle: 'Существующие пользователи', deleteUserBtn: 'Удалить', deleteUserConfirm: 'Вы уверены, что хотите удалить пользователя {username}?', addManager: '+ Добавить менеджера', managerNamePlaceholder: 'Имя менеджера (для списка)', managerTelegramPlaceholder: 'Telegram контакт (@username)', managerWhatsappPlaceholder: 'WhatsApp контакт (+7123456)', deleteManagerTitle: 'Удалить менеджера', managerAssignmentTitle: 'Доступные менеджеры для этой кнопки', isContactButtonLabel: 'Сделать кнопкой "Контакт"', saveAll: 'Сохранить всё', cancel: 'Отмена', addSection: '+ Добавить новый раздел', addButton: '+ Добавить кнопку в раздел', addVariant: '+ Добавить вариант', sectionTitle: 'Название раздела', buttonLabel: 'Название кнопки', deleteSectionConfirm: 'Удалить этот раздел со всеми кнопками?', deleteButtonTitle: 'Удалить раздел', deleteButtonEntryTitle: 'Удалить кнопку', deleteVariantTitle: 'Удалить вариант', instructionTitleRu: 'Инструкция (RU)', instructionTitleEn: 'Инструкция (EN)', instructionTitleUk: 'Инструкция (UA)', analyticsTitle: 'Аналитика', periodDay: 'День', periodWeek: 'Неделя', periodMonth: 'Месяц', employeeListTitle: 'Общая статистика', overallSummaryHeader: 'Общая статистика', overallSummarySubheader: 'Сводный отчет по активности всей команды.', kpiTotalClicks: 'Всего действий', kpiMostActive: 'Самый активный', kpiTopTemplate: 'Топ шаблон', kpiPeakTime: 'Пик активности (UTC)', top5Employees: 'Топ-5 Сотрудников', top5Templates: 'Топ-5 Шаблонов', tableEmployee: 'Сотрудник', tableActions: 'Действий', tableTemplate: 'Шаблон', tableUses: 'Использований', userDetailHeader: 'Статистика:', userDetailSubheader: 'Детальный отчет по активности выбранного сотрудника.', kpiLastActivity: 'Последняя активность', kpiFavTemplate: 'Любимый шаблон', activityFeedTitle: 'Лента активности (последние 100 действий)', tableTime: 'Время', tableSection: 'Раздел', noData: 'Нет данных за этот период.', loading: 'Загрузка...', modalTitle: 'Создание контакта', modalChannelTitle: '1. Выберите канал связи', modalManagerTitle: '2. Выберите менеджера', modalCancel: 'Отмена', modalConfirm: 'Сгенерировать и скопировать', modalError: 'Пожалуйста, выберите канал и менеджера.', username_and_password_required: 'Необходимо указать имя пользователя и пароль.', invalid_credentials: 'Неверные данные.', server_error: 'Ошибка на сервере.', content_not_found: 'Контент не найден.', content_read_error: 'Ошибка при чтении контента.', invalid_token: 'Неверный токен.', access_denied: 'Доступ запрещен.', content_updated_successfully: 'Контент успешно обновлен!', server_error_on_save: 'Ошибка на сервере при сохранении.', user_not_found: 'Пользователь не найден.', invalid_data_format: 'Неверный формат данных.', favorites_updated: 'Избранное обновлено.', button_id_not_specified: 'Не указан ID кнопки.', click_tracking_error: 'Ошибка при записи клика.', analytics_db_error: 'Ошибка при получении аналитики из БД.', analytics_server_error: 'Ошибка на сервере при получении аналитики.', analytics_load_error: 'Ошибка загрузки статистики', no_templates_for_button: 'Нет шаблонов для этой кнопки', copy_success: 'Скопировано ({current}/{total})', copy_success_generic: 'Текст успешно скопирован!', favorites_load_error: 'Не удалось загрузить избранное', favorites_save_error: 'Ошибка сохранения избранного', missing_user_data: 'Необходимо указать имя пользователя и пароль.', invalid_role: 'Неверная роль пользователя.', user_created_successfully: 'Пользователь успешно создан!', user_already_exists: 'Пользователь с таким именем уже существует.', server_error_creating_user: 'Ошибка на сервере при создании пользователя.', username_not_provided: 'Не указано имя пользователя для удаления.', cannot_delete_self: 'Нельзя удалить самого себя.', user_deleted_successfully: 'Пользователь успешно удален!', server_error_deleting_user: 'Ошибка на сервере при удалении пользователя.', server_error_fetching_users: 'Ошибка на сервере при получении списка пользователей.'
    },
    en: {
        // ... старые ключи ...
        navTemplates: 'Templates',
        navMenu: 'Menu',
        backToMenu: 'Back',
        analyticsOnlyForManagers: 'Analytics is available only for managers',
        openEditor: 'Open Editor',
        manager: 'Manager',
        employee: 'Employee',
        // ... остальные ключи без изменений ...
        lang_locale: 'en', loginHeader: 'ChaterLab', loginSubheader: 'Quick Replies Panel', loginUsername: 'Username', loginPassword: 'Password', loginBtn: 'Login', searchPlaceholder: '🔎 Search templates...', favoritesTitle: '⭐ Favorites', darkMode: 'Dark Mode', logout: 'Logout', navInstructions: 'Instructions', navAnalytics: 'Analytics', navEditor: 'Editor', mobileAdminTitle: 'Admin Panel', editorUnavailable: 'Editor', editorUnavailableMsg: 'Full editing is only available on the desktop version of the site.', tabLayout: 'Button Builder', tabInstructions: 'Instructions', tabManagers: 'Managers', tabUsers: 'Users', addUserTitle: 'Add New User', newUserUsername: 'Username', newUserPassword: 'Password', roleEmployee: 'Employee', roleManager: 'Manager', addUserBtn: 'Create', existingUsersTitle: 'Existing Users', deleteUserBtn: 'Delete', deleteUserConfirm: 'Are you sure you want to delete user {username}?', addManager: '+ Add Manager', managerNamePlaceholder: 'Manager Name (for the list)', managerTelegramPlaceholder: 'Telegram contact (@username)', managerWhatsappPlaceholder: 'WhatsApp contact (+123456)', deleteManagerTitle: 'Delete Manager', managerAssignmentTitle: 'Available Managers for this Button', isContactButtonLabel: 'Make "Contact" button', saveAll: 'Save All', cancel: 'Cancel', addSection: '+ Add New Section', addButton: '+ Add Button to Section', addVariant: '+ Add Variant', sectionTitle: 'Section Title', buttonLabel: 'Button Label', deleteSectionConfirm: 'Delete this section with all buttons?', deleteButtonTitle: 'Delete Section', deleteButtonEntryTitle: 'Delete Button', deleteVariantTitle: 'Delete Variant', instructionTitleRu: 'Instructions (RU)', instructionTitleEn: 'Instructions (EN)', instructionTitleUk: 'Instructions (UA)', analyticsTitle: 'Analytics', periodDay: 'Day', periodWeek: 'Week', periodMonth: 'Month', employeeListTitle: 'Overall Statistics', overallSummaryHeader: 'Overall Statistics', overallSummarySubheader: 'Summary report on the activity of the entire team.', kpiTotalClicks: 'Total Actions', kpiMostActive: 'Most Active', kpiTopTemplate: 'Top Template', kpiPeakTime: 'Peak Activity (UTC)', top5Employees: 'Top 5 Employees', top5Templates: 'Top 5 Templates', tableEmployee: 'Employee', tableActions: 'Actions', tableTemplate: 'Template', tableUses: 'Uses', userDetailHeader: 'Statistics for:', userDetailSubheader: 'Detailed activity report for the selected employee.', kpiLastActivity: 'Last Activity', kpiFavTemplate: 'Favorite Template', activityFeedTitle: 'Activity Feed (last 100 actions)', tableTime: 'Time', tableSection: 'Section', noData: 'No data for this period.', loading: 'Loading...', modalTitle: 'Create Contact', modalChannelTitle: '1. Select Channel', modalManagerTitle: '2. Select Manager', modalCancel: 'Cancel', modalConfirm: 'Generate & Copy', modalError: 'Please select a channel and a manager.', username_and_password_required: 'Username and password are required.', invalid_credentials: 'Invalid credentials.', server_error: 'Server error.', content_not_found: 'Content not found.', content_read_error: 'Error reading content.', invalid_token: 'Invalid token.', access_denied: 'Access denied.', content_updated_successfully: 'Content updated successfully!', server_error_on_save: 'Server error on save.', user_not_found: 'User not found.', invalid_data_format: 'Invalid data format.', favorites_updated: 'Favorites updated.', button_id_not_specified: 'Button ID not specified.', click_tracking_error: 'Error tracking click.', analytics_db_error: 'Error getting analytics from DB.', analytics_server_error: 'Server error while getting analytics.', analytics_load_error: 'Error loading statistics', no_templates_for_button: 'No templates for this button', copy_success: 'Copied ({current}/{total})', copy_success_generic: 'Text copied successfully!', favorites_load_error: 'Failed to load favorites', favorites_save_error: 'Error saving favorites', missing_user_data: 'Username and password are required.', invalid_role: 'Invalid user role.', user_created_successfully: 'User created successfully!', user_already_exists: 'A user with this name already exists.', server_error_creating_user: 'Server error while creating user.', username_not_provided: 'Username for deletion not provided.', cannot_delete_self: 'You cannot delete yourself.', user_deleted_successfully: 'User deleted successfully!', server_error_deleting_user: 'Server error while deleting user.', server_error_fetching_users: 'Server error while fetching user list.'
    },
    uk: {
        // ... старые ключи ...
        navTemplates: 'Шаблони',
        navMenu: 'Меню',
        backToMenu: 'Назад',
        analyticsOnlyForManagers: 'Аналітика доступна лише менеджерам',
        openEditor: 'Відкрити редактор',
        manager: 'Менеджер',
        employee: 'Співробітник',
        // ... остальные ключи без изменений ...
        lang_locale: 'uk', loginHeader: 'ChaterLab', loginSubheader: 'Панель швидких відповідей', loginUsername: 'Логін', loginPassword: 'Пароль', loginBtn: 'Увійти', searchPlaceholder: '🔎 Пошук по шаблонах...', favoritesTitle: '⭐ Обране', darkMode: 'Темна тема', logout: 'Вийти', navInstructions: 'Інструкція', navAnalytics: 'Аналітика', navEditor: 'Редактор', mobileAdminTitle: 'Адмін-панель', editorUnavailable: 'Редактор', editorUnavailableMsg: 'Повноцінне редагування доступне лише у версії сайту для ПК.', tabLayout: 'Конструктор кнопок', tabInstructions: 'Інструкція', tabManagers: 'Менеджери', tabUsers: 'Користувачі', addUserTitle: 'Додати нового користувача', newUserUsername: 'Логін', newUserPassword: 'Пароль', roleEmployee: 'Співробітник', roleManager: 'Менеджер', addUserBtn: 'Створити', existingUsersTitle: 'Існуючі користувачі', deleteUserBtn: 'Видалити', deleteUserConfirm: 'Ви впевнені, що хочете видалити користувача {username}?', addManager: '+ Додати менеджера', managerNamePlaceholder: 'Ім\'я менеджера (для списку)', managerTelegramPlaceholder: 'Telegram контакт (@username)', managerWhatsappPlaceholder: 'WhatsApp контакт (+38012345)', deleteManagerTitle: 'Видалити менеджера', managerAssignmentTitle: 'Доступні менеджери для цієї кнопки', isContactButtonLabel: 'Зробити кнопкою "Контакт"', saveAll: 'Зберегти все', cancel: 'Скасувати', addSection: '+ Додати новий розділ', addButton: '+ Додати кнопку до розділу', addVariant: '+ Додати варіант', sectionTitle: 'Назва розділу', buttonLabel: 'Назва кнопки', deleteSectionConfirm: 'Видалити цей розділ з усіма кнопками?', deleteButtonTitle: 'Видалити розділ', deleteButtonEntryTitle: 'Видалити кнопку', deleteVariantTitle: 'Видалити варіант', instructionTitleRu: 'Інструкція (RU)', instructionTitleEn: 'Інструкція (EN)', instructionTitleUk: 'Інструкція (UA)', analyticsTitle: 'Аналітика', periodDay: 'День', periodWeek: 'Тиждень', periodMonth: 'Місяць', employeeListTitle: 'Загальна статистика', overallSummaryHeader: 'Загальна статистика', overallSummarySubheader: 'Зведений звіт про активність всієї команди.', kpiTotalClicks: 'Всього дій', kpiMostActive: 'Найактивніший', kpiTopTemplate: 'Топ шаблон', kpiPeakTime: 'Пік активності (UTC)', top5Employees: 'Топ-5 Співробітників', top5Templates: 'Топ-5 Шаблонів', tableEmployee: 'Співробітник', tableActions: 'Дій', tableTemplate: 'Шаблон', tableUses: 'Використань', userDetailHeader: 'Статистика:', userDetailSubheader: 'Детальний звіт про активність обраного співробітника.', kpiLastActivity: 'Остання активність', kpiFavTemplate: 'Улюблений шаблон', activityFeedTitle: 'Стрічка активності (останні 100 дій)', tableTime: 'Час', tableSection: 'Розділ', noData: 'Немає даних за цей період.', loading: 'Завантаження...', modalTitle: 'Створення контакту', modalChannelTitle: '1. Оберіть канал зв\'язку', modalManagerTitle: '2. Оберіть менеджера', modalCancel: 'Скасувати', modalConfirm: 'Згенерувати та скопіювати', modalError: 'Будь ласка, оберіть канал та менеджера.', username_and_password_required: 'Необхідно вказати ім\'я користувача та пароль.', invalid_credentials: 'Невірні дані.', server_error: 'Помилка на сервері.', content_not_found: 'Контент не знайдено.', content_read_error: 'Помилка читання контенту.', invalid_token: 'Невірний токен.', access_denied: 'Доступ заборонено.', content_updated_successfully: 'Контент успішно оновлено!', server_error_on_save: 'Помилка на сервері при збереженні.', user_not_found: 'Користувача не знайдено.', invalid_data_format: 'Невірний формат даних.', favorites_updated: 'Обране оновлено.', button_id_not_specified: 'Не вказано ID кнопки.', click_tracking_error: 'Помилка запису кліку.', analytics_db_error: 'Помилка при отриманні аналітики з БД.', analytics_server_error: 'Помилка на сервері при отриманні аналітики.', analytics_load_error: 'Помилка завантаження статистики', no_templates_for_button: 'Немає шаблонів для цієї кнопки', copy_success: 'Скопировано ({current}/{total})', copy_success_generic: 'Текст успішно скопійовано!', favorites_load_error: 'Не вдалося завантажити обране', favorites_save_error: 'Помилка збереження обраного', missing_user_data: 'Необхідно вказати ім\'я користувача та пароль.', invalid_role: 'Невірна роль користувача.', user_created_successfully: 'Користувача успішно створено!', user_already_exists: 'Користувач з таким іменем вже існує.', server_error_creating_user: 'Помилка на сервері при створенні користувача.', username_not_provided: 'Не вказано ім\'я користувача для видалення.', cannot_delete_self: 'Неможливо видалити самого себе.', user_deleted_successfully: 'Користувача успішно видалено!', server_error_deleting_user: 'Помилка на сервері при видаленні користувача.', server_error_fetching_users: 'Помилка на сервері при отриманні списку користувачів.'
    }
};

// ... остальные функции до `fetchContent` остаются без изменений ...
function getLocalStorage(key, defaultValue) { try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : defaultValue; } catch (e) { return defaultValue; } }
function setLocalStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.error(e); } }
function getTranslatedText(key, replacements = {}) { const lang = getLocalStorage('chaterlabLang', 'ru'); let text = (uiTexts[lang] && uiTexts[lang][key]) || uiTexts.ru[key] || key; for (const placeholder in replacements) { text = text.replace(`{${placeholder}}`, replacements[placeholder]); } return text; }
function showToast(message, isError = false) { const t = document.getElementById('toast'); t.textContent = message; t.style.backgroundColor = isError ? 'var(--error-color)' : 'var(--success-color)'; t.classList.add('show'); if (navigator.vibrate && !isError) navigator.vibrate(50); setTimeout(() => t.classList.remove('show'), 2000); }
function generateId(prefix) { return prefix + Date.now() + Math.random().toString(16).slice(2); }
const userStatusTexts = { ru: { user: 'Пользователь', status: 'Статус', admin: 'Менеджер', worker: 'Сотрудник', access: 'Разрешено редактирование', noAccess: 'Редактирование не доступно' }, en: { user: 'User', status: 'Status', admin: 'Manager', worker: 'Employee', access: 'Editing is allowed', noAccess: 'Editing is not available' }, uk: { user: 'Користувач', status: 'Статус', admin: 'Менеджер', worker: 'Співробітник', access: 'Дозволено редагування', noAccess: 'Редагування не доступно' } };
function applyTranslations() { const lang = getLocalStorage('chaterlabLang', 'ru'); const texts = uiTexts[lang] || uiTexts.ru; document.querySelectorAll('[data-key]').forEach(el => { const key = el.dataset.key; if (texts[key]) { if (el.tagName === 'INPUT' && (el.placeholder !== undefined)) { el.placeholder = texts[key]; } else if (el.title !== undefined && el.title !== '') { el.title = texts[key] } else { el.textContent = texts[key]; } } }); }
function switchLanguage(lang) { setLocalStorage('chaterlabLang', lang); applyTranslations(); const langButtonsLogin = document.querySelectorAll('#language-switcher-login button'); langButtonsLogin.forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === lang); }); if (document.getElementById('app-container').getAttribute('data-logged') === 'true') { const langButtonsApp = document.querySelectorAll('#language-switcher-app button'); langButtonsApp.forEach(btn => { btn.classList.toggle('active', btn.dataset.lang === lang); }); updateInstructions(lang); if (!isMobile()) { renderUserStatusCard(); } const analyticsPanel = document.getElementById('analytics-panel'); if (analyticsPanel && analyticsPanel.style.display === 'block') { analyticsPanel.dispatchEvent(new Event('languageChange')); } } }
async function checkLogin() { const authToken = getLocalStorage('chaterlabAuthToken', null); const savedRole = getLocalStorage('chaterlabUserRole', null); const savedName = getLocalStorage('chaterlabUserName', null); if (authToken && savedRole && savedName) { userRole = savedRole; userName = savedName; document.getElementById('login-screen').style.display = 'none'; document.body.classList.remove('login-active'); const appContainer = document.getElementById('app-container'); appContainer.setAttribute('data-logged', 'true'); appContainer.style.opacity = '1'; appContainer.style.display = 'block'; await fetchContent(); await fetchFavorites(); updateFavoritesUI(); setupDarkMode(); if (!isMobile()) { renderUserStatusCard(); } return true; } else { logout(false); return false; } }
async function handleLogin(event) { event.preventDefault(); const usernameInput = document.getElementById('login-username'); const passwordInput = document.getElementById('login-password'); const errorDiv = document.getElementById('login-error'); const username = usernameInput.value.trim(); const password = passwordInput.value.trim(); errorDiv.classList.remove('show'); try { const response = await fetch(`${API_BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message); setLocalStorage('chaterlabAuthToken', data.token); setLocalStorage('chaterlabUserRole', data.role); setLocalStorage('chaterlabUserName', username); if (!getLocalStorage('chaterlabLang', null)) setLocalStorage('chaterlabLang', 'ru'); userRole = data.role; userName = username; document.body.classList.remove('login-active'); document.getElementById('login-screen').style.display = 'none'; const overlay = document.getElementById('animation-overlay'); overlay.style.display = 'flex'; void overlay.offsetHeight; overlay.classList.add('animate'); setTimeout(async () => { overlay.style.display = 'none'; overlay.classList.remove('animate'); const appContainer = document.getElementById('app-container'); appContainer.style.display = 'block'; appContainer.setAttribute('data-logged', 'true'); appContainer.style.opacity = '1'; await fetchContent(); await fetchFavorites(); updateFavoritesUI(); setupDarkMode(); if (!isMobile()) { renderUserStatusCard(); } }, 2500); } catch (error) { errorDiv.textContent = getTranslatedText(error.message); errorDiv.classList.add('show'); } }
function logout(doUIRefresh = true) { localStorage.removeItem('chaterlabAuthToken'); localStorage.removeItem('chaterlabUserRole'); localStorage.removeItem('chaterlabUserName'); userRole = null; userName = null; if (doUIRefresh) { location.reload(); } }

async function fetchContent() {
    try {
        const response = await fetch(`${API_BASE_URL}/content`);
        if (!response.ok) {
            const data = await response.json(); throw new Error(data.message);
        };
        appContent = await response.json();
        
        // Логика рендеринга разделяется
        if (isMobile()) {
            renderMobileTemplates();
            setupMobileNavigation();
        } else {
            renderSidebar();
            checkUserRoleAndSetupManagerUI();
            setupSearch();
        }
        
        updateInstructions(getLocalStorage('chaterlabLang', 'ru'));
        applyTranslations();

    } catch (error) {
        showToast(getTranslatedText(error.message), true);
    }
}

// ... функции findButtonById, handleSidebarButtonClick, модальное окно...
// они используются обеими версиями, поэтому остаются без изменений
function findButtonById(buttonId) { if (!appContent.layout) return null; for (const section of appContent.layout) { const button = section.buttons.find(b => b.id === buttonId); if (button) return button; } return null; }
function handleSidebarButtonClick(buttonId) { const buttonData = findButtonById(buttonId); if (!buttonData) return; if (buttonData.type === 'contact_generator') { openContactModal(buttonData); } else { copyDynamicTemplate(buttonId); } }
const contactModal = document.getElementById('contact-generator-modal');
const managerSelect = document.getElementById('manager-select');
const confirmBtn = document.getElementById('modal-confirm-btn');
const cancelBtn = document.getElementById('modal-cancel-btn');
function openContactModal(buttonData) { managerSelect.innerHTML = ''; if (buttonData.manager_ids && appContent.managers) { buttonData.manager_ids.forEach(managerId => { const manager = appContent.managers[managerId]; if (manager) { const option = document.createElement('option'); option.value = managerId; option.textContent = manager.name; managerSelect.appendChild(option); } }); } confirmBtn.onclick = () => generateAndCopyContact(buttonData); contactModal.classList.add('show'); }
function closeContactModal() { contactModal.classList.remove('show'); confirmBtn.onclick = null; }
cancelBtn.addEventListener('click', closeContactModal);
contactModal.addEventListener('click', (e) => { if(e.target === contactModal) closeContactModal(); });
function generateAndCopyContact(buttonData) { const selectedChannelEl = document.querySelector('input[name="channel"]:checked'); const selectedManagerId = managerSelect.value; if (!selectedChannelEl || !selectedManagerId) { showToast(getTranslatedText('modalError'), true); return; } const channelName = selectedChannelEl.value; const manager = appContent.managers[selectedManagerId]; if (!manager) { showToast('Ошибка: не удалось найти данные менеджера.', true); return; } const managerContact = channelName.toLowerCase() === 'telegram' ? manager.telegram : manager.whatsapp; if (buttonData.currentIndex === undefined) buttonData.currentIndex = 0; const baseTemplate = buttonData.templates[buttonData.currentIndex]; let finalText = baseTemplate; finalText = finalText.replace(/\{contact_method\}/g, channelName); finalText = finalText.replace(/\{manager_contact\}/g, managerContact); navigator.clipboard.writeText(finalText).then(() => { let message = getTranslatedText('copy_success'); const nextIndex = (buttonData.currentIndex + 1) % buttonData.templates.length; message = message.replace('{current}', buttonData.currentIndex + 1).replace('{total}', buttonData.templates.length); showToast(message); trackClick(buttonData.id); buttonData.currentIndex = nextIndex; }); closeContactModal(); }

// ===============================================================
// 📱 НАЧАЛО: НОВАЯ ЛОГИКА ДЛЯ МОБИЛЬНОЙ ВЕРСИИ
// ===============================================================

function setupMobileNavigation() {
    const bottomBar = document.getElementById('bottom-bar');
    const menuPanelOverlay = document.getElementById('menu-panel-overlay');

    const navButtons = [
        { id: 'templates', icon: '📝', labelKey: 'navTemplates' },
        { id: 'instructions', icon: 'ℹ️', labelKey: 'navInstructions' },
        { id: 'analytics', icon: '📊', labelKey: 'navAnalytics' },
        { id: 'menu', icon: '☰', labelKey: 'navMenu' }
    ];
    
    bottomBar.innerHTML = navButtons.map(btn => `
        <button class="bottom-bar-btn ${btn.id === 'templates' ? 'active' : ''}" data-page="${btn.id}">
            <span class="icon">${btn.icon}</span>
            <span class="label" data-key="${btn.labelKey}">${getTranslatedText(btn.labelKey)}</span>
        </button>
    `).join('');

    bottomBar.addEventListener('click', (e) => {
        const button = e.target.closest('.bottom-bar-btn');
        if (!button) return;
        
        const pageId = button.dataset.page;
        if (pageId === 'menu') {
            toggleMenuPanel(true);
        } else {
            showMobilePage(pageId);
        }
    });
    
    menuPanelOverlay.addEventListener('click', (e) => {
        if (e.target === menuPanelOverlay) {
            toggleMenuPanel(false);
        }
    });
}

function showMobilePage(pageId) {
    const pages = document.querySelectorAll('.mobile-page');
    const buttons = document.querySelectorAll('.bottom-bar-btn');
    const headerTitle = document.getElementById('mobile-header-title');

    pages.forEach(p => p.classList.remove('active'));
    buttons.forEach(b => b.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        if (pageId === 'editor') {
            document.getElementById('mobile-header').style.display = 'none';
        } else {
            document.getElementById('mobile-header').style.display = 'block';
        }
    }

    const activeButton = document.querySelector(`.bottom-bar-btn[data-page="${pageId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        headerTitle.textContent = activeButton.querySelector('.label').textContent;
    }
    
    // Специальная логика для страниц
    if (pageId === 'analytics') renderMobileAnalytics();
}

function toggleMenuPanel(show) {
    const overlay = document.getElementById('menu-panel-overlay');
    renderMenuPanel();
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function renderMenuPanel() {
    const container = document.getElementById('menu-panel');
    const isManager = userRole === 'manager';
    
    container.innerHTML = `
        <div class="menu-panel-handle"></div>
        <div class="menu-profile">
            <div class="menu-profile-name">${userName}</div>
            <div class="menu-profile-role" data-key="${isManager ? 'manager' : 'employee'}"></div>
        </div>
        <div class="menu-item">
            <span data-key="darkMode"></span>
            <label class="theme-switch" for="mobile-theme-checkbox"><input type="checkbox" id="mobile-theme-checkbox" /><div class="slider round"></div></label>
        </div>
        <div class="menu-item" id="mobile-lang-switcher">
            <span>${getTranslatedText('Язык')}</span>
            <div>
                <button data-lang="ru" class="lang-btn-app">RU</button>
                <button data-lang="en" class="lang-btn-app">EN</button>
                <button data-lang="uk" class="lang-btn-app">UA</button>
            </div>
        </div>
        ${isManager ? `<button id="open-editor-btn" class="menu-item-btn" data-key="openEditor"></button>` : ''}
        <button id="logout-btn-mobile" class="menu-item-logout" data-key="logout"></button>
    `;

    // Дублируем логику для переключателей
    const mobileToggle = document.getElementById('mobile-theme-checkbox');
    mobileToggle.checked = document.body.classList.contains('dark-mode');
    mobileToggle.addEventListener('change', () => {
        document.getElementById('theme-checkbox').click(); // Синхронизируем с десктопным
    });
    
    document.getElementById('mobile-lang-switcher').addEventListener('click', (e) => {
        if(e.target.dataset.lang) switchLanguage(e.target.dataset.lang);
    });

    const currentLang = getLocalStorage('chaterlabLang', 'ru');
    document.querySelector(`#mobile-lang-switcher .lang-btn-app[data-lang="${currentLang}"]`).classList.add('active');
    
    if (isManager) {
        document.getElementById('open-editor-btn').addEventListener('click', openMobileEditor);
    }
    
    document.getElementById('logout-btn-mobile').addEventListener('click', () => logout());
    applyTranslations();
}

function openMobileEditor() {
    toggleMenuPanel(false);
    const editorPage = document.getElementById('page-editor');
    editorPage.classList.add('active');
    // Логика для построения редактора
    buildMobileEditor(); 
}

function renderMobileTemplates() {
    const container = document.getElementById('mobile-sidebar-content');
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
            button.dataset.buttonId = buttonData.id;
            button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/></svg><span>${buttonData.label}</span>`;
            buttonsContainer.appendChild(button);
        });
        sectionDiv.appendChild(buttonsContainer);
        container.appendChild(sectionDiv);
    });
    
    // Логика аккордеона
    container.addEventListener('click', (e) => {
        const header = e.target.closest('h2');
        if (header) {
            header.parentElement.classList.toggle('active');
        }
        const button = e.target.closest('.sidebar-button');
        if(button) {
            handleSidebarButtonClick(button.dataset.buttonId);
            createRipple(e);
        }
    });
}

function renderMobileAnalytics() {
    const container = document.getElementById('page-analytics');
    if (userRole === 'manager') {
        container.innerHTML = `<div id="mobile-analytics-content"></div>`;
        fetchAndRenderMobileAnalytics();
    } else {
        container.innerHTML = `<div class="analytics-placeholder"><span style="font-size: 48px;">📊</span><h3 data-key="analyticsTitle"></h3><p data-key="analyticsOnlyForManagers"></p></div>`;
    }
    applyTranslations();
}

function createRipple(event) {
    const button = event.currentTarget.closest('.sidebar-button');
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) { ripple.remove(); }
    button.appendChild(circle);
}

// ===============================================================
// 📱 КОНЕЦ: НОВАЯ ЛОГИКА ДЛЯ МОБИЛЬНОЙ ВЕРСИИ
// ===============================================================


// ===============================================================
// 💻 НАЧАЛО: СТАРАЯ ЛОГИКА ДЛЯ ДЕСКТОПНОЙ ВЕРСИИ
// ===============================================================

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
        statusText = texts.admin; accessText = texts.access; statusColor = 'var(--accent-purple)';
    } else {
        statusText = texts.worker; accessText = texts.noAccess; statusColor = 'var(--text-secondary)';
    }
    card.innerHTML = `<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: 600; color: var(--text-primary);">${texts.user}:</span><span style="font-weight: 700; color: var(--primary-blue);">${userName}</span></div><div style="display: flex; align-items: center; justify-content: space-between;"><span style="font-weight: 600; color: var(--text-primary);">${texts.status}:</span><span style="font-weight: 700; color: ${statusColor};">${statusText}</span></div><div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px; text-align: center;"><span style="color: ${userRole === 'manager' ? 'var(--success-color)' : 'var(--text-secondary)'}; font-weight: 500;">${accessText}</span></div>`;
}
// ... все остальные функции остаются без изменений до `checkUserRoleAndSetupManagerUI` ...
function updateInstructions(lang) {
    const desktopInstructions = document.getElementById('instructions-desktop');
    const mobileInstructions = document.getElementById('instructions-mobile');
    let content = '';
    if (appContent.instructionsContent && appContent.instructionsContent[lang]) {
        content = appContent.instructionsContent[lang];
    } else {
        const fallbackMessage = { 'ru': '<h3>Инструкция не найдена</h3><p>Для выбранного языка нет инструкции в базе данных.</p>', 'en': '<h3>Instructions Not Found</h3><p>No instructions are available for the selected language in the database.</p>', 'uk': '<h3>Інструкція не знайдена</h3><p>Для вибраної мови немає інструкції в базі даних.</p>' };
        content = fallbackMessage[lang] || fallbackMessage['ru'];
    }
    if(desktopInstructions) desktopInstructions.innerHTML = content;
    if(mobileInstructions) mobileInstructions.innerHTML = content;
}

async function trackClick(buttonId) { const token = getLocalStorage('chaterlabAuthToken', ''); if (!token) return; try { await fetch(`${API_BASE_URL}/api/track-click`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ buttonId: buttonId }) }); } catch (error) { console.error('Failed to track click:', error); } }
function copyDynamicTemplate(buttonId) { let targetButton = findButtonById(buttonId); if (!targetButton || !targetButton.templates || targetButton.templates.length === 0) { showToast(getTranslatedText('no_templates_for_button'), true); return; } if (targetButton.currentIndex === undefined) targetButton.currentIndex = 0; const textToCopy = targetButton.templates[targetButton.currentIndex]; navigator.clipboard.writeText(textToCopy).then(() => { let message = getTranslatedText('copy_success'); message = message.replace('{current}', targetButton.currentIndex + 1).replace('{total}', targetButton.templates.length); showToast(message); trackClick(buttonId); }); targetButton.currentIndex = (targetButton.currentIndex + 1) % targetButton.templates.length; }
async function fetchFavorites() { const token = getLocalStorage('chaterlabAuthToken', ''); if (!token) return; try { const response = await fetch(`${API_BASE_URL}/api/favorites`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error(getTranslatedText('favorites_load_error')); const data = await response.json(); userFavorites = data.favorites || []; } catch (error) { showToast(error.message, true); userFavorites = []; } }
async function saveFavorites() { const token = getLocalStorage('chaterlabAuthToken', ''); if (!token) return; try { await fetch(`${API_BASE_URL}/api/favorites`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ favorites: userFavorites }) }); } catch (error) { showToast(getTranslatedText('favorites_save_error'), true); } }
function handleFavoriteClick(event) { const star = event.target; if (!star.classList.contains('favorite-star')) return; const buttonId = star.dataset.buttonId; if (!buttonId) return; const index = userFavorites.indexOf(buttonId); if (index > -1) { userFavorites.splice(index, 1); } else { userFavorites.push(buttonId); } updateFavoritesUI(); saveFavorites(); }
function updateFavoritesUI() { const favoritesContainer = document.getElementById('favorites-content'); const favoritesSection = document.getElementById('favorites-section'); if (!favoritesContainer || !favoritesSection) return; favoritesContainer.innerHTML = ''; const allButtons = new Map(); appContent.layout?.forEach(section => { section.buttons.forEach(btn => allButtons.set(btn.id, btn)); }); userFavorites.forEach(favId => { const buttonData = allButtons.get(favId); if (buttonData) { const button = document.createElement('button'); button.className = 'sidebar-button'; button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"/></svg><span>${buttonData.label}</span><div class="favorite-star favorited" data-button-id="${buttonData.id}">★</div>`; button.onclick = (e) => { if (e.target.classList.contains('favorite-star')) return; handleSidebarButtonClick(buttonData.id); }; favoritesContainer.appendChild(button); } }); if (userFavorites.length > 0) { favoritesSection.style.display = 'block'; } else { favoritesSection.style.display = 'none'; } document.querySelectorAll('.sidebar-button .favorite-star').forEach(star => { const buttonId = star.dataset.buttonId; if (userFavorites.includes(buttonId)) { star.classList.add('favorited'); star.innerHTML = '★'; } else { star.classList.remove('favorited'); star.innerHTML = '☆'; } }); }
function setupDarkMode() { const toggle = document.getElementById('theme-checkbox'); const applyTheme = (theme) => { document.body.classList.toggle('dark-mode', theme === 'dark'); if (toggle) toggle.checked = (theme === 'dark'); if (!isMobile() && document.getElementById('content-editor') && document.getElementById('content-editor').style.display === 'block') { tinymce.remove(); initInstructionsEditor(); } }; const savedTheme = getLocalStorage('chaterlabTheme', 'light'); applyTheme(savedTheme); if (toggle) toggle.addEventListener('change', () => { const theme = toggle.checked ? 'dark' : 'light'; setLocalStorage('chaterlabTheme', theme); applyTheme(theme); }); }
function setupSearch() { const searchInput = document.getElementById('searchInput'); if (!searchInput) return; searchInput.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase().trim(); document.querySelectorAll('#sidebar-content .sidebar-section').forEach(section => { let sectionHasVisibleButton = false; const buttons = section.querySelectorAll('.sidebar-button'); buttons.forEach(button => { const buttonLabel = button.querySelector('span').textContent.toLowerCase(); if (buttonLabel.includes(searchTerm)) { button.style.display = 'flex'; sectionHasVisibleButton = true; } else { button.style.display = 'none'; } }); const sectionTitle = section.querySelector('h2'); if(sectionTitle) sectionTitle.style.display = sectionHasVisibleButton ? 'block' : 'none'; }); }); }
function checkUserRoleAndSetupManagerUI() {
    if (userRole === 'manager' && !isMobile()) {
        const managerControls = document.querySelector('.manager-controls-segmented');
        if (managerControls) managerControls.style.display = 'flex';
        const triggerAnalyticsLoad = setupAnalytics();
        const buttons = document.querySelectorAll('.manager-controls-segmented button');
        const glider = document.querySelector('.manager-controls-segmented .glider');
        const mainContentPanel = document.getElementById('main-content-wrapper-desktop');
        const analyticsPanel = document.getElementById('analytics-panel');

        function moveGlider(target) { buttons.forEach(btn => btn.classList.remove('active')); target.classList.add('active'); glider.style.width = `${target.offsetWidth}px`; glider.style.left = `${target.offsetLeft}px`; }
        buttons.forEach(button => { button.addEventListener('click', (e) => { moveGlider(e.currentTarget); if (button.id === 'show-instructions-btn') switchManagerView('instructions'); if (button.id === 'show-analytics-btn') switchManagerView('analytics'); if (button.id === 'edit-mode-btn') switchManagerView('editor'); }); });
        const activeButton = document.querySelector('.manager-controls-segmented button.active');
        if (activeButton) { setTimeout(() => moveGlider(activeButton), 50); }

        function switchManagerView(view) {
             const instructionsDiv = document.getElementById('instructions-desktop');
             const editorDiv = document.getElementById('content-editor');

            mainContentPanel.style.display = 'block';
            analyticsPanel.style.display = 'none';
            instructionsDiv.style.display = 'none';
            editorDiv.style.display = 'none';

            if (view === 'instructions') {
                instructionsDiv.style.display = 'block';
            } else if (view === 'analytics') {
                analyticsPanel.style.display = 'block';
                if (triggerAnalyticsLoad) triggerAnalyticsLoad();
            } else if (view === 'editor') {
                 // Тут будет логика для десктопного редактора, если она нужна
            }
        }
    }
}
async function fetchAndRenderMobileAnalytics() {
    const contentDiv = document.getElementById('mobile-analytics-content');
    if(!contentDiv) return;
    contentDiv.innerHTML = `<p>${getTranslatedText('loading')}</p>`;
    const token = getLocalStorage('chaterlabAuthToken', '');
    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics?period=day`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!response.ok) throw new Error(getTranslatedText('analytics_load_error'));
        const data = await response.json();
        const texts = uiTexts[getLocalStorage('chaterlabLang', 'ru')];
        const totalClicks = data.detailed_log.length;
        const topEmployee = data.employee_summary?.[0]?.username || '—';
        const topTemplateId = data.template_summary?.[0]?.button_id;
        const topTemplateLabel = topTemplateId ? (findButtonById(topTemplateId)?.label || '—') : '—';
        contentDiv.innerHTML = `<div class="kpi-grid"><div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${totalClicks}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiMostActive}</p><h3 class="kpi-card-value">${topEmployee}</h3></div></div><div class="kpi-card" style="margin-top: 16px;"><p class="kpi-card-title">${texts.kpiTopTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div>`;
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

    let currentPeriod = 'day'; let selectedUser = null; let fullData = null; const DateTime = luxon.DateTime;
    analyticsPanel.addEventListener('languageChange', renderAnalytics);
    periodSelector.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) { periodSelector.querySelector('.active').classList.remove('active'); e.target.classList.add('active'); currentPeriod = e.target.dataset.period; fetchAndRenderAnalytics(); } });
    employeeList.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) { const username = li.dataset.username; selectedUser = (username === 'all') ? null : username; renderAnalytics(); } });

    async function fetchAndRenderAnalytics() { mainPanel.innerHTML = `<div id="analytics-loader">${getTranslatedText('loading')}</div>`; employeeList.innerHTML = ''; const token = getLocalStorage('chaterlabAuthToken', ''); try { const response = await fetch(`${API_BASE_URL}/api/analytics?period=${currentPeriod}`, { headers: { 'Authorization': `Bearer ${token}` } }); if (!response.ok) throw new Error(getTranslatedText('analytics_load_error')); fullData = await response.json(); renderAnalytics(); } catch (error) { showToast(error.message, true); mainPanel.innerHTML = `<div class="no-data-message">${error.message}</div>`; } }
    function renderAnalytics() { if (!fullData) return; const lang = getLocalStorage('chaterlabLang', 'ru'); const texts = uiTexts[lang] || uiTexts.ru; renderEmployeeList(fullData.employee_summary, texts); if (selectedUser) { renderUserDetailView(selectedUser, fullData, texts); } else { renderOverallSummaryView(fullData, texts); } }
    function renderEmployeeList(summary, texts) { employeeList.innerHTML = `<li data-username="all" class="${!selectedUser ? 'active' : ''}"><span class="employee-name">${texts.employeeListTitle}</span></li>`; if(summary && summary.length > 0) { summary.forEach(emp => { const li = document.createElement('li'); li.dataset.username = emp.username; li.className = (selectedUser === emp.username) ? 'active' : ''; li.innerHTML = `<span class="employee-name">${emp.username}</span><span class="employee-clicks">${emp.count}</span>`; employeeList.appendChild(li); }); } }
    function getButtonData(buttonId) { if (!appContent.layout) return { label: `(ID: ${buttonId})`, section: 'N/A' }; for (const section of appContent.layout) { const button = section.buttons.find(b => b.id === buttonId); if (button) return { label: button.label, section: section.title }; } return { label: `(удален: ${buttonId})`, section: 'N/A' }; }
    function formatRelativeTime(isoString, lang) { if (!isoString) return 'никогда'; return DateTime.fromISO(isoString).setLocale(lang).toRelative(); }
    function renderOverallSummaryView(data, texts) { const topEmployee = data.employee_summary?.[0]?.username || '—'; const topTemplateId = data.template_summary?.[0]?.button_id; const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—'; const peakHour = data.peak_hour; const peakTimeText = (peakHour !== null && peakHour !== undefined) ? `${String(peakHour).padStart(2, '0')}:00 - ${String(peakHour + 1).padStart(2, '0')}:00` : '—'; let topTemplatesHtml = data.template_summary?.slice(0, 5).map(t => `<tr><td>${getButtonData(t.button_id).label}</td><td class="count-cell">${t.count}</td></tr>`).join('') || `<tr><td colspan="2">${texts.noData}</td></tr>`; let topEmployeesHtml = data.employee_summary?.slice(0, 5).map(e => `<tr><td>${e.username}</td><td class="count-cell">${e.count}</td></tr>`).join('') || `<tr><td colspan="2">${texts.noData}</td></tr>`; if (!data.detailed_log || data.detailed_log.length === 0) { mainPanel.innerHTML = `<div class="no-data-message">${texts.noData}</div>`; return; } mainPanel.innerHTML = `<div class="analytics-main-header"><h2>${texts.overallSummaryHeader}</h2><p>${texts.overallSummarySubheader}</p></div><div class="kpi-grid"><div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${data.detailed_log.length}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiMostActive}</p><h3 class="kpi-card-value">${topEmployee}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiTopTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiPeakTime}</p><h3 class="kpi-card-value">${peakTimeText}</h3></div></div><div class="analytics-section"><h4>${texts.top5Employees}</h4><table class="analytics-table"><thead><tr><th>${texts.tableEmployee}</th><th style="text-align:right;">${texts.tableActions}</th></tr></thead><tbody>${topEmployeesHtml}</tbody></table></div><div class="analytics-section"><h4>${texts.top5Templates}</h4><table class="analytics-table"><thead><tr><th>${texts.tableTemplate}</th><th style="text-align:right;">${texts.tableUses}</th></tr></thead><tbody>${topTemplatesHtml}</tbody></table></div>`; }
    function renderUserDetailView(username, data, texts) { const userData = data.employee_summary.find(e => e.username === username); const userLog = data.detailed_log.filter(log => log.username === username); const userTemplateCounts = userLog.reduce((acc, log) => { acc[log.button_id] = (acc[log.button_id] || 0) + 1; return acc; }, {}); const topTemplateId = Object.keys(userTemplateCounts).sort((a, b) => userTemplateCounts[b] - userTemplateCounts[a])[0]; const topTemplateLabel = topTemplateId ? getButtonData(topTemplateId).label : '—'; let logHtml = userLog.slice(0, 100).map(log => { const btnData = getButtonData(log.button_id); return `<tr><td class="time-cell">${DateTime.fromISO(log.created_at).toFormat('HH:mm:ss')}</td><td>${btnData.label}</td><td class="time-cell">${btnData.section}</td></tr>` }).join(''); mainPanel.innerHTML = `<div class="analytics-main-header"><h2>${texts.userDetailHeader} ${username}</h2><p>${texts.userDetailSubheader}</p></div><div class="kpi-grid"><div class="kpi-card"><p class="kpi-card-title">${texts.kpiTotalClicks}</p><h3 class="kpi-card-value">${userData?.count || 0}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiLastActivity}</p><h3 class="kpi-card-value">${formatRelativeTime(userData?.last_activity, texts.lang_locale || 'ru')}</h3></div><div class="kpi-card"><p class="kpi-card-title">${texts.kpiFavTemplate}</p><h3 class="kpi-card-value">${topTemplateLabel}</h3></div></div><div class="analytics-section"><h4>${texts.activityFeedTitle}</h4><div style="max-height: 400px; overflow-y: auto;"><table class="analytics-table"><thead><tr><th>${texts.tableTime}</th><th>${texts.tableTemplate}</th><th>${texts.tableSection}</th></tr></thead><tbody>${logHtml || `<tr><td colspan="3" style="text-align:center;">${texts.noData}</td></tr>`}</tbody></table></div></div>`; }
    return fetchAndRenderAnalytics;
}
// Логика редактора и пользователей остается, т.к. она может быть использована мобильным редактором
function buildMobileEditor() { /* Новая функция для мобильного редактора */ console.log("Building mobile editor"); }

// ... старые функции редактора и пользователей ...

// ===============================================================
// 💻 КОНЕЦ: СТАРАЯ ЛОГИКА ДЛЯ ДЕСКТОПНОЙ ВЕРСИИ
// ===============================================================

// Запускаем приложение
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getLocalStorage('chaterlabLang', 'ru');
    switchLanguage(initialLang);
    document.querySelectorAll('#language-switcher-login button').forEach(button => { button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); });
    
    // Перенесено из checkLogin для ранней инициализации
    const appLangButtons = document.querySelectorAll('#language-switcher-app button');
    if(appLangButtons.length > 0) {
       appLangButtons.forEach(button => { button.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang)); });
    }

    checkLogin();
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});