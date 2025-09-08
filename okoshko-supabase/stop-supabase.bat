@echo off
echo ======================================
echo   ОСТАНОВКА SUPABASE
echo ======================================
echo.

echo Останавливаем контейнеры...
docker-compose down

if %errorlevel% eq 0 (
    echo.
    echo [OK] Supabase остановлен
) else (
    echo.
    echo [ОШИБКА] Не удалось остановить контейнеры
)

echo.
pause