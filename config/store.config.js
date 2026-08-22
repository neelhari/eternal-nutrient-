/**
 * ETERNAL NUTRICARE — MASTER STORE CONFIGURATION
 * Official Business Details & Cloud Sync Keys
 */

window.STORE_CONFIG = {
  // 1. Brand & Business Identity
  brandName: 'Eternal Nutricare',
  businessName: 'Eternal Nutricare',
  tagline: 'Pure. Natural. Eternal.',
  description: 'Health conscious natural and organic food products directly sourced from nature.',
  website: 'www.eternalnutricare.com',

  // 2. Contact & Official Communication
  primaryPhone: '+91 6302017482',
  secondaryPhone: '+91 9392235693',
  whatsAppNumber: '916302017482', // Primary WhatsApp format for wa.me API
  secondaryWhatsApp: '919392235693',
  supportEmail: 'eternalncdm@gmail.com',
  
  // 3. Registered Business Address, Tax & Licensing
  registeredAddress: '3g Crimson Layout, Channasandra, opp Krishnakuteer Phase 2, Bangalore East, Bangalore Urban, Karnataka - 560067',
  udyamNumber: 'UDYAM-KR-03-0464297',
  fssaiNumber: '21226009001641',

  // 4. Currency & Shipping Rules
  currency: '₹',
  currencyCode: 'INR',
  minOrderValue: 999, // Minimum order value is ₹999
  freeShippingThreshold: 999, // Free shipping for orders >= ₹999
  standardShippingFee: 40,

  // 5. Cloud Database (Supabase)
  supabaseUrl: 'https://sfcxpvvqxldhdkvfyhgj.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNDcxNTUsImV4cCI6MjA1NTYyMzE1NX0.eR6k7vj8z6sX9e-0123456789abcdefghijklmnopqrstuv',

  // 6. Core Product Categories (Ordered: Millet Biscuits, Dates Laddu's, Honey, Moringa chikki, Millet Rava, Pickles)
  categories: [
    'Millet Biscuits',
    "Dates Laddu's",
    'Honey',
    'Moringa Chikki',
    'Millet Rava',
    'Pickles'
  ]
};
