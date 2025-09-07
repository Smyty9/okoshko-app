// Окошко - Mobile App JavaScript с динамической загрузкой услуг
// Обновленная версия с поддержкой админ-панели

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
    selectedTime: null,
    services: [] // Хранение загруженных услуг
};

// Основная инициализация приложения
function initMobileApp() {
    console.log('🚀 Окошко Mobile App - Инициализация');
    
    // Загрузка услуг из localStorage
    loadServicesFromStorage();
    
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

// Загрузка услуг из localStorage
function loadServicesFromStorage() {
    const stored = localStorage.getItem('okoshko_services');
    
    if (stored) {
        try {
            const allServices = JSON.parse(stored);
            // Фильтруем только активные услуги
            appState.services = allServices.filter(service => service.active);
            console.log(`📦 Загружено ${appState.services.length} активных услуг`);
        } catch (error) {
            console.error('❌ Ошибка загрузки услуг:', error);
            loadDefaultServices();
        }
    } else {
        loadDefaultServices();
    }
    
    // Рендерим услуги
    renderServices();
}

// Загрузка услуг по умолчанию
function loadDefaultServices() {
    appState.services = [
        {
            id: 1,
            name: 'Классический маникюр',
            description: 'Базовый уход за ногтями',
            price: 1500,
            duration: 60,
            category: 'manicure',
            icon: 'fa-hand-sparkles',
            active: true,
            popular: false
        },
        {
            id: 2,
            name: 'Гель-лак',
            description: 'Долговременное покрытие',
            price: 2200,
            duration: 90,
            category: 'manicure',
            icon: 'fa-paint-brush',
            active: true,
            popular: true
        },
        {
            id: 3,
            name: 'Дизайн + покрытие',
            description: 'Художественный дизайн ногтей',
            price: 3500,
            duration: 120,
            category: 'design',
            icon: 'fa-palette',
            active: true,
            popular: true
        }
    ];
    
    // Сохраняем дефолтные услуги
    localStorage.setItem('okoshko_services', JSON.stringify(appState.services));
}

// Рендеринг услуг в UI
function renderServices() {
    const container = document.querySelector('#step-1 .space-y-3');
    
    if (!container) {
        console.error('❌ Контейнер для услуг не найден');
        return;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (appState.services.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
                <p>Нет доступных услуг</p>
                <p class="text-sm mt-2">Свяжитесь с администратором</p>
            </div>
        `;
        return;
    }
    
    // Рендерим каждую услугу
    appState.services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition-all duration-200';
        serviceElement.dataset.service = service.id;
        serviceElement.dataset.price = service.price;
        serviceElement.dataset.duration = service.duration;
        
        serviceElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-semibold">
                        ${service.name}
                        ${service.popular ? '<span class="ml-2 px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">Популярная</span>' : ''}
                    </div>
                    ${service.description ? `<div class="text-sm text-gray-500">${service.description}</div>` : ''}
                    <div class="text-sm text-gray-600">${service.duration} минут</div>
                </div>
                <div class="text-right">
                    <div class="text-purple-600 font-bold text-lg">${service.price}₽</div>
                    ${service.icon ? `
                        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-2 ml-auto">
                            <i class="fas ${service.icon} text-purple-600 text-sm"></i>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Добавляем обработчик клика
        serviceElement.addEventListener('click', function(e) {
            e.preventDefault();
            selectService(this, service);
        });
        
        container.appendChild(serviceElement);
    });
}

// Настройка всех обработчиков событий
function setupEventListeners() {
    // Кнопка "Назад" в хедере
    document.getElementById('back-btn')?.addEventListener('click', function() {
        navigateBack();
    });
    
    // Подтверждение записи
    document.getElementById('confirm-booking')?.addEventListener('click', function() {
        confirmBooking();
    });
    
    // Перезапуск демо
    document.getElementById('restart-demo')?.addEventListener('click', function() {
        restartApp();
    });
    
    // Предотвращение долгого нажатия на кнопках
    document.querySelectorAll('button, .service-option').forEach(element => {
        element.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
    
    // Слушаем изменения в localStorage (для синхронизации между вкладками)
    window.addEventListener('storage', function(e) {
        if (e.key === 'okoshko_services') {
            console.log('📦 Обнаружены изменения услуг, перезагружаем...');
            loadServicesFromStorage();
        }
    });
}

// Настройка тач-событий для мобильных устройств
function setupTouchEvents() {
    // Добавляем haptic feedback симуляцию
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('button, .service-option, .calendar-day, .time-slot')) {
            const element = e.target.closest('button, .service-option, .calendar-day, .time-slot');
            element.classList.add('haptic-light');
            setTimeout(() => {
                element.classList.remove('haptic-light');
            }, 100);
        }
    });
}

// Выбор услуги (обновленная версия)
function selectService(element, service) {
    // Убираем выделение с других опций
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Выделяем выбранную опцию
    element.classList.add('selected');
    
    // Сохраняем данные услуги
    appState.selectedService = service.id;
    appState.selectedServiceName = service.name;
    appState.selectedPrice = service.price;
    appState.selectedDuration = service.duration;
    
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
    
    const monthElement = document.getElementById('calendar-month');
    if (monthElement) {
        monthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    if (!calendarGrid) return;
    
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
    
    if (!timeSlotsContainer || !selectedDateSpan || !timeGrid) return;
    
    // Обновляем заголовок
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    selectedDateSpan.textContent = `${day} ${monthNames[date.getMonth()]}`;
    
    // Генерируем временные слоты с учетом длительности услуги
    const selectedServiceDuration = appState.selectedDuration || 60;
    const timeSlots = generateTimeSlots(selectedServiceDuration);
    
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

// Генерация временных слотов с учетом длительности услуги
function generateTimeSlots(duration) {
    const slots = [];
    const startHour = 10; // Начало рабочего дня
    const endHour = 18; // Конец рабочего дня
    const slotInterval = 30; // Интервал между слотами в минутах
    
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
            const endTime = hour * 60 + minute + duration;
            if (endTime <= endHour * 60) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(timeString);
            }
        }
    }
    
    return slots;
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
    if (currentStepElement) {
        currentStepElement.classList.remove('hidden');
    }
    
    // Управляем кнопкой "Назад"
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        if (stepNumber === 1) {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }
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
    const serviceElement = document.getElementById('selected-service');
    const datetimeElement = document.getElementById('selected-datetime');
    const priceElement = document.getElementById('selected-price');
    
    if (serviceElement) {
        serviceElement.textContent = appState.selectedServiceName;
    }
    
    if (datetimeElement) {
        const monthNames = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        const today = new Date();
        datetimeElement.textContent = 
            `${appState.selectedDate} ${monthNames[today.getMonth()]}, ${appState.selectedTime}`;
    }
    
    if (priceElement) {
        priceElement.textContent = `${appState.selectedPrice}₽`;
    }
}

// Подтверждение записи
function confirmBooking() {
    const button = document.getElementById('confirm-booking');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!button) return;
    
    // Показываем состояние загрузки
    button.innerHTML = '<div class="loading-spinner mr-2"></div>Записываем...';
    button.disabled = true;
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Симуляция API запроса
    setTimeout(() => {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        showStep(4);
        
        // Обновляем статистику
        incrementDemoCompletions();
        
        // Восстанавливаем кнопку
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Записаться';
        button.disabled = false;
        
        // Обновляем сообщение об успехе
        updateSuccessMessage();
        
        // Сохраняем запись в истории
        saveBookingToHistory();
        
    }, 2500);
}

// Сохранение записи в истории
function saveBookingToHistory() {
    const booking = {
        id: Date.now(),
        service: appState.selectedServiceName,
        date: appState.selectedDate,
        time: appState.selectedTime,
        price: appState.selectedPrice,
        timestamp: new Date().toISOString()
    };
    
    let history = JSON.parse(localStorage.getItem('okoshko_bookings') || '[]');
    history.unshift(booking);
    
    // Храним только последние 50 записей
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('okoshko_bookings', JSON.stringify(history));
    console.log('📝 Запись сохранена в истории');
}

// Обновление сообщения об успехе
function updateSuccessMessage() {
    const monthNames = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const today = new Date();
    
    const message = `Вы записаны к мастеру Анне Смирновой на ${appState.selectedDate} ${monthNames[today.getMonth()]} в ${appState.selectedTime}`;
    const messageElement = document.getElementById('success-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

// Перезапуск приложения
function restartApp() {
    console.log('🔄 Перезапуск приложения');
    
    // Сбрасываем состояние
    appState = {
        ...appState,
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
    const timeSlotsElement = document.getElementById('time-slots');
    if (timeSlotsElement) {
        timeSlotsElement.classList.add('hidden');
    }
    
    // Перезагружаем услуги (могли измениться)
    loadServicesFromStorage();
    
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
    const currentViews = parseInt(localStorage.getItem('mobile-demo-views') || '0');
    const newViews = currentViews + 1;
    localStorage.setItem('mobile-demo-views', newViews);
    
    console.log(`📊 Просмотров мобильного демо: ${newViews}`);
}

function incrementDemoCompletions() {
    const currentCompletions = parseInt(localStorage.getItem('mobile-demo-completions') || '0');
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
    },
    
    // Получение истории записей
    getBookingHistory: function() {
        return JSON.parse(localStorage.getItem('okoshko_bookings') || '[]');
    },
    
    // Очистка истории записей
    clearBookingHistory: function() {
        localStorage.removeItem('okoshko_bookings');
        console.log('🗑️ История записей очищена');
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
    loadServicesFromStorage,
    version: '2.0.0' // Обновлена версия
};

console.log('✅ Окошко Mobile App v2.0 загружено', window.OkoshkoMobileApp);