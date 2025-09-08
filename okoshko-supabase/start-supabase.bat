@echo off
echo ======================================
echo   ЗАПУСК SUPABASE ДЛЯ ПРОЕКТА ОКОШКО
echo ======================================
echo.

REM Проверяем, установлен ли Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Docker не установлен!
    echo Пожалуйста, установите Docker Desktop с https://www.docker.com
    pause
    exit /b 1
)

REM Проверяем, запущен ли Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Docker не запущен!
    echo Запустите Docker Desktop и попробуйте снова.
    pause
    exit /b 1
)

echo [OK] Docker установлен и запущен
echo.

REM Останавливаем контейнеры, если они запущены
echo Останавливаем старые контейнеры (если есть)...
docker-compose down >nul 2>&1

echo.
echo Запускаем Supabase...
echo Это может занять 2-3 минуты при первом запуске.
echo.

REM Запускаем контейнеры
docker-compose up -d

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Не удалось запустить Supabase
    echo Проверьте логи: docker-compose logs
    pause
    exit /b 1
)

echo.
echo ======================================
echo   SUPABASE УСПЕШНО ЗАПУЩЕН!
echo ======================================
echo.
echo Доступные сервисы:
echo.
echo   Приложение:    http://localhost:8000
echo   Админ-панель:  http://localhost:3000
echo   База данных:   localhost:5432
echo.
echo Тестовая страница: откройте test.html в браузере
echo.
echo Для остановки закройте это окно и запустите stop-supabase.bat
echo.
echo Нажмите любую клавишу для просмотра логов...
pause >nul

REM Показываем логи
docker-compose logs -f