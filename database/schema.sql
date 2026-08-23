-- ==============================================================================
-- ETERNAL NUTRICARE — MASTER PRODUCTION SUPABASE SQL SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- It creates all 7 core tables, foreign relations, and unlocks complete RLS permissions.
-- ==============================================================================

-- 1. CATEGORIES TABLE
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

-- 2. PRODUCTS CATALOG TABLE
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

-- 3. ORDERS TABLE
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

-- 4. CUSTOMERS TABLE (CRM)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT DEFAULT '',
    addresses JSONB DEFAULT '[]'::jsonb,
    total_orders INT DEFAULT 1,
    lifetime_spend NUMERIC DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COUPONS & PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
    value NUMERIC NOT NULL DEFAULT 10,
    min_order_value NUMERIC DEFAULT 999,
    max_discount NUMERIC DEFAULT 0,
    expiry_date DATE,
    usage_limit INT DEFAULT 500,
    total_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CMS CONTENT TABLE (Banners, Collections, Festive Specials, Marquee)
CREATE TABLE IF NOT EXISTS cms_content (
    id TEXT PRIMARY KEY,
    section_type TEXT NOT NULL, -- 'hero_banner', 'festive_special', 'featured_collection', 'marquee_announcement'
    content_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sort_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. STORE SETTINGS TABLE
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
    registered_address TEXT DEFAULT '3g Crimson Layout, Channasandra, opp Krishnakuteer Phase 2, Bangalore East, Bangalore Urban, Karnataka - 560067',
    gstin TEXT DEFAULT '29ABCDE1234F1Z5',
    udyam_number TEXT DEFAULT 'UDYAM-KR-03-0464297',
    fssai_number TEXT DEFAULT '21226009001641',
    is_store_live BOOLEAN DEFAULT true,
    pause_notice_message TEXT DEFAULT 'We are temporarily pausing new orders for inventory restocking.',
    min_order_value NUMERIC DEFAULT 999,
    free_shipping_threshold NUMERIC DEFAULT 999,
    standard_shipping_fee NUMERIC DEFAULT 40,
    serviceable_pincodes TEXT DEFAULT '560001, 560002, 560034, 560038, 560067, 560103',
    trust_stats JSONB DEFAULT '[
        {"id": "ts_1", "count": "10,000+", "label": "Happy Families"},
        {"id": "ts_2", "count": "100%", "label": "Certified Organic"},
        {"id": "ts_3", "count": "★ 4.9 / 5", "label": "Customer Rating"},
        {"id": "ts_4", "count": "Bangalore", "label": "Express Delivery"}
    ]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Admin All Categories" ON categories;
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Admin All Products" ON products;
DROP POLICY IF EXISTS "Public Read Orders" ON orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
DROP POLICY IF EXISTS "Admin All Orders" ON orders;
DROP POLICY IF EXISTS "Public Read Customers" ON customers;
DROP POLICY IF EXISTS "Public Insert Customers" ON customers;
DROP POLICY IF EXISTS "Admin All Customers" ON customers;
DROP POLICY IF EXISTS "Public Read Coupons" ON coupons;
DROP POLICY IF EXISTS "Admin All Coupons" ON coupons;
DROP POLICY IF EXISTS "Public Read CMS" ON cms_content;
DROP POLICY IF EXISTS "Admin All CMS" ON cms_content;
DROP POLICY IF EXISTS "Public Read Settings" ON store_settings;
DROP POLICY IF EXISTS "Admin All Settings" ON store_settings;

-- Public Read & Admin All Policies
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin All Categories" ON categories FOR ALL USING (true);

CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin All Products" ON products FOR ALL USING (true);

CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Orders" ON orders FOR ALL USING (true);

CREATE POLICY "Public Read Customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public Insert Customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All Customers" ON customers FOR ALL USING (true);

CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admin All Coupons" ON coupons FOR ALL USING (true);

CREATE POLICY "Public Read CMS" ON cms_content FOR SELECT USING (true);
CREATE POLICY "Admin All CMS" ON cms_content FOR ALL USING (true);

CREATE POLICY "Public Read Settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admin All Settings" ON store_settings FOR ALL USING (true);
