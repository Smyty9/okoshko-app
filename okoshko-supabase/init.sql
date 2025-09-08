-- Инициализация базы данных для проекта "Окошко"

-- Создание схем Supabase
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS _realtime;

-- Расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание ролей
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-super-secret-password';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'your-super-secret-password';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'your-super-secret-password';
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOINHERIT CREATEROLE LOGIN PASSWORD 'your-super-secret-password';
  END IF;
END
$$;

-- Предоставление прав
GRANT anon, authenticated, service_role TO authenticator;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Таблица auth.users (упрощенная версия)
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    raw_user_meta_data JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- ОСНОВНЫЕ ТАБЛИЦЫ ПРОЕКТА
-- ============================================

-- Таблица профилей пользователей
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    telegram_username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_master BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица мастеров
CREATE TABLE IF NOT EXISTS public.masters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица услуг
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    master_id UUID REFERENCES public.masters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other',
    price INTEGER NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    icon TEXT DEFAULT 'fa-hand-sparkles',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица записей
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    master_id UUID REFERENCES public.masters(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'pending',
    price INTEGER NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    master_id UUID REFERENCES public.masters(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ИНДЕКСЫ
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_services_master_id ON public.services(master_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_master_id ON public.bookings(master_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Политики для public доступа (для локальной разработки)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Masters are viewable by everyone" ON public.masters
    FOR SELECT USING (true);

CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON public.bookings
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masters_updated_at BEFORE UPDATE ON public.masters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ДЕМО ДАННЫЕ
-- ============================================

-- Создаем демо пользователя
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES 
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'anna@demo.ru', '{"first_name": "Анна", "last_name": "Смирнова"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Создаем профиль
INSERT INTO public.profiles (id, first_name, last_name, is_master) VALUES 
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Анна', 'Смирнова', true)
ON CONFLICT (id) DO NOTHING;

-- Создаем мастера
INSERT INTO public.masters (user_id, name, description, rating) VALUES 
  ('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'Анна Смирнова', 'Мастер маникюра с 5-летним опытом', 5.0)
ON CONFLICT (user_id) DO NOTHING;

-- Добавляем демо услуги
INSERT INTO public.services (master_id, name, description, category, price, duration, is_popular) 
SELECT 
  id as master_id,
  unnest(ARRAY[
    'Классический маникюр',
    'Гель-лак',
    'Дизайн + покрытие',
    'Педикюр',
    'Укрепление ногтей'
  ]) as name,
  unnest(ARRAY[
    'Базовый уход за ногтями',
    'Долговременное покрытие',
    'Художественный дизайн',
    'Комплексный уход за ногами',
    'Укрепление биогелем'
  ]) as description,
  unnest(ARRAY[
    'manicure',
    'manicure',
    'design',
    'pedicure',
    'care'
  ]) as category,
  unnest(ARRAY[1500, 2200, 3500, 2500, 1800]) as price,
  unnest(ARRAY[60, 90, 120, 90, 60]) as duration,
  unnest(ARRAY[false, true, true, false, false]) as is_popular
FROM public.masters 
WHERE user_id = 'd0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0'
ON CONFLICT DO NOTHING;

-- Сообщение об успешной инициализации
DO $$
BEGIN
  RAISE NOTICE 'База данных Окошко успешно инициализирована!';
END
$$;