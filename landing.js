// landing.js - Логика лендинга и отправки форм

const API_BASE_URL = 'https://backendchater.fly.dev'; // Убедитесь, что адрес верный

const translations = {
    ru: {
        nav_benefits: "Преимущества",
        nav_directions: "Направления",
        nav_how_to_start: "Как начать",
        nav_contacts: "Контакты",
        btn_start_career: "Начать карьеру",
        btn_login: "Войти",
        hero_title: "Первое цифровое агентство международных знакомств",
        hero_subtitle: "ChaterLab революционизирует индустрию, предлагая удаленную работу с высоким доходом для переводчиков, скаутов и моделей по всему миру. Лидер индустрии с 2016 года.",
        hero_btn_directions: "Выбрать направление",
        hero_btn_more: "Узнать больше",
        benefits_title: "Почему выбирают ChaterLab",
        benefit_1_title: "100% удаленная работа",
        benefit_1_text: "Работайте из любой точки мира. Нужен только ноутбук и интернет. Никаких офисов и пробок.",
        benefit_2_title: "Премиальные условия",
        benefit_2_text: "Конкурентная оплата выше рынка, прозрачная система бонусов, оплачиваемое обучение.",
        benefit_3_title: "Передовые технологии",
        benefit_3_text: "Собственная платформа с AI-инструментами, автоматизация рутины, лучшее ПО.",
        stat_employees: "Сотрудников",
        years: "лет",
        stat_market: "На рынке",
        stat_income_val: "26 000₴",
        stat_income_label: "Средний доход",
        stat_countries: "Стран",
        directions_title: "Направления",
        tab_translators: "Переводчики",
        tab_scouts: "Скауты",
        tab_models: "Модели",
        dir_translators_title: "Переводчик в ChaterLab",
        dir_translators_desc: "Превратите знание языков в стабильный высокий доход.",
        dir_translators_li_1: "Гибкий график 24/7 (минимум 4 часа).",
        dir_translators_li_2: "Доход от 26 000₴ в месяц (Топ зарабатывают 50 000₴+).",
        dir_translators_li_3: "Бесплатное обучение и поддержка менторов.",
        dir_translators_li_4: "Лучшее ПО (автоперевод, шаблоны, CRM).",
        btn_apply: "Подать заявку",
        dir_scouts_title: "Скаут в ChaterLab",
        dir_scouts_desc: "Ищите таланты и получайте бонусы за каждого кандидата.",
        dir_scouts_li_1: "Работа в свободное время.",
        dir_scouts_li_2: "Высокие бонусы за успешных кандидатов.",
        dir_scouts_li_3: "Доступ к базе ресурсов для поиска.",
        dir_scouts_li_4: "Прозрачная система выплат.",
        dir_models_title: "Модель в ChaterLab",
        dir_models_desc: "Станьте лицом бренда и зарабатывайте на своей харизме.",
        dir_models_li_1: "Полная безопасность и конфиденциальность.",
        dir_models_li_2: "Профессиональные фотосессии и продвижение.",
        dir_models_li_3: "Высокий процент от дохода.",
        dir_models_li_4: "Поддержка персонального менеджера.",
        how_title: "Как начать работать",
        how_step_1_title: "Заполните анкету",
        how_step_1_text: "Займет не более 5 минут.",
        how_step_2_title: "Пройдите интервью",
        how_step_2_text: "Онлайн-собеседование с HR.",
        how_step_3_title: "Обучение",
        how_step_3_text: "Бесплатное (от 3 дней до 2 недель).",
        how_step_4_title: "Начните зарабатывать",
        how_step_4_text: "Первый доход уже через неделю.",
        footer_cta_title: "Готовы изменить свою жизнь?",
        footer_cta_subtitle: "Присоединяйтесь к команде лидеров",
        footer_col_career: "Карьера",
        footer_col_company: "Компания",
        link_blog: "Блог",
        link_press: "Пресс-центр",
        footer_col_support: "Поддержка",
        link_faq: "FAQ",
        footer_col_contacts: "Контакты",
        footer_rights: "Все права защищены.",
        modal_title: "Начать карьеру",
        modal_desc: "Оставьте заявку, и мы свяжемся с вами в ближайшее время.",
        placeholder_name: "Ваше имя",
        placeholder_email: "Email",
        select_direction: "Выберите направление",
        btn_send: "Отправить",
        phone_hint: "📱 Укажите номер телефона, по которому HR сможет найти вас в WhatsApp или Telegram:",
        app_success: "Спасибо! Ваша заявка успешно отправлена. HR свяжется с вами в ближайшее время.",
        app_error: "Ошибка при отправке. Попробуйте позже."
    },
    en: {
        nav_benefits: "Benefits",
        nav_directions: "Directions",
        nav_how_to_start: "How to Start",
        nav_contacts: "Contacts",
        btn_start_career: "Start Career",
        btn_login: "Log In",
        hero_title: "The First Digital International Dating Agency",
        hero_subtitle: "ChaterLab revolutionizes the industry by offering high-income remote work for translators, scouts, and models worldwide. Industry leader since 2016.",
        hero_btn_directions: "Choose Direction",
        hero_btn_more: "Learn More",
        benefits_title: "Why Choose ChaterLab",
        benefit_1_title: "100% Remote Work",
        benefit_1_text: "Work from anywhere in the world. All you need is a laptop and internet. No offices or traffic.",
        benefit_2_title: "Premium Conditions",
        benefit_2_text: "Competitive pay above market, transparent bonus system, paid training.",
        benefit_3_title: "Advanced Technologies",
        benefit_3_text: "Proprietary platform with AI tools, routine automation, best software.",
        stat_employees: "Employees",
        years: "years",
        stat_market: "On the market",
        stat_income_val: "$700",
        stat_income_label: "Average Income",
        stat_countries: "Countries",
        directions_title: "Directions",
        tab_translators: "Translators",
        tab_scouts: "Scouts",
        tab_models: "Models",
        dir_translators_title: "Translator at ChaterLab",
        dir_translators_desc: "Turn your language skills into a stable high income.",
        dir_translators_li_1: "Flexible schedule 24/7 (minimum 4 hours).",
        dir_translators_li_2: "Income from $700/month (Top earners make $1300+).",
        dir_translators_li_3: "Free training and mentor support.",
        dir_translators_li_4: "Best software (auto-translation, templates, CRM).",
        btn_apply: "Apply Now",
        dir_scouts_title: "Scout at ChaterLab",
        dir_scouts_desc: "Find talents and get bonuses for each candidate.",
        dir_scouts_li_1: "Work in your free time.",
        dir_scouts_li_2: "High bonuses for successful candidates.",
        dir_scouts_li_3: "Access to resource database for search.",
        dir_scouts_li_4: "Transparent payment system.",
        dir_models_title: "Model at ChaterLab",
        dir_models_desc: "Become the face of the brand and earn on your charisma.",
        dir_models_li_1: "Complete safety and confidentiality.",
        dir_models_li_2: "Professional photo shoots and promotion.",
        dir_models_li_3: "High percentage of income.",
        dir_models_li_4: "Personal manager support.",
        how_title: "How to Start Working",
        how_step_1_title: "Fill out the form",
        how_step_1_text: "Takes no more than 5 minutes.",
        how_step_2_title: "Pass the interview",
        how_step_2_text: "Online interview with HR.",
        how_step_3_title: "Training",
        how_step_3_text: "Free (from 3 days to 2 weeks).",
        how_step_4_title: "Start Earning",
        how_step_4_text: "First income in just a week.",
        footer_cta_title: "Ready to change your life?",
        footer_cta_subtitle: "Join the team of leaders",
        footer_col_career: "Career",
        footer_col_company: "Company",
        link_blog: "Blog",
        link_press: "Press Center",
        footer_col_support: "Support",
        link_faq: "FAQ",
        footer_col_contacts: "Contacts",
        footer_rights: "All rights reserved.",
        modal_title: "Start Career",
        modal_desc: "Leave a request and we will contact you shortly.",
        placeholder_name: "Your Name",
        placeholder_email: "Email",
        select_direction: "Choose Direction",
        btn_send: "Send",
        phone_hint: "📱 Please provide your phone number so HR can find you on WhatsApp or Telegram:",
        app_success: "Thank you! Your application has been sent successfully. HR will contact you soon.",
        app_error: "Error sending application. Please try again later."
    }
};

let currentLang = 'ru';

// Language Switcher
const langSwitchBtn = document.getElementById('langSwitch');
langSwitchBtn.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    langSwitchBtn.textContent = currentLang === 'ru' ? 'EN' : 'RU';
    updateContent();
});

function updateContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
        }
    });
}

// Tabs
function openTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Deactivate all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show specific tab content
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }

    // Activate specific button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });
}

// Modal Logic
const modalOverlay = document.getElementById('modalOverlay');

function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ ФОРМЫ
async function submitForm(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = '...';
    submitBtn.disabled = true;

    const name = document.getElementById('app-name').value;
    const email = document.getElementById('app-email').value;
    const phone = document.getElementById('app-phone').value;
    const direction = document.getElementById('app-direction').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/applications-public`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, direction })
        });

        const result = await response.json();

        if (response.ok) {
            alert(translations[currentLang].app_success);
            event.target.reset();
            closeModal();
        } else {
            alert(result.message || translations[currentLang].app_error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(translations[currentLang].app_error);
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Mobile Menu
const burgerMenu = document.getElementById('burgerMenu');
const mobileMenu = document.getElementById('mobileMenu');

if (burgerMenu && mobileMenu) {
    burgerMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
}

function closeMobileMenu() {
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
}