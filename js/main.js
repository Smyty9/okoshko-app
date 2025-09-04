// Окошко - Main JavaScript File
// Добавляет интерактивность и анимации к сайту

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling для навигационных ссылок
    initSmoothScrolling();
    
    // Инициализация анимаций при прокрутке
    initScrollAnimations();
    
    // Обработчики для кнопок
    initButtonHandlers();
    
    // Мобильное меню
    initMobileMenu();
    
    // Анимация счетчиков
    initCounterAnimations();
    
    // Parallax эффекты
    initParallaxEffects();
    
    // Инициализация Click Spark анимации
    initClickSpark();
});

// Плавная прокрутка к якорям
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Анимации при прокрутке
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Добавляем наблюдение для всех карточек и секций
    const animatedElements = document.querySelectorAll('.card-hover, .space-y-6 > div, .grid > div');
    animatedElements.forEach(el => {
        el.classList.add('opacity-0', 'translate-y-8');
        observer.observe(el);
    });
}

// Обработчики кнопок
function initButtonHandlers() {
    // Кнопки "Попробовать сейчас" и "Открыть в Telegram"
    const allButtons = document.querySelectorAll('button');
    const telegramButtons = Array.from(allButtons).filter(button => 
        button.textContent.includes('Telegram') || 
        button.textContent.includes('Попробовать') ||
        button.textContent.includes('сейчас')
    );
    
    telegramButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Показываем уведомление о том, что это демо
            showNotification('Это демо-версия сайта. Telegram бот @okoshko_app_bot находится в разработке.', 'info');
        });
    });
    
    // Кнопки тарифных планов
    const pricingButtons = document.querySelectorAll('#pricing button');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planElement = this.closest('.border-2');
            if (planElement) {
                const plan = planElement.querySelector('h3').textContent;
                showNotification(`Вы выбрали тариф "${plan}". Регистрация будет доступна после запуска MVP.`, 'success');
            }
        });
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    // Создаем контейнер для уведомлений если его нет
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'fixed top-20 right-4 z-50 space-y-2';
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `${bgColor} text-white px-6 py-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <p class="text-sm font-medium">${message}</p>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Мобильное меню
function initMobileMenu() {
    // Создаем кнопку мобильного меню
    const nav = document.querySelector('nav .flex.justify-between');
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'md:hidden text-gray-600 hover:text-gray-900';
    mobileMenuButton.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    
    // Добавляем кнопку в навигацию
    nav.appendChild(mobileMenuButton);
    
    // Создаем мобильное меню
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-2 hidden';
    
    const menuItems = `
        <a href="#features" class="block text-gray-600 hover:text-gray-900 py-2">Возможности</a>
        <a href="#how-it-works" class="block text-gray-600 hover:text-gray-900 py-2">Как работает</a>
        <a href="#pricing" class="block text-gray-600 hover:text-gray-900 py-2">Тарифы</a>
        <a href="#roadmap" class="block text-gray-600 hover:text-gray-900 py-2">Развитие</a>
        <button class="w-full telegram-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors mt-4">
            <i class="fab fa-telegram-plane mr-2"></i>
            Открыть в Telegram
        </button>
    `;
    
    mobileMenu.innerHTML = menuItems;
    nav.parentElement.appendChild(mobileMenu);
    
    // Обработчик клика по кнопке меню
    mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
    
    // Закрытие меню при клике на ссылку
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.add('hidden');
            mobileMenuButton.querySelector('i').classList.add('fa-bars');
            mobileMenuButton.querySelector('i').classList.remove('fa-times');
        });
    });
}

// Анимация счетчиков в секции статуса проекта
function initCounterAnimations() {
    const counters = document.querySelectorAll('.bg-green-500, .bg-yellow-500, .bg-blue-500');
    
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent.includes('%')) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        if (counter.textContent.includes('%')) {
            counterObserver.observe(counter);
        }
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '%';
    }, 40);
}

// Parallax эффекты
function initParallaxEffects() {
    const heroSection = document.querySelector('.gradient-bg');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Инициализация Click Spark анимации
let clickSparkInstance = null;

function initClickSpark() {
    if (clickSparkInstance) {
        clickSparkInstance.destroy();
    }
    
    // Создаем экземпляр с настройками, подходящими для бренда Окошко
    clickSparkInstance = new ClickSpark({
        sparkColor: '#667eea', // Основной цвет градиента сайта
        sparkSize: 12,
        sparkRadius: 20,
        sparkCount: 6,
        duration: 500,
        easing: 'ease-out',
        extraScale: 1.2
    });
}

// Click Spark Animation Class
class ClickSpark {
    constructor(options = {}) {
        this.sparkColor = options.sparkColor || '#667eea';
        this.sparkSize = options.sparkSize || 10;
        this.sparkRadius = options.sparkRadius || 15;
        this.sparkCount = options.sparkCount || 8;
        this.duration = options.duration || 400;
        this.easing = options.easing || 'ease-out';
        this.extraScale = options.extraScale || 1.0;
        
        this.sparks = [];
        this.animationId = null;
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.bindEvents();
        this.startAnimation();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        document.addEventListener('click', (e) => this.createSparks(e));
    }
    
    createSparks(event) {
        const x = event.clientX;
        const y = event.clientY;
        const now = performance.now();
        
        for (let i = 0; i < this.sparkCount; i++) {
            this.sparks.push({
                x,
                y,
                angle: (2 * Math.PI * i) / this.sparkCount,
                startTime: now
            });
        }
    }
    
    easeFunc(t) {
        switch (this.easing) {
            case 'linear':
                return t;
            case 'ease-in':
                return t * t;
            case 'ease-in-out':
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t * (2 - t);
        }
    }
    
    startAnimation() {
        const draw = (timestamp) => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.sparks = this.sparks.filter(spark => {
                const elapsed = timestamp - spark.startTime;
                if (elapsed >= this.duration) {
                    return false;
                }
                
                const progress = elapsed / this.duration;
                const eased = this.easeFunc(progress);
                
                const distance = eased * this.sparkRadius * this.extraScale;
                const lineLength = this.sparkSize * (1 - eased);
                
                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
                
                this.ctx.strokeStyle = this.sparkColor;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                return true;
            });
            
            this.animationId = requestAnimationFrame(draw);
        };
        
        this.animationId = requestAnimationFrame(draw);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}

// Утилиты - убрал проблемный полифилл

// Добавляем CSS анимации динамически
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .transition-all {
        transition: all 0.3s ease;
    }
    
    .card-hover {
        transition: all 0.3s ease;
    }
    
    .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }
    
    /* Улучшенная анимация для мобильных устройств */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;

document.head.appendChild(style);

// Добавление интерактивности к карточкам функций
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('#features .card-hover');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Easter egg - конфетти при клике на логотип
let clickCount = 0;
document.querySelector('nav .gradient-text').addEventListener('click', function() {
    clickCount++;
    if (clickCount >= 5) {
        createConfetti();
        clickCount = 0;
        showNotification('🎉 Секретная анимация! Окошко любит своих пользователей!', 'success');
    }
});

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#0088cc', '#10b981', '#f59e0b'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}vw;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                pointer-events: none;
                z-index: 9999;
                animation: confetti-fall 3s linear forwards;
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 50);
    }
}

// Добавляем CSS для конфетти
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);