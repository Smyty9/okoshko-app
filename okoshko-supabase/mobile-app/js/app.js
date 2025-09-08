// ============================================
// ИНТЕГРАЦИЯ SUPABASE С ПРИЛОЖЕНИЕМ ОКОШКО
// ============================================

// ШАГ 1: Добавьте в ваш index.html перед </body>
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// ШАГ 2: Замените начало вашего app.js на этот код:

// ============================================
// ИНИЦИАЛИЗАЦИЯ SUPABASE
// ============================================

// Настройки подключения к локальному Supabase
const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Создаем клиент Supabase
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// ЗАМЕНА ФУНКЦИЙ РАБОТЫ С ДАННЫМИ
// ============================================

// Состояние приложения
let appState = {
    currentStep: 1,
    selectedService: null,
    selectedServiceName: null,
    selectedPrice: null,
    selectedDuration: null,
    selectedDate: null,
    selectedTime: null,
    services: [],
    currentMaster: null
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Инициализация приложения с Supabase...');
    initMobileApp();
});

async function initMobileApp() {
    // Загружаем мастера
    await loadMaster();
    
    // Загружаем услуги из Supabase
    await loadServicesFromSupabase();
    
    // Генерируем календарь
    generateCalendar();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Показываем первый шаг
    showStep(1);
}

// ============================================
// ЗАГРУЗКА ДАННЫХ ИЗ SUPABASE
// ============================================

// Загрузка информации о мастере
async function loadMaster() {
    try {
        const { data, error } = await supabase
            .from('masters')
            .select('*')
            .limit(1)
            .single();
        
        if (error) throw error;
        
        appState.currentMaster = data;
        console.log('✅ Мастер загружен:', data);
        
        // Обновляем UI с информацией о мастере
        updateMasterInfo(data);
    } catch (error) {
        console.error('❌ Ошибка загрузки мастера:', error);
    }
}

// Обновление информации о мастере в UI
function updateMasterInfo(master) {
    const masterNameElements = document.querySelectorAll('h3');
    masterNameElements.forEach(el => {
        if (el.textContent.includes('Анна Смирнова')) {
            el.textContent = master.name;
        }
    });
    
    const descriptionElements = document.querySelectorAll('p.text-gray-600');
    descriptionElements.forEach(el => {
        if (el.textContent.includes('Мастер маникюра')) {
            el.textContent = master.description || 'Мастер';
        }
    });
}

// Загрузка услуг из Supabase вместо localStorage
async function loadServicesFromSupabase() {
    try {
        console.log('📦 Загрузка услуг из Supabase...');
        
        // Получаем активные услуги для мастера
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('is_popular', { ascending: false })
            .order('name');
        
        if (error) throw error;
        
        appState.services = data;
        console.log(`✅ Загружено ${data.length} услуг`);
        
        // Отображаем услуги
        renderServices();
    } catch (error) {
        console.error('❌ Ошибка загрузки услуг:', error);
        
        // Если Supabase недоступен, используем демо-данные
        loadDefaultServices();
    }
}

// Резервные демо-данные
function loadDefaultServices() {
    console.log('⚠️ Используем демо-данные');
    appState.services = [
        {
            id: '1',
            name: 'Классический маникюр',
            description: 'Базовый уход за ногтями',
            price: 1500,
            duration: 60,
            category: 'manicure',
            icon: 'fa-hand-sparkles',
            is_active: true,
            is_popular: false
        },
        {
            id: '2',
            name: 'Гель-лак',
            description: 'Долговременное покрытие',
            price: 2200,
            duration: 90,
            category: 'manicure',
            icon: 'fa-paint-brush',
            is_active: true,
            is_popular: true
        }
    ];
    renderServices();
}

// Отображение услуг в UI
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
            </div>
        `;
        return;
    }
    
    // Создаем элементы для каждой услуги
    appState.services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition-all duration-200';
        serviceElement.dataset.serviceId = service.id;
        serviceElement.dataset.price = service.price;
        serviceElement.dataset.duration = service.duration;
        
        serviceElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-semibold">
                        ${service.name}
                        ${service.is_popular ? '<span class="ml-2 px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">Популярная</span>' : ''}
                    </div>
                    ${service.description ? `<div class="text-sm text-gray-500">${service.description}</div>` : ''}
                    <div class="text-sm text-gray-600">${service.duration} минут</div>
                </div>
                <div class="text-purple-600 font-bold">${service.price}₽</div>
            </div>
        `;
        
        // Добавляем обработчик клика
        serviceElement.addEventListener('click', function() {
            selectService(service, this);
        });
        
        container.appendChild(serviceElement);
    });
}

// ============================================
// СОЗДАНИЕ ЗАПИСИ В SUPABASE
// ============================================

// Выбор услуги
function selectService(service, element) {
    // Убираем выделение с других услуг
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Выделяем выбранную услугу
    element.classList.add('selected');
    
    // Сохраняем выбор
    appState.selectedService = service.id;
    appState.selectedServiceName = service.name;
    appState.selectedPrice = service.price;
    appState.selectedDuration = service.duration;
    
    // Переходим к следующему шагу
    setTimeout(() => {
        showStep(2);
    }, 500);
}

// Подтверждение записи - сохранение в Supabase
async function confirmBooking() {
    const button = document.getElementById('confirm-booking');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (!button) return;
    
    // Показываем загрузку
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Записываем...';
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    try {
        // Создаем объект записи
        const bookingData = {
            master_id: appState.currentMaster.id,
            service_id: appState.selectedService,
            booking_date: formatDateForDB(appState.selectedDate),
            booking_time: appState.selectedTime + ':00',
            end_time: calculateEndTime(appState.selectedTime, appState.selectedDuration),
            status: 'confirmed',
            price: appState.selectedPrice,
            client_name: 'Клиент из приложения',
            client_phone: '+7 (999) 123-45-67',
            notes: 'Запись через мобильное приложение'
        };
        
        console.log('📝 Создаем запись:', bookingData);
        
        // Сохраняем в Supabase
        const { data, error } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select();
        
        if (error) throw error;
        
        console.log('✅ Запись создана:', data);
        
        // Показываем успех
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
            showStep(4);
            updateSuccessMessage();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Ошибка создания записи:', error);
        
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        alert('Ошибка при создании записи: ' + error.message);
        
        // Восстанавливаем кнопку
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Записаться';
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Форматирование даты для БД
function formatDateForDB(day) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
}

// Вычисление времени окончания
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
}

// ============================================
// РЕАЛЬНОЕ ВРЕМЯ (REALTIME)
// ============================================

// Подписка на изменения услуг в реальном времени
function subscribeToServices() {
    console.log('📡 Подписываемся на обновления услуг...');
    
    const subscription = supabase
        .channel('services-changes')
        .on(
            'postgres_changes',
            {
                event: '*', // Слушаем все события (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'services'
            },
            (payload) => {
                console.log('📨 Изменение услуг:', payload);
                
                // Перезагружаем услуги при любом изменении
                loadServicesFromSupabase();
            }
        )
        .subscribe();
    
    return subscription;
}

// Подписка на новые записи
function subscribeToBookings() {
    console.log('📡 Подписываемся на новые записи...');
    
    const subscription = supabase
        .channel('bookings-changes')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'bookings'
            },
            (payload) => {
                console.log('📨 Новая запись:', payload.new);
                
                // Можно показать уведомление о новой записи
                // showNotification('Новая запись создана!');
            }
        )
        .subscribe();
    
    return subscription;
}

// Активируем подписки
subscribeToServices();
subscribeToBookings();

// ============================================
// ОСТАЛЬНЫЕ ФУНКЦИИ ИЗ ВАШЕГО app.js
// Оставьте все остальные функции как есть:
// - generateCalendar()
// - selectDate()
// - showTimeSlots()
// - selectTime()
// - showStep()
// - и другие...
// ============================================

console.log('✅ Интеграция с Supabase завершена!');
console.log('📌 Откройте админку: http://localhost:3000');
console.log('📌 API доступно на: http://localhost:8000');

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