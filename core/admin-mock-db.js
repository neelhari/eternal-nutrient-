/**
 * ETERNAL NUTRICARE — MASTER IN-MEMORY MOCK DATASET
 * Production-Grade Architecture for Phase 1 Admin UI Visual Demonstration
 * (Strictly In-Memory JavaScript Arrays — Zero localStorage / sessionStorage / External APIs)
 */

window.ADMIN_MOCK_DB = (function() {

  // 1. Core Categories
  const categories = [
    {
      id: 'cat_biscuits',
      name: 'Millet Biscuits',
      tagline: 'Zero Maida • Organic Jaggery Baked Cookies',
      image: 'assets/prod_cookie_studio.jpg',
      icon: 'ri-cake-3-line',
      sortOrder: 1,
      showOnHome: true,
      showInShop: true,
      productsCount: 4
    },
    {
      id: 'cat_laddus',
      name: "Dates Laddu's",
      tagline: '100% Pure Medjoul Dates & Premium Nuts',
      image: 'assets/prod_laddu_studio.jpg',
      icon: 'ri-circle-fill',
      sortOrder: 2,
      showOnHome: true,
      showInShop: true,
      productsCount: 3
    },
    {
      id: 'cat_honey',
      name: 'Honey',
      tagline: '100% Pure Raw Unprocessed Forest Honey',
      image: 'assets/prod_honey_studio.jpg',
      icon: 'ri-drop-fill',
      sortOrder: 3,
      showOnHome: true,
      showInShop: true,
      productsCount: 3
    },
    {
      id: 'cat_chikki',
      name: 'Moringa Chikki',
      tagline: 'Superfood Jaggery & Moringa Nutrient Bites',
      image: 'assets/prod_chikki_studio.jpg',
      icon: 'ri-leaf-fill',
      sortOrder: 4,
      showOnHome: true,
      showInShop: true,
      productsCount: 2
    },
    {
      id: 'cat_rava',
      name: 'Millet Rava',
      tagline: 'Nutritious Multi-Millet Idli & Upma Rava',
      image: 'assets/prod_rava_studio.jpg',
      icon: 'ri-plant-fill',
      sortOrder: 5,
      showOnHome: true,
      showInShop: true,
      productsCount: 2
    },
    {
      id: 'cat_pickles',
      name: 'Pickles',
      tagline: 'Cold-Pressed Sesame Oil Traditional Pickles',
      image: 'assets/prod_pickle_studio.jpg',
      icon: 'ri-goblet-fill',
      sortOrder: 6,
      showOnHome: true,
      showInShop: true,
      productsCount: 4
    }
  ];

  // 2. Comprehensive Products Catalog
  const products = [
    {
      id: 'prod_1',
      title: 'Raw Organic Forest Honey',
      sku: 'EN-HON-500',
      category: 'Honey',
      image: 'assets/prod_honey_studio.jpg',
      gallery: ['assets/prod_honey_studio.jpg', 'assets/header_honey_float.jpg'],
      price: 349,
      originalPrice: 420,
      discount: 17,
      unit: '500g Glass Jar',
      badge: '100% Pure Raw',
      rating: 4.9,
      reviewsCount: 142,
      highlights: ['Zero Added Sugar', 'Wild Flora Sourced', 'NMR Tested Pure'],
      inStock: true,
      stockQty: 48,
      isBestseller: true,
      isFeatured: true,
      isNewArrival: false,
      sortOrder: 1,
      shortSummary: 'Pure, unprocessed nectar gathered from wild forest bees in Western Ghats.',
      description: 'Raw, unprocessed honey harvested from wild forest blooms. Retains all natural pollen, enzymes, and medicinal antioxidants with zero added sugar or heat processing.',
      benefits: 'Rich in antioxidants, aids digestion, boosts immunity, natural soothing remedy.',
      ingredients: '100% Raw Wild Forest Honey.',
      nutritionalInfo: 'Energy: 304 kcal, Carbs: 82.4g, Natural Sugars: 80g, Protein: 0.3g per 100g.',
      storageInstructions: 'Store at room temperature in a dry place. Do not refrigerate.'
    },
    {
      id: 'prod_2',
      title: "Handcrafted Dates Laddu's",
      sku: 'EN-LAD-400',
      category: "Dates Laddu's",
      image: 'assets/prod_laddu_studio.jpg',
      gallery: ['assets/prod_laddu_studio.jpg', 'assets/dates_laddu.jpg'],
      price: 299,
      originalPrice: 360,
      discount: 17,
      unit: '400g Artisanal Box',
      badge: 'Zero Added Sugar',
      rating: 4.9,
      reviewsCount: 98,
      highlights: ['Premium Medjoul Dates', 'Rich Dry Fruits & Ghee', 'No Artificial Flavors'],
      inStock: true,
      stockQty: 32,
      isBestseller: true,
      isFeatured: true,
      isNewArrival: false,
      sortOrder: 2,
      shortSummary: 'Nutrient-rich power energy bites packed with Medjoul dates, almonds, and pistachios.',
      description: 'Traditional handcrafted laddus made from premium Saudi dates, roasted cashews, California almonds, and pure A2 cow ghee. A wholesome guilt-free dessert.',
      benefits: 'High dietary fiber, sustained natural energy, rich in iron and magnesium.',
      ingredients: 'Medjoul Dates (65%), Roasted Almonds (15%), Cashews (10%), Pure Cow Ghee, Cardamom.',
      nutritionalInfo: 'Energy: 380 kcal, Protein: 7.2g, Fiber: 6.8g, Natural Sugars: 52g per 100g.',
      storageInstructions: 'Keep in an airtight container in a cool, shaded environment.'
    },
    {
      id: 'prod_3',
      title: 'Moringa Immunity Chikki',
      sku: 'EN-CHK-250',
      category: 'Moringa Chikki',
      image: 'assets/prod_chikki_studio.jpg',
      gallery: ['assets/prod_chikki_studio.jpg'],
      price: 189,
      originalPrice: 230,
      discount: 18,
      unit: '250g Crunchy Pack',
      badge: 'Superfood Power',
      rating: 4.8,
      reviewsCount: 76,
      highlights: ['Organic Moringa Leaf', 'Pure Palm Jaggery', 'Rich in Iron & Calcium'],
      inStock: true,
      stockQty: 55,
      isBestseller: true,
      isFeatured: false,
      isNewArrival: false,
      sortOrder: 3,
      shortSummary: 'Crunchy peanut and organic moringa leaf brittle sweetened with organic jaggery.',
      description: 'A revolutionary healthy snack combining nutrient-dense drumstick leaves (moringa), farm-fresh peanuts, and dark country jaggery. Delivers a power-packed crunch.',
      benefits: 'Fortified with Vitamin A & C, promotes bone strength and hemoglobin synthesis.',
      ingredients: 'Roasted Peanuts, Organic Jaggery, Fresh Moringa Leaf Extract, Cardamom.',
      nutritionalInfo: 'Energy: 440 kcal, Protein: 14g, Iron: 4.5mg, Calcium: 120mg per 100g.',
      storageInstructions: 'Store in airtight container away from moisture.'
    },
    {
      id: 'prod_4',
      title: 'Millet Biscuits (Multi-Millet)',
      sku: 'EN-BIS-200',
      category: 'Millet Biscuits',
      image: 'assets/prod_cookie_studio.jpg',
      gallery: ['assets/prod_cookie_studio.jpg', 'assets/cat_biscuits.jpg'],
      price: 149,
      originalPrice: 180,
      discount: 17,
      unit: '200g Fresh Pack',
      badge: 'No Maida • No Palm Oil',
      rating: 4.9,
      reviewsCount: 65,
      highlights: ['Foxtail & Ragi Flours', 'Zero Refined Flour', 'Crispy Golden Bake'],
      inStock: true,
      stockQty: 42,
      isBestseller: true,
      isFeatured: true,
      isNewArrival: false,
      sortOrder: 4,
      shortSummary: 'Wholesome crunchy cookies baked with ancient millets and raw cane sugar.',
      description: 'Crunchy artisan biscuits formulated from a blend of Finger Millet (Ragi), Foxtail Millet, and Pearl Millet, baked with butter and jaggery. Completely maida-free.',
      benefits: 'Low glycemic index, promotes gut health, safe for health-conscious snacking.',
      ingredients: 'Multi-Millet Flour Blend (60%), Whole Wheat, Organic Jaggery, Butter, Milk solids.',
      nutritionalInfo: 'Energy: 410 kcal, Dietary Fiber: 8.5g, Protein: 8g per 100g.',
      storageInstructions: 'Reseal zipper pouch after opening.'
    },
    {
      id: 'prod_5',
      title: 'Multi-Millet Upma Rava',
      sku: 'EN-RAV-500',
      category: 'Millet Rava',
      image: 'assets/prod_rava_studio.jpg',
      gallery: ['assets/prod_rava_studio.jpg', 'assets/cat_millets.jpg'],
      price: 129,
      originalPrice: 160,
      discount: 19,
      unit: '500g Grain Pouch',
      badge: 'Gluten-Friendly',
      rating: 4.8,
      reviewsCount: 54,
      highlights: ['Stone Ground Coarse', 'High Dietary Fiber', 'Quick Cook 10 Mins'],
      inStock: true,
      stockQty: 38,
      isBestseller: true,
      isFeatured: false,
      isNewArrival: false,
      sortOrder: 5,
      shortSummary: 'Stone-ground multi-millet semolina for fluffy wholesome breakfast upma and khichdi.',
      description: 'Stone-cracked coarse rava made from Barnyard and Little Millets. High in fiber and minerals, perfect for preparing diabetic-friendly upma, idlis, and puddings.',
      benefits: 'Controls blood sugar spikes, easy digestion, sustains satiety.',
      ingredients: '100% Unpolished Barnyard & Little Millet Grains.',
      nutritionalInfo: 'Energy: 340 kcal, Protein: 11g, Fiber: 10g per 100g.',
      storageInstructions: 'Store in a cool, dry place. Keep container tightly sealed.'
    },
    {
      id: 'prod_6',
      title: 'Traditional Mango Pickle',
      sku: 'EN-PCK-350',
      category: 'Pickles',
      image: 'assets/prod_pickle_studio.jpg',
      gallery: ['assets/prod_pickle_studio.jpg', 'assets/cat_pickles.jpg'],
      price: 199,
      originalPrice: 240,
      discount: 17,
      unit: '350g Ceramic Jar',
      badge: 'Cold-Pressed Gingelly Oil',
      rating: 4.9,
      reviewsCount: 88,
      highlights: ['Sun-Matured Raw Mango', 'Wood-Pressed Sesame Oil', 'Grandma Recipe'],
      inStock: true,
      stockQty: 29,
      isBestseller: true,
      isFeatured: true,
      isNewArrival: false,
      sortOrder: 6,
      shortSummary: 'Authentic sun-cured raw mango pickle infused with aromatic spices and cold-pressed oil.',
      description: 'Sun-matured raw country mangoes pickled in cold-pressed sesame oil, stone-ground mustard, fenugreek, and Guntur red chilies. Zero artificial preservatives or vinegar.',
      benefits: 'Stimulates digestive enzymes, authentic probiotic fermentation.',
      ingredients: 'Raw Cut Mangoes, Cold-Pressed Sesame Oil, Mustard Powder, Salt, Turmeric, Chili.',
      nutritionalInfo: 'Energy: 180 kcal, Sodium: 1800mg per 100g.',
      storageInstructions: 'Always use a dry spoon. Keep oil layer on top.'
    },
    {
      id: 'na_1',
      title: 'Ragi Crunch Cookies',
      sku: 'EN-RAG-200',
      category: 'Millet Biscuits',
      image: 'assets/prod_cookie_studio.jpg',
      gallery: ['assets/prod_cookie_studio.jpg'],
      price: 159,
      originalPrice: 190,
      discount: 16,
      unit: '200g Fresh Pack',
      badge: 'Finger Millet • 200g',
      rating: 4.9,
      reviewsCount: 39,
      highlights: ['100% Sprouted Ragi', 'Calcium Fortified', 'Baby-Friendly'],
      inStock: true,
      stockQty: 35,
      isBestseller: false,
      isFeatured: false,
      isNewArrival: true,
      sortOrder: 7,
      shortSummary: 'Crispy wholesome cookies crafted from sprouted finger millet and jaggery.',
      description: 'Sprouted ragi biscuits with a rich, nutty flavor. Sprouting enhances bio-available calcium and makes these cookies exceptionally easy on digestion.',
      benefits: 'Exceptional bone health booster, high mineral bioavailability.',
      ingredients: 'Sprouted Finger Millet Flour, Unrefined Sugar, Butter, Cardamom.',
      nutritionalInfo: 'Energy: 395 kcal, Calcium: 340mg per 100g.',
      storageInstructions: 'Store in airtight box.'
    },
    {
      id: 'na_2',
      title: 'Dry Fruit Energy Bites',
      sku: 'EN-EBT-350',
      category: "Dates Laddu's",
      image: 'assets/prod_laddu_studio.jpg',
      gallery: ['assets/prod_laddu_studio.jpg'],
      price: 329,
      originalPrice: 380,
      discount: 13,
      unit: '350g Premium Box',
      badge: 'Nut & Seed Loaded',
      rating: 4.9,
      reviewsCount: 44,
      highlights: ['Pumpkin & Chia Seeds', 'Pistachios & Walnuts', 'No Cane Sugar'],
      inStock: true,
      stockQty: 22,
      isBestseller: false,
      isFeatured: false,
      isNewArrival: true,
      sortOrder: 8,
      shortSummary: 'Crunchy nut and seed energy balls bonded naturally with Arabian black dates.',
      description: 'Power snack packed with 6 varieties of nuts and seeds including walnuts, pistachios, sunflower seeds, and chia, rolled in rich date paste.',
      benefits: 'Rich in Omega-3 fatty acids, supports brain function and stamina.',
      ingredients: 'Dates, Walnuts, Almonds, Pumpkin Seeds, Chia Seeds, Ghee.',
      nutritionalInfo: 'Energy: 460 kcal, Protein: 12g per 100g.',
      storageInstructions: 'Keep in refrigerator for extended crunch.'
    },
    {
      id: 'na_3',
      title: 'Wild Berry Forest Honey',
      sku: 'EN-WBH-500',
      category: 'Honey',
      image: 'assets/prod_honey_studio.jpg',
      gallery: ['assets/prod_honey_studio.jpg'],
      price: 379,
      originalPrice: 450,
      discount: 16,
      unit: '500g Jar',
      badge: 'Limited Harvest',
      rating: 5.0,
      reviewsCount: 28,
      highlights: ['Single Origin Flora', 'Rich Dark Amber', 'Raw & Unheated'],
      inStock: true,
      stockQty: 18,
      isBestseller: false,
      isFeatured: false,
      isNewArrival: true,
      sortOrder: 9,
      shortSummary: 'Rare seasonal dark amber honey with natural floral berry undertones.',
      description: 'Exclusive seasonal harvest collected from wild blackberry and mahua blossoms. Has an exquisite rich dark amber tone and intense floral bouquet.',
      benefits: 'Very high polyphenol content, powerful natural antioxidant.',
      ingredients: '100% Raw Wild Berry Forest Honey.',
      nutritionalInfo: 'Energy: 310 kcal, Carbohydrates: 80g per 100g.',
      storageInstructions: 'Store at room temperature.'
    },
    {
      id: 'na_4',
      title: 'Spiced Lemon Pickle',
      sku: 'EN-LMN-350',
      category: 'Pickles',
      image: 'assets/prod_pickle_studio.jpg',
      gallery: ['assets/prod_pickle_studio.jpg'],
      price: 189,
      originalPrice: 220,
      discount: 14,
      unit: '350g Jar',
      badge: 'Zero Oil Recipe',
      rating: 4.8,
      reviewsCount: 31,
      highlights: ['Naturally Aged 60 Days', 'Digestive Ajwain & Hing', 'Oil-Free'],
      inStock: true,
      stockQty: 8, // Low Stock Example
      isBestseller: false,
      isFeatured: false,
      isNewArrival: true,
      sortOrder: 10,
      shortSummary: 'Tangy digestive country lemon pickle cured naturally in sunlight with rock salt.',
      description: 'Traditional oil-free sun-cured lemons with roasted carom seeds (ajwain), asafetida, and Himalayan pink rock salt. Exceptional digestive condiment.',
      benefits: 'Aids gastric comfort, natural appetite stimulant.',
      ingredients: 'Juicy Yellow Lemons, Pink Salt, Ajwain, Roasted Cumin, Red Chili.',
      nutritionalInfo: 'Energy: 65 kcal, Fat: 0.2g per 100g.',
      storageInstructions: 'Store in cool dry cupboard.'
    }
  ];

  // 3. Realistic In-Memory Orders
  const orders = [
    {
      id: 'ord_101',
      orderNumber: '#EN-84291',
      date: '2026-08-23T19:42:00Z',
      customerName: 'AS Anita',
      customerPhone: '+91 98450 12345',
      customerEmail: 'anita.sharma@gmail.com',
      deliveryAddress: {
        flat: 'Villa 42, Green Glen Layout',
        street: 'Bellandur Outer Ring Road',
        area: 'Bellandur',
        landmark: 'Opposite Central Mall',
        city: 'Bangalore',
        pincode: '560103'
      },
      items: [
        { productId: 'prod_1', title: 'Raw Organic Forest Honey', unit: '500g Glass Jar', qty: 2, price: 349, total: 698 },
        { productId: 'prod_2', title: "Handcrafted Dates Laddu's", unit: '400g Artisanal Box', qty: 1, price: 299, total: 299 }
      ],
      subtotal: 997,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount: 997,
      paymentMethod: 'UPI (PhonePe / GPay)',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      trackingId: 'EXP-BLR-84291',
      adminNotes: 'Customer requested evening delivery after 6 PM.',
      deliveryInstructions: 'Leave with security if not home.'
    },
    {
      id: 'ord_102',
      orderNumber: '#EN-84290',
      date: '2026-08-23T18:15:00Z',
      customerName: 'Ramesh Sundaram',
      customerPhone: '+91 97401 56789',
      customerEmail: 'ramesh.s@techcorp.in',
      deliveryAddress: {
        flat: 'Flat 502, Prestige Lakeside Habitat',
        street: 'SH 35, Varthur',
        area: 'Whitefield',
        landmark: 'Near Varthur Lake',
        city: 'Bangalore',
        pincode: '560087'
      },
      items: [
        { productId: 'prod_4', title: 'Millet Biscuits (Multi-Millet)', unit: '200g Fresh Pack', qty: 3, price: 149, total: 447 },
        { productId: 'prod_3', title: 'Moringa Immunity Chikki', unit: '250g Crunchy Pack', qty: 2, price: 189, total: 378 },
        { productId: 'prod_6', title: 'Traditional Mango Pickle', unit: '350g Ceramic Jar', qty: 1, price: 199, total: 199 }
      ],
      subtotal: 1024,
      deliveryFee: 0,
      discountAmount: 100, // Coupon ETERNAL10 applied
      totalAmount: 924,
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      trackingId: '',
      adminNotes: 'Call customer before dispatch.',
      deliveryInstructions: 'Ring doorbell twice.'
    },
    {
      id: 'ord_103',
      orderNumber: '#EN-84289',
      date: '2026-08-23T14:30:00Z',
      customerName: 'Dr. Priya Nambiar',
      customerPhone: '+91 94480 87654',
      customerEmail: 'priya.nambiar@manipal.edu',
      deliveryAddress: {
        flat: 'Apartment 3B, Salarpuria Sattva',
        street: '100ft Road, Indiranagar',
        area: 'Indiranagar 2nd Stage',
        landmark: 'Behind Toit Pub',
        city: 'Bangalore',
        pincode: '560038'
      },
      items: [
        { productId: 'prod_1', title: 'Raw Organic Forest Honey', unit: '500g Glass Jar', qty: 3, price: 349, total: 1047 },
        { productId: 'prod_5', title: 'Multi-Millet Upma Rava', unit: '500g Grain Pouch', qty: 2, price: 129, total: 258 }
      ],
      subtotal: 1305,
      deliveryFee: 0,
      discountAmount: 130,
      totalAmount: 1175,
      paymentMethod: 'UPI Instant',
      paymentStatus: 'Paid',
      orderStatus: 'Packed',
      trackingId: 'EXP-BLR-84289',
      adminNotes: 'Packed in eco-friendly bubble pouch.',
      deliveryInstructions: 'Deliver to reception desk.'
    },
    {
      id: 'ord_104',
      orderNumber: '#EN-84288',
      date: '2026-08-22T16:20:00Z',
      customerName: 'Vikramaditya Roy',
      customerPhone: '+91 98800 23456',
      customerEmail: 'v.roy@consultancy.org',
      deliveryAddress: {
        flat: 'Plot 18, 4th Cross',
        street: 'Koramangala 4th Block',
        area: 'Koramangala',
        landmark: 'Near Bethany High School',
        city: 'Bangalore',
        pincode: '560034'
      },
      items: [
        { productId: 'prod_2', title: "Handcrafted Dates Laddu's", unit: '400g Artisanal Box', qty: 4, price: 299, total: 1196 }
      ],
      subtotal: 1196,
      deliveryFee: 0,
      discountAmount: 0,
      totalAmount: 1196,
      paymentMethod: 'Net Banking',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      trackingId: 'DELIV-BLR-9042',
      adminNotes: 'Delivery partner: ExpressDunzo Rider Shiva',
      deliveryInstructions: 'Call on arrival.'
    },
    {
      id: 'ord_105',
      orderNumber: '#EN-84287',
      date: '2026-08-22T10:05:00Z',
      customerName: 'Kavitha Murthy',
      customerPhone: '+91 96111 45678',
      customerEmail: 'kavitha.m@gmail.com',
      deliveryAddress: {
        flat: 'No 12, 14th Main',
        street: 'Jayanagar 4th T Block',
        area: 'Jayanagar',
        landmark: 'Opposite NMKRV College',
        city: 'Bangalore',
        pincode: '560041'
      },
      items: [
        { productId: 'prod_6', title: 'Traditional Mango Pickle', unit: '350g Ceramic Jar', qty: 2, price: 199, total: 398 },
        { productId: 'prod_4', title: 'Millet Biscuits (Multi-Millet)', unit: '200g Fresh Pack', qty: 4, price: 149, total: 596 },
        { productId: 'prod_5', title: 'Multi-Millet Upma Rava', unit: '500g Grain Pouch', qty: 1, price: 129, total: 129 }
      ],
      subtotal: 1123,
      deliveryFee: 0,
      discountAmount: 112,
      totalAmount: 1011,
      paymentMethod: 'UPI (GPay)',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      trackingId: 'EXP-BLR-84287',
      adminNotes: 'Delivered successfully at 3:15 PM.',
      deliveryInstructions: 'Left with resident.'
    }
  ];

  // 4. Customer Directory (CRM)
  const customers = [
    {
      id: 'cust_1',
      name: 'AS Anita',
      phone: '+91 98450 12345',
      email: 'anita.sharma@gmail.com',
      status: 'Active',
      totalOrders: 6,
      lifetimeSpend: 5980,
      lastOrderDate: '2026-08-23',
      addresses: [
        'Villa 42, Green Glen Layout, Bellandur, Bangalore - 560103',
        'Office: RMZ Ecospace, Outer Ring Road, Bangalore - 560103'
      ]
    },
    {
      id: 'cust_2',
      name: 'Ramesh Sundaram',
      phone: '+91 97401 56789',
      email: 'ramesh.s@techcorp.in',
      status: 'Active',
      totalOrders: 3,
      lifetimeSpend: 2840,
      lastOrderDate: '2026-08-23',
      addresses: [
        'Flat 502, Prestige Lakeside Habitat, Varthur, Bangalore - 560087'
      ]
    },
    {
      id: 'cust_3',
      name: 'Dr. Priya Nambiar',
      phone: '+91 94480 87654',
      email: 'priya.nambiar@manipal.edu',
      status: 'Active',
      totalOrders: 9,
      lifetimeSpend: 9450,
      lastOrderDate: '2026-08-23',
      addresses: [
        'Apartment 3B, Salarpuria Sattva, 100ft Road, Indiranagar, Bangalore - 560038'
      ]
    },
    {
      id: 'cust_4',
      name: 'Vikramaditya Roy',
      phone: '+91 98800 23456',
      email: 'v.roy@consultancy.org',
      status: 'Active',
      totalOrders: 4,
      lifetimeSpend: 4780,
      lastOrderDate: '2026-08-22',
      addresses: [
        'Plot 18, 4th Cross, Koramangala 4th Block, Bangalore - 560034'
      ]
    },
    {
      id: 'cust_5',
      name: 'Kavitha Murthy',
      phone: '+91 96111 45678',
      email: 'kavitha.m@gmail.com',
      status: 'Active',
      totalOrders: 12,
      lifetimeSpend: 14200,
      lastOrderDate: '2026-08-22',
      addresses: [
        'No 12, 14th Main, Jayanagar 4th T Block, Bangalore - 560041'
      ]
    }
  ];

  // 5. Hero Carousel Banners (CMS)
  const heroBanners = [
    {
      id: 'ban_1',
      desktopImage: 'assets/hero_banner.jpg',
      mobileImage: 'assets/hero_banner.jpg',
      eyebrow: 'Pure. Natural. Eternal.',
      headline: 'Goodness from Nature for a healthier you.',
      tagline: '100% Certified Chemical-Free & Preservative-Free Organic Essentials.',
      btnText: 'Shop Now',
      targetLink: 'categories.html',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'ban_2',
      desktopImage: 'assets/header_honey_float.jpg',
      mobileImage: 'assets/header_honey_float.jpg',
      eyebrow: 'Wild Harvest Season',
      headline: 'Pure Raw Forest Honey Straight from Western Ghats.',
      tagline: 'Unpasteurized, unfiltered honey packed with live enzymes and natural pollen.',
      btnText: 'Explore Honey',
      targetLink: 'categories.html?cat=Honey',
      isActive: true,
      displayOrder: 2
    }
  ];

  // 6. Featured Collections
  const featuredCollections = [
    {
      id: 'col_1',
      title: 'Best Sellers Shelf',
      tagline: 'Loved by 10,000+ Happy Families in Bangalore',
      image: 'assets/prod_honey_studio.jpg',
      targetCategory: 'All',
      isActive: true,
      displayOrder: 1
    },
    {
      id: 'col_2',
      title: 'Fresh Harvest New Arrivals',
      tagline: 'Seasonal Sprouted Millets & Raw Harvest Honey',
      image: 'assets/prod_laddu_studio.jpg',
      targetCategory: 'Honey',
      isActive: true,
      displayOrder: 2
    }
  ];

  // 7. Festive Specials Spotlight (Categories Page)
  const festiveSpecials = {
    bannerImage: 'assets/auth_pot_artwork.jpg',
    eyebrow: '✨ Pure Organic Celebrations',
    headline: 'Rakhi & Festive Specials',
    cards: [
      {
        id: 'fc_1',
        title: 'Rakhi Specials',
        subLabel: "Dates Laddu's",
        image: 'assets/prod_laddu_studio.jpg',
        targetCategory: "Dates Laddu's"
      },
      {
        id: 'fc_2',
        title: 'Forest Pure',
        subLabel: 'Raw Honey',
        image: 'assets/prod_honey_studio.jpg',
        targetCategory: 'Honey'
      },
      {
        id: 'fc_3',
        title: 'Immunity Bites',
        subLabel: 'Millet Cookies',
        image: 'assets/prod_cookie_studio.jpg',
        targetCategory: 'Millet Biscuits'
      }
    ]
  };

  // 8. Continuous Marquee Ribbon Announcements
  const announcementItems = [
    { id: 'ann_1', text: 'Minimum Order Value: ₹999', icon: 'ri-shopping-basket-fill', isActive: true, sortOrder: 1 },
    { id: 'ann_2', text: 'Free Express Delivery on All Orders Above ₹999', icon: 'ri-truck-fill', isActive: true, sortOrder: 2 },
    { id: 'ann_3', text: '100% Certified Organic & Lab Tested', icon: 'ri-leaf-fill', isActive: true, sortOrder: 3 },
    { id: 'ann_4', text: 'Pure Raw Forest Honey (Unpasteurized)', icon: 'ri-drop-fill', isActive: true, sortOrder: 4 },
    { id: 'ann_5', text: '100% Safe UPI, Cards & Cash on Delivery', icon: 'ri-shield-check-fill', isActive: true, sortOrder: 5 },
    { id: 'ann_6', text: 'Zero Preservatives • Zero Maida • Zero Palm Oil', icon: 'ri-heart-3-fill', isActive: true, sortOrder: 6 }
  ];

  // 9. Coupons & Discounts
  const coupons = [
    {
      id: 'cp_1',
      code: 'ETERNAL10',
      type: 'percentage', // 'percentage' | 'flat'
      value: 10,
      minOrderValue: 999,
      maxDiscount: 250,
      expiryDate: '2026-12-31',
      isActive: true,
      usageLimit: 500,
      totalUsed: 142
    },
    {
      id: 'cp_2',
      code: 'FREESHIP',
      type: 'flat',
      value: 40,
      minOrderValue: 999,
      maxDiscount: 40,
      expiryDate: '2026-10-31',
      isActive: true,
      usageLimit: 1000,
      totalUsed: 318
    },
    {
      id: 'cp_3',
      code: 'ORGANIC15',
      type: 'percentage',
      value: 15,
      minOrderValue: 1499,
      maxDiscount: 350,
      expiryDate: '2026-09-30',
      isActive: true,
      usageLimit: 200,
      totalUsed: 67
    }
  ];

  // 10. Store & Business Master Settings
  const storeSettings = {
    // Brand Identity
    businessName: 'Eternal Nutricare',
    brandName: 'Eternal Nutricare',
    tagline: 'Pure. Natural. Eternal.',
    ownerName: 'Neelhari & Team',
    primaryPhone: '+91 6302017482',
    secondaryPhone: '+91 9392235693',
    primaryWhatsApp: '916302017482',
    secondaryWhatsApp: '919392235693',
    supportEmail: 'eternalncdm@gmail.com',
    registeredAddress: 'Eternal Sales\nFlat No.A1, Eco greens layout, hegondanahalli, Gunjur, Bangalore - 560087',
    
    // Legal & Government Licenses
    gstin: '29ABCDE1234F1Z5',
    udyamNumber: 'UDYAM-KR-03-0464297',
    fssaiNumber: '21226009001641',

    // Operational Status
    isStoreLive: true,
    pauseNoticeMessage: 'We are temporarily pausing new orders for inventory restocking. We will resume taking orders tomorrow at 9:00 AM.',

    // Shipping Rules
    currencySymbol: '₹',
    minOrderValue: 999,
    freeShippingThreshold: 999,
    standardShippingFee: 40,
    serviceablePincodes: '560001, 560002, 560003, 560004, 560008, 560011, 560017, 560025, 560034, 560038, 560041, 560066, 560067, 560076, 560087, 560100, 560102, 560103',

    // Trust Stats Strip
    trustStats: [
      { id: 'ts_1', count: '10,000+', label: 'Happy Families' },
      { id: 'ts_2', count: '100%', label: 'Certified Organic' },
      { id: 'ts_3', count: '★ 4.9 / 5', label: 'Customer Rating' },
      { id: 'ts_4', count: 'Bangalore', label: 'Express Delivery' }
    ]
  };

  // 11. Analytics Overview
  const analytics = {
    todayRevenue: 3416,
    weekRevenue: 28450,
    monthRevenue: 114200,
    allTimeRevenue: 542800,
    totalOrders: 486,
    pendingOrders: 2,
    completedOrders: 478,
    averageOrderValue: 1116,
    activeProducts: 10,
    lowStockCount: 1
  };

  // Public Interface
  return {
    categories,
    products,
    orders,
    customers,
    heroBanners,
    featuredCollections,
    festiveSpecials,
    announcementItems,
    coupons,
    storeSettings,
    analytics
  };

})();
