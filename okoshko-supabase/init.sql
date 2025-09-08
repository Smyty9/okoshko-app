-- ============================================
-- ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ "ОКОШКО" (v2 - ИСПРАВЛЕННАЯ)
-- ============================================

-- Включаем расширение для генерации UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ============================================
-- ТАБЛИЦЫ ПРИЛОЖЕНИЯ
-- ============================================

-- Таблица МАСТЕРА
-- Хранит публичную информацию о мастерах
CREATE TABLE public.masters (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    -- user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Связь с пользователями Supabase
    full_name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    rating NUMERIC(2,1) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.masters IS 'Профили мастеров, предоставляющих услуги.';

-- Таблица УСЛУГИ
-- Услуги, которые предоставляет конкретный мастер
CREATE TABLE public.services (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.services IS 'Услуги, которые предлагают мастера.';

-- Таблица БРОНИРОВАНИЯ
-- Все записи клиентов к мастерам
CREATE TABLE public.bookings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    master_id UUID NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    client_telegram_id BIGINT,
    client_name TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.bookings IS 'Записи клиентов к мастерам.';

-- ============================================
-- ИНДЕКСЫ ДЛЯ УСКОРЕНИЯ ЗАПРОСОВ
-- ============================================

CREATE INDEX ON public.services (master_id);
CREATE INDEX ON public.bookings (master_id);
CREATE INDEX ON public.bookings (service_id);
CREATE INDEX ON public.bookings (start_time);

-- ============================================
-- ФУНКЦИЯ ДЛЯ АВТО-ОБНОВЛЕНИЯ `updated_at`
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры, которые вызывают функцию при обновлении записи
CREATE TRIGGER on_masters_update BEFORE UPDATE ON public.masters FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_services_update BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_bookings_update BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ============================================
-- ДЕМО-ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ
-- ============================================

-- Создаем одного демо-мастера
INSERT INTO public.masters (id, full_name, description)
VALUES ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Анна Смирнова', 'Мастер маникюра с 5-летним опытом')
ON CONFLICT (id) DO NOTHING;

-- Добавляем услуги для этого мастера
INSERT INTO public.services (master_id, title, price, duration_minutes, is_popular)
VALUES
    ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Классический маникюр', 1500, 60, false),
    ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Гель-лак', 2200, 90, true),
    ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Дизайн + покрытие', 3500, 120, true),
    ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Педикюр', 2500, 90, false),
    ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Укрепление ногтей', 1800, 60, false)
ON CONFLICT DO NOTHING;

-- Сообщение об успешной инициализации
DO $$
BEGIN
  RAISE NOTICE 'База данных Окошко успешно инициализирована с исправленным скриптом!';
END
$$;