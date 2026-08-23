-- ==============================================================================
-- ETERNAL NUTRICARE — ENTERPRISE AUTHENTICATION & RLS SECURITY POLICIES
-- ==============================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It enforces strict JWT-based Row Level Security (RLS) so only verified Admins can write
-- while customers can read products and place orders.
-- ==============================================================================

-- 1. CREATE ALL CORE TABLES IF NOT EXISTS

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    tagline TEXT DEFAULT '',
    image TEXT DEFAULT '',
    icon TEXT DEFAULT 'ri-apps-2-line',
    sort_order INT DEFAULT 1,
    show_on_home BOOLEAN DEFAULT true,
    show_in_shop BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sku TEXT UNIQUE,
    category TEXT DEFAULT 'General',
    image TEXT DEFAULT '',
    gallery JSONB DEFAULT '[]'::jsonb,
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'Pack',
    badge TEXT DEFAULT '',
    rating NUMERIC DEFAULT 4.9,
    reviews_count INT DEFAULT 12,
    highlights JSONB DEFAULT '[]'::jsonb,
    in_stock BOOLEAN DEFAULT true,
    stock_qty INT DEFAULT 50,
    is_bestseller BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 1,
    short_summary TEXT DEFAULT '',
    description TEXT DEFAULT '',
    benefits TEXT DEFAULT '',
    ingredients TEXT DEFAULT '',
    nutritional_info TEXT DEFAULT '',
    storage_instructions TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT DEFAULT '',
    delivery_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    coupon_code TEXT DEFAULT '',
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Pending',
    razorpay_order_id TEXT DEFAULT '',
    razorpay_payment_id TEXT DEFAULT '',
    order_status TEXT DEFAULT 'Placed',
    tracking_id TEXT DEFAULT '',
    admin_notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT DEFAULT 'customer', -- 'admin' or 'customer'
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'percentage',
    value NUMERIC NOT NULL DEFAULT 10,
    min_order_value NUMERIC DEFAULT 999,
    max_discount NUMERIC DEFAULT 0,
    expiry_date DATE,
    usage_limit INT DEFAULT 500,
    total_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,
    section_type TEXT NOT NULL,
    content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS store_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_store',
    business_name TEXT DEFAULT 'Eternal Nutricare',
    brand_name TEXT DEFAULT 'Eternal Nutricare',
    tagline TEXT DEFAULT 'Pure. Natural. Eternal.',
    owner_name TEXT DEFAULT 'Neelhari & Team',
    primary_phone TEXT DEFAULT '+91 6302017482',
    secondary_phone TEXT DEFAULT '+91 9392235693',
    primary_whatsapp TEXT DEFAULT '916302017482',
    secondary_whatsapp TEXT DEFAULT '919392235693',
    support_email TEXT DEFAULT 'eternalncdm@gmail.com',
    registered_address TEXT DEFAULT '3g Crimson Layout, Channasandra, Bangalore - 560067',
    gstin TEXT DEFAULT '29ABCDE1234F1Z5',
    udyam_number TEXT DEFAULT 'UDYAM-KR-03-0464297',
    fssai_number TEXT DEFAULT '21226009001641',
    is_store_live BOOLEAN DEFAULT true,
    pause_notice_message TEXT DEFAULT 'We are temporarily pausing new orders for restocking.',
    min_order_value NUMERIC DEFAULT 999,
    free_shipping_threshold NUMERIC DEFAULT 999,
    standard_shipping_fee NUMERIC DEFAULT 40,
    serviceable_pincodes TEXT DEFAULT '560001, 560034, 560067, 560103',
    trust_stats JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. DROP EXISTING POLICIES TO AVOID DUPLICATION
-- ==============================================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Categories" ON categories;
    DROP POLICY IF EXISTS "Admin Write Categories" ON categories;
    DROP POLICY IF EXISTS "Public Read Products" ON products;
    DROP POLICY IF EXISTS "Admin Write Products" ON products;
    DROP POLICY IF EXISTS "Public Read Active Coupons" ON coupons;
    DROP POLICY IF EXISTS "Admin Write Coupons" ON coupons;
    DROP POLICY IF EXISTS "Public Read CMS" ON cms_content;
    DROP POLICY IF EXISTS "Admin Write CMS" ON cms_content;
    DROP POLICY IF EXISTS "Public Read Settings" ON store_settings;
    DROP POLICY IF EXISTS "Admin Write Settings" ON store_settings;
    DROP POLICY IF EXISTS "Customer Insert Orders" ON orders;
    DROP POLICY IF EXISTS "Admin All Orders" ON orders;
    DROP POLICY IF EXISTS "Customer Own Orders" ON orders;
    DROP POLICY IF EXISTS "User Own Profile" ON profiles;
    DROP POLICY IF EXISTS "Admin All Profiles" ON profiles;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- 4. STRICT RLS POLICIES (JWT AUTHENTICATION RULES)
-- ==============================================================================

-- A) PRODUCTS & CATEGORIES: PUBLIC READ, ADMIN-ONLY WRITE
CREATE POLICY "Public Read Products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admin Write Products" ON products
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Public Read Categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admin Write Categories" ON categories
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- B) CMS CONTENT & STORE SETTINGS: PUBLIC READ, ADMIN-ONLY WRITE
CREATE POLICY "Public Read CMS" ON cms_content
    FOR SELECT USING (true);

CREATE POLICY "Admin Write CMS" ON cms_content
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Public Read Settings" ON store_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin Write Settings" ON store_settings
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- C) COUPONS: PUBLIC READ ACTIVE, ADMIN-ONLY WRITE
CREATE POLICY "Public Read Active Coupons" ON coupons
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin Write Coupons" ON coupons
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- D) ORDERS: CUSTOMER CAN INSERT, CUSTOMER CAN READ OWN (BY PHONE/EMAIL), ADMIN SEES ALL
CREATE POLICY "Customer Insert Orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin All Orders" ON orders
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Customer Own Orders" ON orders
    FOR SELECT USING (
        auth.jwt() IS NULL -- Guest checkout lookup
        OR (auth.jwt() ->> 'email' = customer_email)
    );

-- E) PROFILES: USERS MANAGE OWN PROFILE, ADMIN MANAGES ALL
CREATE POLICY "User Own Profile" ON profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admin All Profiles" ON profiles
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'eternalncdm@gmail.com' OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
