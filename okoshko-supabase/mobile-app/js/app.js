// ============================================
// Окошко - Mobile App JavaScript v2.2
// Интеграция с рабочей Supabase
// ============================================

document.addEventListener('DOMContentLoaded', () => initMobileApp());

// --- SUPABASE SETUP ---
const SUPABASE_URL = 'http://localhost:8000';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- APPLICATION STATE ---
let appState = {
    currentStep: 1,
    selectedService: null,
    selectedDate: null,
    selectedTime: null,
    services: [],
    master: null
};

// --- CORE LOGIC ---
async function initMobileApp() {
    console.log('🚀 Приложение запущено, подключаемся к Supabase...');
    renderServicesLoading();
    
    await loadMasterData();
    if (appState.master) {
        await loadServicesData();
    }
    
    generateCalendar();
    setupEventListeners();
    showStep(1);
}

async function loadMasterData() {
    try {
        const { data, error } = await supabase.from('masters').select('*').limit(1).single();
        if (error) throw error;
        appState.master = data;
        console.log('✅ Мастер загружен:', data);
        updateMasterInfoUI(data);
    } catch (error) {
        console.error('❌ Ошибка загрузки мастера:', error);
        renderServicesError('Не удалось загрузить данные мастера.');
    }
}

async function loadServicesData() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('master_id', appState.master.id)
            .eq('is_active', true)
            .order('is_popular', { ascending: false });
        if (error) throw error;
        appState.services = data;
        console.log(`📦 Загружено ${data.length} услуг из Supabase.`);
        renderServices();
    } catch (error) {
        console.error('❌ Ошибка загрузки услуг:', error);
        renderServicesError('Не удалось загрузить услуги.');
    }
}

async function confirmBooking() {
    const button = document.getElementById('confirm-booking');
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Запись...';

    const bookingStartTime = new Date(`${appState.selectedDate.toISOString().split('T')[0]}T${appState.selectedTime}`);
    const bookingEndTime = new Date(bookingStartTime.getTime() + appState.selectedService.duration_minutes * 60000);

    const bookingData = {
        id: supabase.auth.getSession() ? (await supabase.auth.getSession()).data.session.user.id : undefined, // Placeholder
        master_id: appState.master.id,
        service_id: appState.selectedService.id,
        client_name: 'Иван Петров (Демо)',
        start_time: bookingStartTime.toISOString(),
        end_time: bookingEndTime.toISOString(),
        status: 'active'
    };

    try {
        const { data, error } = await supabase.from('bookings').insert(bookingData).select();
        if (error) throw error;
        console.log('✅ Запись успешно создана:', data);
        showStep(4);
    } catch (error) {
        console.error('❌ Ошибка создания записи:', error);
        alert('Не удалось создать запись. Пожалуйста, попробуйте снова.');
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check mr-2"></i>Записаться';
    }
}


// --- UI RENDERING ---
function updateMasterInfoUI(master) {
    document.querySelector('#step-1 h3').textContent = master.full_name;
    document.querySelector('#step-1 p.text-gray-600').textContent = master.description;
    document.querySelector('#step-3 span.font-semibold').textContent = master.full_name;
}

function renderServicesLoading() {
    const container = document.querySelector('#step-1 .space-y-3');
    container.innerHTML = `<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-purple-600 text-2xl"></i><p class="mt-2 text-gray-500">Загрузка...</p></div>`;
}

function renderServicesError(message) {
    const container = document.querySelector('#step-1 .space-y-3');
    container.innerHTML = `<div class="text-center py-10 text-red-500"><i class="fas fa-exclamation-triangle mb-2"></i><p>${message}</p></div>`;
}

function renderServices() {
    const container = document.querySelector('#step-1 .space-y-3');
    container.innerHTML = '';
    if (appState.services.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 py-10">Нет доступных услуг.</p>`;
        return;
    }
    appState.services.forEach(service => {
        const el = document.createElement('div');
        el.className = 'service-option border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-purple-500 transition-all';
        el.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <div class="font-semibold">${service.title}</div>
                    <div class="text-sm text-gray-600">${service.duration_minutes} минут</div>
                </div>
                <div class="text-purple-600 font-bold">${service.price}₽</div>
            </div>
        `;
        el.addEventListener('click', () => selectService(service, el));
        container.appendChild(el);
    });
}

// --- EVENT HANDLERS & NAVIGATION ---
function selectService(service, element) {
    appState.selectedService = service;
    document.querySelectorAll('.service-option').forEach(el => el.classList.remove('selected', 'border-purple-500'));
    element.classList.add('selected', 'border-purple-500');
    setTimeout(() => showStep(2), 300);
}

function selectDate(date) {
    appState.selectedDate = date;
    document.querySelectorAll('.calendar-day.selected').forEach(d => d.classList.remove('selected', 'bg-purple-600', 'text-white'));
    event.target.classList.add('selected', 'bg-purple-600', 'text-white');
    showTimeSlots(date);
}

function selectTime(time) {
    appState.selectedTime = time;
    document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected', 'bg-purple-600', 'text-white'));
    event.target.classList.add('selected', 'bg-purple-600', 'text-white');
    setTimeout(() => showStep(3), 300);
}

function showStep(step) {
    appState.currentStep = step;
    document.querySelectorAll('.step-content').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');
    document.getElementById('back-btn').classList.toggle('hidden', step === 1);
    if (step === 3) fillConfirmationData();
    if (step === 4) updateSuccessMessage();
}

function fillConfirmationData() {
    document.getElementById('selected-service').textContent = appState.selectedService.title;
    document.getElementById('selected-datetime').textContent = `${appState.selectedDate.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})}, ${appState.selectedTime}`;
    document.getElementById('selected-price').textContent = `${appState.selectedService.price}₽`;
}

function updateSuccessMessage() {
    document.getElementById('success-message').textContent = `Вы записаны к мастеру ${appState.master.full_name} на ${appState.selectedDate.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'})} в ${appState.selectedTime}`;
}

function restartApp() {
    appState.selectedService = null;
    appState.selectedDate = null;
    appState.selectedTime = null;
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected', 'border-purple-500', 'bg-purple-600', 'text-white'));
    document.getElementById('time-slots').classList.add('hidden');
    showStep(1);
}

function setupEventListeners() {
    document.getElementById('back-btn').addEventListener('click', () => showStep(appState.currentStep - 1));
    document.getElementById('confirm-booking').addEventListener('click', confirmBooking);
    document.getElementById('restart-demo').addEventListener('click', restartApp);
}

// --- CALENDAR & TIME SLOTS ---
function generateCalendar() {
    const grid = document.getElementById('calendar-grid');
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    document.getElementById('calendar-month').textContent = today.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    grid.innerHTML = '';
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) grid.appendChild(document.createElement('div'));
    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        el.textContent = day;
        el.className = 'calendar-day flex items-center justify-center p-1 rounded-full';
        const date = new Date(year, month, day);
        if (date < today.setHours(0,0,0,0) || date.getDay() === 0 || date.getDay() === 6) {
            el.classList.add('disabled', 'text-gray-300');
        } else {
            el.classList.add('available', 'cursor-pointer', 'hover:bg-purple-100');
            el.addEventListener('click', () => selectDate(date));
        }
        grid.appendChild(el);
    }
}

function showTimeSlots(date) {
    const container = document.getElementById('time-slots');
    container.classList.remove('hidden');
    document.getElementById('selected-date').textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const timeGrid = document.getElementById('time-grid');
    timeGrid.innerHTML = '';
    const slots = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00']; // Demo slots
    slots.forEach(time => {
        const el = document.createElement('button');
        el.className = 'time-slot p-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200';
        el.textContent = time;
        el.addEventListener('click', () => selectTime(time));
        timeGrid.appendChild(el);
    });
}