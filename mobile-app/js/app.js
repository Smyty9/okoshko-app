// Окошко - Mobile App JavaScript
// Полная логика из demo-phone адаптированная для отдельного приложения

document.addEventListener('DOMContentLoaded', function() {
    initMobileApp();
});

// Состояние приложения
let appState = {
    currentStep: 1,
    selectedService: null,
    selectedServiceName: null,
    selectedPrice: null,
    selectedDuration: null,
    selectedDate: null,
    selectedTime: null
};

// Основная инициализация приложения
function initMobileApp() {
    console.log('🚀 Окошко Mobile App - Инициализация');
    
    // Генерация календаря
    generateCalendar();
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Настройка жестов и тач-событий
    setupTouchEvents();
    
    // Инициализация первого шага
    showStep(1);
    
    // Предзагрузка статистики
    updateDemoStats();
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    // Выбор услуги
    document.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            selectService(this);
        });
    });
    
    // Кнопка "Назад" в хедере
    document.getElementById('back-btn').addEventListener('click', function() {
        navigateBack();
    });
    
    // Подтверждение записи
    document.getElementById('confirm-booking').addEventListener('click', function() {
        confirmBooking();
    });
    
    // Перезапуск демо
    document.getElementById('restart-demo').addEventListener('click', function() {
        restartApp();
    });
    
    // Предотвращение долгого нажатия на кнопках
    document.querySelectorAll('button, .service-option').forEach(element => {
        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
}

// Настройка тач-событий для мобильных устройств
function setupTouchEvents() {
    // Добавляем haptic feedback симуляцию
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('button, .service-option, .calendar-day, .time-slot')) {
            e.target.closest('button, .service-option, .calendar-day, .time-slot').classList.add('haptic-light');
            setTimeout(() => {
                e.target.closest('button, .service-option, .calendar-day, .time-slot')?.classList.remove('haptic-light');
            }, 100);
        }
    });
}

// Выбор услуги
function selectService(element) {
    // Убираем выделение с других опций
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Выделяем выбранную опцию
    element.classList.add('selected');
    
    // Сохраняем данные услуги
    const serviceType = element.dataset.service;
    const serviceName = element.querySelector('div:first-child > div:first-child').textContent;
    const servicePrice = element.dataset.price;
    const serviceDuration = element.dataset.duration;
    
    appState.selectedService = serviceType;
    appState.selectedServiceName = serviceName;
    appState.selectedPrice = servicePrice;
    appState.selectedDuration = serviceDuration;
    
    // Показываем анимацию выбора
    element.classList.add('haptic-medium');
    setTimeout(() => {
        element.classList.remove('haptic-medium');
    }, 150);
    
    // Переходим к следующему шагу через задержку
    setTimeout(() => {
        showStep(2);
    }, 800);
}

// Генерация календаря
function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Обновляем заголовок месяца
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    document.getElementById('calendar-month').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Первый день месяца
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay(); // Понедельник = 1
    
    // Количество дней в месяце
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Очищаем сетку
    calendarGrid.innerHTML = '';
    
    // Пустые ячейки для выравнивания
    for (let i = 1; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day disabled';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const currentDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = currentDate.getDay();
        const isPast = day < today.getDate() && currentMonth === today.getMonth();
        const isToday = day === today.getDate() && currentMonth === today.getMonth();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Определяем доступность дня
        if (isPast || isWeekend) {
            dayElement.classList.add('disabled');
        } else if (day <= today.getDate() + 14) { // Доступны следующие 2 недели
            dayElement.classList.add('available');
            dayElement.addEventListener('click', function() {
                selectDate(day, currentDate);
            });
        } else {
            dayElement.classList.add('disabled');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Выбор даты
function selectDate(day, date) {
    // Убираем выделение с других дней
    document.querySelectorAll('.calendar-day').forEach(d => {
        d.classList.remove('selected');
    });
    
    // Выделяем выбранный день
    event.target.classList.add('selected');
    
    appState.selectedDate = day;
    
    // Показываем временные слоты
    showTimeSlots(day, date);
}

// Показ временных слотов
function showTimeSlots(day, date) {
    const timeSlotsContainer = document.getElementById('time-slots');
    const selectedDateSpan = document.getElementById('selected-date');
    const timeGrid = document.getElementById('time-grid');
    
    // Обновляем заголовок
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    selectedDateSpan.textContent = `${day} ${monthNames[date.getMonth()]}`;
    
    // Генерируем временные слоты
    const timeSlots = [
        '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    // Некоторые слоты делаем недоступными для реалистичности
    const unavailableSlots = getUnavailableSlots(day);
    
    timeGrid.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        const isUnavailable = unavailableSlots.includes(time);
        
        timeSlot.className = `time-slot ${isUnavailable ? 'disabled' : 'available'}`;
        timeSlot.textContent = time;
        timeSlot.dataset.time = time;
        
        if (!isUnavailable) {
            timeSlot.addEventListener('click', function() {
                selectTime(time);
            });
        }
        
        timeGrid.appendChild(timeSlot);
    });
    
    // Показываем секцию с анимацией
    timeSlotsContainer.classList.remove('hidden');
    
    // Плавная прокрутка к временным слотам
    setTimeout(() => {
        timeSlotsContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 100);
}

// Получение недоступных слотов (симуляция занятости)
function getUnavailableSlots(day) {
    // Псевдослучайная генерация занятых слотов на основе дня
    const seed = day * 13; // Простое seed значение
    const unavailable = [];
    
    if (seed % 3 === 0) unavailable.push('11:00');
    if (seed % 4 === 1) unavailable.push('13:00');
    if (seed % 5 === 2) unavailable.push('17:00');
    if (seed % 7 === 3) unavailable.push('15:00');
    
    return unavailable;
}

// Выбор времени
function selectTime(time) {
    // Убираем выделение с других временных слотов
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Выделяем выбранный слот
    event.target.classList.add('selected');
    
    appState.selectedTime = time;
    
    // Добавляем haptic эффект
    event.target.classList.add('haptic-medium');
    setTimeout(() => {
        event.target.classList.remove('haptic-medium');
    }, 150);
    
    // Переходим к подтверждению через задержку
    setTimeout(() => {
        showStep(3);
    }, 1000);
}

// Навигация между шагами
function showStep(stepNumber) {
    console.log(`📱 Переход на шаг ${stepNumber}`);
    
    // Скрываем все шаги
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Показываем нужный шаг
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    currentStepElement.classList.remove('hidden');
    
    // Управляем кнопкой "Назад"
    const backBtn = document.getElementById('back-btn');
    if (stepNumber === 1) {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
    
    // Заполняем данные для шага подтверждения
    if (stepNumber === 3) {
        fillConfirmationData();
    }
    
    // Обновляем состояние
    appState.currentStep = stepNumber;
    
    // Прокручиваем наверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Навигация назад
function navigateBack() {
    if (appState.currentStep > 1) {
        showStep(appState.currentStep - 1);
    }
}

// Заполнение данных подтверждения
function fillConfirmationData() {
    document.getElementById('selected-service').textContent = appState.selectedServiceName;
    
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const today = new Date();
    
    document.getElementById('selected-datetime').textContent = 
        `${appState.selectedDate} ${monthNames[today.getMonth()]}, ${appState.selectedTime}`;
    
    document.getElementById('selected-price').textContent = `${appState.selectedPrice}₽`;
}

// Подтверждение записи
function confirmBooking() {
    const button = document.getElementById('confirm-booking');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Показываем состояние загрузки
    button.innerHTML = '<div class="loading-spinner mr-2"></div>Записываем...';
    button.disabled = true;
    loadingOverlay.classList.remove('hidden');
    
    // Симуляция API запроса
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        showStep(4);
        
        // Обновляем статистику
        incrementDemoCompletions();
        
        // Восстанавливаем кнопку
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Записаться';
        button.disabled = false;
        
        // Обновляем сообщение об успехе
        updateSuccessMessage();
        
    }, 2500);
}

// Обновление сообщения об успехе
function updateSuccessMessage() {
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const today = new Date();
    
    const message = `Вы записаны к мастеру Анне Смирновой на ${appState.selectedDate} ${monthNames[today.getMonth()]} в ${appState.selectedTime}`;
    document.getElementById('success-message').textContent = message;
}

// Перезапуск приложения
function restartApp() {
    console.log('🔄 Перезапуск приложения');
    
    // Сбрасываем состояние
    appState = {
        currentStep: 1,
        selectedService: null,
        selectedServiceName: null,
        selectedPrice: null,
        selectedDuration: null,
        selectedDate: null,
        selectedTime: null
    };
    
    // Убираем все выделения
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    document.querySelectorAll('.calendar-day').forEach(d => {
        d.classList.remove('selected');
    });
    
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Скрываем временные слоты
    document.getElementById('time-slots').classList.add('hidden');
    
    // Возвращаемся к первому шагу
    showStep(1);
    
    // Обновляем статистику просмотров
    incrementDemoViews();
}

// Статистика демо
function updateDemoStats() {
    // Увеличиваем счетчик просмотров при загрузке
    incrementDemoViews();
}

function incrementDemoViews() {
    const currentViews = parseInt(localStorage.getItem('mobile-demo-views') || 0);
    const newViews = currentViews + 1;
    localStorage.setItem('mobile-demo-views', newViews);
    
    console.log(`📊 Просмотров мобильного демо: ${newViews}`);
}

function incrementDemoCompletions() {
    const currentCompletions = parseInt(localStorage.getItem('mobile-demo-completions') || 0);
    const newCompletions = currentCompletions + 1;
    localStorage.setItem('mobile-demo-completions', newCompletions);
    
    console.log(`✅ Завершений мобильного демо: ${newCompletions}`);
}

// Дополнительные утилиты
const AppUtils = {
    // Симуляция тактильной отдачи (если поддерживается)
    hapticFeedback: function(type = 'light') {
        if ('vibrate' in navigator) {
            switch(type) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(25);
                    break;
                case 'heavy':
                    navigator.vibrate(50);
                    break;
            }
        }
    },
    
    // Проверка мобильного устройства
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Проверка iOS
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    },
    
    // Получение текущего времени
    getCurrentTime: function() {
        return new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
};

// Обработка ошибок
window.addEventListener('error', function(e) {
    console.error('❌ Ошибка в мобильном приложении:', e.error);
});

// Обработка незавершенных промисов
window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ Необработанное отклонение промиса:', e.reason);
});

// PWA Support (базовая поддержка)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        console.log('🔧 Service Worker поддерживается, но не зарегистрирован для демо');
    });
}

// Экспорт для отладки
window.OkoshkoMobileApp = {
    appState,
    showStep,
    restartApp,
    AppUtils,
    version: '1.0.0'
};

console.log('✅ Окошко Mobile App загружено', window.OkoshkoMobileApp);