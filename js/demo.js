// Окошко - Demo functionality
// Интерактивная демонстрация процесса записи к мастеру

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('demo.html')) {
        initDemo();
    }
});

let demoState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    selectedPrice: null
};

function initDemo() {
    // Счетчики статистики
    updateDemoStats();
    
    // Генерация календаря
    generateCalendar();
    
    // Обработчики событий
    setupEventListeners();
    
    // Анимация входа
    animatePhoneEntry();
}

function setupEventListeners() {
    // Выбор услуги
    document.querySelectorAll('.service-option').forEach(option => {
        option.addEventListener('click', function() {
            selectService(this);
        });
    });
    
    // Кнопка "Назад к услугам"
    document.getElementById('back-to-services').addEventListener('click', function() {
        goToStep(1);
    });
    
    // Подтверждение записи
    document.getElementById('confirm-booking').addEventListener('click', function() {
        confirmBooking();
    });
    
    // Перезапуск демо
    document.getElementById('restart-demo').addEventListener('click', function() {
        restartDemo();
    });
}

function selectService(element) {
    // Убираем выделение с других опций
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('border-purple-500', 'bg-purple-50');
        opt.classList.add('border-gray-200');
    });
    
    // Выделяем выбранную опцию
    element.classList.remove('border-gray-200');
    element.classList.add('border-purple-500', 'bg-purple-50');
    
    // Сохраняем выбранную услугу
    const serviceType = element.dataset.service;
    const serviceName = element.querySelector('div:first-child > div:first-child').textContent;
    const servicePrice = element.querySelector('.text-purple-600').textContent;
    
    demoState.selectedService = serviceName;
    demoState.selectedPrice = servicePrice;
    
    // Переходим к выбору времени через небольшую задержку
    setTimeout(() => {
        goToStep(2);
    }, 800);
}

function generateCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
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
        emptyDay.className = 'p-2';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day p-2 text-center cursor-pointer rounded text-sm';
        dayElement.textContent = day;
        
        // Доступные дни (пропускаем прошедшие и выходные для демо)
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        const isPast = day < today.getDate();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        if (!isPast && !isWeekend && day <= today.getDate() + 14) {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', function() {
                selectDate(day);
            });
        } else {
            dayElement.classList.add('text-gray-300', 'cursor-not-allowed');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function selectDate(day) {
    // Убираем выделение с других дней
    document.querySelectorAll('.calendar-day').forEach(d => {
        d.classList.remove('selected');
    });
    
    // Выделяем выбранный день
    event.target.classList.add('selected');
    
    demoState.selectedDate = day;
    
    // Показываем временные слоты
    showTimeSlots(day);
}

function showTimeSlots(day) {
    const timeSlotsContainer = document.getElementById('time-slots');
    const selectedDateSpan = document.getElementById('selected-date');
    const timeGrid = document.getElementById('time-grid');
    
    selectedDateSpan.textContent = `${day} сентября`;
    
    // Генерируем временные слоты
    const timeSlots = [
        '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00'
    ];
    
    // Некоторые слоты делаем недоступными для реалистичности
    const unavailableSlots = ['11:00', '13:00', '17:00'];
    
    timeGrid.innerHTML = '';
    
    timeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        const isUnavailable = unavailableSlots.includes(time);
        
        timeSlot.className = `p-3 text-center rounded-lg cursor-pointer transition-colors ${
            isUnavailable 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`;
        timeSlot.textContent = time;
        
        if (!isUnavailable) {
            timeSlot.addEventListener('click', function() {
                selectTime(time);
            });
        }
        
        timeGrid.appendChild(timeSlot);
    });
    
    timeSlotsContainer.classList.remove('hidden');
    
    // Плавная прокрутка к временным слотам
    setTimeout(() => {
        timeSlotsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function selectTime(time) {
    // Убираем выделение с других временных слотов
    document.querySelectorAll('#time-grid > div').forEach(slot => {
        slot.classList.remove('bg-purple-200', 'text-purple-800');
        if (!slot.classList.contains('cursor-not-allowed')) {
            slot.classList.add('bg-green-100', 'text-green-700');
        }
    });
    
    // Выделяем выбранный слот
    event.target.classList.remove('bg-green-100', 'text-green-700');
    event.target.classList.add('bg-purple-200', 'text-purple-800');
    
    demoState.selectedTime = time;
    
    // Переходим к подтверждению через небольшую задержку
    setTimeout(() => {
        goToStep(3);
    }, 1000);
}

function confirmBooking() {
    // Анимация загрузки
    const button = document.getElementById('confirm-booking');
    const originalText = button.textContent;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Записываем...';
    button.disabled = true;
    
    setTimeout(() => {
        goToStep(4);
        button.textContent = originalText;
        button.disabled = false;
        
        // Обновляем статистику
        incrementDemoCompletions();
    }, 2000);
}

function goToStep(stepNumber) {
    // Скрываем все шаги
    document.querySelectorAll('.demo-step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Показываем нужный шаг
    document.getElementById(`step-${stepNumber}`).classList.remove('hidden');
    
    // Обновляем гид
    updateStepGuide(stepNumber);
    
    // Заполняем данные в подтверждении
    if (stepNumber === 3) {
        fillConfirmationData();
    }
    
    demoState.currentStep = stepNumber;
    
    // Добавляем анимацию появления
    const activeStep = document.getElementById(`step-${stepNumber}`);
    activeStep.style.opacity = '0';
    activeStep.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        activeStep.style.transition = 'all 0.3s ease';
        activeStep.style.opacity = '1';
        activeStep.style.transform = 'translateY(0)';
    }, 50);
}

function updateStepGuide(activeStepNumber) {
    document.querySelectorAll('.step-guide').forEach((guide, index) => {
        const stepNum = index + 1;
        
        if (stepNum === activeStepNumber) {
            guide.classList.remove('bg-gray-100');
            guide.classList.add('step-active');
            guide.querySelector('div:first-child').classList.remove('bg-gray-300', 'text-gray-700');
            guide.querySelector('div:first-child').classList.add('bg-white/20');
            guide.querySelector('div:last-child').classList.remove('text-gray-700');
            guide.querySelector('div:last-child').classList.add('text-white');
        } else if (stepNum < activeStepNumber) {
            guide.classList.remove('bg-gray-100', 'step-active');
            guide.classList.add('bg-green-100');
            guide.querySelector('div:first-child').classList.remove('bg-gray-300', 'bg-white/20');
            guide.querySelector('div:first-child').classList.add('bg-green-500', 'text-white');
            guide.querySelector('div:last-child').classList.remove('text-gray-700', 'text-white');
            guide.querySelector('div:last-child').classList.add('text-green-800');
        } else {
            guide.classList.remove('step-active', 'bg-green-100');
            guide.classList.add('bg-gray-100');
            guide.querySelector('div:first-child').classList.remove('bg-green-500', 'bg-white/20');
            guide.querySelector('div:first-child').classList.add('bg-gray-300', 'text-gray-700');
            guide.querySelector('div:last-child').classList.remove('text-white', 'text-green-800');
            guide.querySelector('div:last-child').classList.add('text-gray-700');
        }
    });
}

function fillConfirmationData() {
    document.getElementById('selected-service').textContent = demoState.selectedService;
    document.getElementById('selected-datetime').textContent = `${demoState.selectedDate} сентября, ${demoState.selectedTime}`;
    document.getElementById('selected-price').textContent = demoState.selectedPrice;
}

function restartDemo() {
    // Сбрасываем состояние
    demoState = {
        currentStep: 1,
        selectedService: null,
        selectedDate: null,
        selectedTime: null,
        selectedPrice: null
    };
    
    // Убираем все выделения
    document.querySelectorAll('.service-option').forEach(opt => {
        opt.classList.remove('border-purple-500', 'bg-purple-50');
        opt.classList.add('border-gray-200');
    });
    
    document.querySelectorAll('.calendar-day').forEach(d => {
        d.classList.remove('selected');
    });
    
    document.getElementById('time-slots').classList.add('hidden');
    
    // Возвращаемся к первому шагу
    goToStep(1);
    
    // Обновляем статистику просмотров
    incrementDemoViews();
}

function animatePhoneEntry() {
    const phone = document.querySelector('.demo-phone');
    phone.style.transform = 'translateY(50px)';
    phone.style.opacity = '0';
    
    setTimeout(() => {
        phone.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        phone.style.transform = 'translateY(0)';
        phone.style.opacity = '1';
    }, 300);
}

// Статистика демо
function updateDemoStats() {
    const views = localStorage.getItem('demo-views') || 0;
    const completions = localStorage.getItem('demo-completions') || 0;
    
    document.getElementById('demo-views').textContent = views;
    document.getElementById('demo-completions').textContent = completions;
    
    // Анимация счетчиков
    animateCounter(document.getElementById('demo-views'), parseInt(views));
    animateCounter(document.getElementById('demo-completions'), parseInt(completions));
    
    // Увеличиваем счетчик просмотров при загрузке страницы
    incrementDemoViews();
}

function incrementDemoViews() {
    const currentViews = parseInt(localStorage.getItem('demo-views') || 0);
    const newViews = currentViews + 1;
    localStorage.setItem('demo-views', newViews);
    animateCounter(document.getElementById('demo-views'), newViews);
}

function incrementDemoCompletions() {
    const currentCompletions = parseInt(localStorage.getItem('demo-completions') || 0);
    const newCompletions = currentCompletions + 1;
    localStorage.setItem('demo-completions', newCompletions);
    animateCounter(document.getElementById('demo-completions'), newCompletions);
}

function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = Date.now();
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Добавляем реалистичные задержки и анимации
function addRealisticDelays() {
    // Имитация загрузки данных мастера
    setTimeout(() => {
        const masterInfo = document.querySelector('#step-1 .text-center');
        masterInfo.style.opacity = '0.5';
        setTimeout(() => {
            masterInfo.style.opacity = '1';
        }, 500);
    }, 1000);
}

// Дополнительные эффекты для демо
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('demo.html')) {
        // Добавляем пульсацию к доступным временным слотам
        setInterval(() => {
            const availableSlots = document.querySelectorAll('.bg-green-100:not(.cursor-not-allowed)');
            availableSlots.forEach(slot => {
                slot.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    slot.style.transform = 'scale(1)';
                }, 200);
            });
        }, 5000);
        
        // Добавляем hover эффекты для календаря
        document.addEventListener('mouseover', function(e) {
            if (e.target.classList.contains('calendar-day') && e.target.classList.contains('available')) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.zIndex = '10';
            }
        });
        
        document.addEventListener('mouseout', function(e) {
            if (e.target.classList.contains('calendar-day')) {
                e.target.style.transform = 'scale(1)';
                e.target.style.zIndex = 'auto';
            }
        });
    }
});

// Экспорт для использования в других скриптах
window.demoUtils = {
    goToStep,
    restartDemo,
    demoState
};