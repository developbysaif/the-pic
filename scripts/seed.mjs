import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sage_store';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const db = mongoose.connection.db;

  // Clear existing collections
  console.log('Clearing old collections...');
  const collections = ['users', 'categories', 'products', 'orders', 'reviews', 'coupons', 'storesettings', 'newsletters'];
  for (const colName of collections) {
    try {
      await db.collection(colName).drop();
    } catch (e) {
      // ignore if collection doesn't exist
    }
  }

  // 1. Seed Store Settings
  console.log('Seeding Store Settings...');
  await db.collection('storesettings').insertOne({
    siteName: 'SAGE & BOTANICA',
    announcementText: '🌿 Complimentary Express Delivery across Pakistan on all orders over Rs. 3,500 | Cash on Delivery (COD) Available',
    announcementActive: true,
    freeShippingThreshold: 3500,
    shippingFee: 250,
    supportEmail: 'concierge@sageandbotanica.com',
    supportPhone: '+92 300 8472910',
    instagramUrl: 'https://instagram.com/sageandbotanica',
    heroTitle: 'Botanical Alchemy for Mind & Skin',
    heroSubtitle: 'Hand-crafted with cold-pressed alpine sage, organic seed elixirs, and restorative earth minerals. Experience quiet luxury.',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Seed Users
  console.log('Seeding Users...');
  const adminPasswordHash = await bcrypt.hash('admin12345', 10);
  const customerPasswordHash = await bcrypt.hash('customer12345', 10);

  const adminResult = await db.collection('users').insertOne({
    name: 'Master Admin',
    email: 'admin@sageandbotanica.com',
    passwordHash: adminPasswordHash,
    phone: '+92 300 8472910',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'admin',
    addresses: [
      {
        title: 'HQ Office',
        street: 'Suite 402, Sage Towers, Gulberg III',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan',
        phone: '+92 300 8472910',
        isDefault: true,
      },
    ],
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const customerResult = await db.collection('users').insertOne({
    name: 'Amina Khan',
    email: 'customer@sageandbotanica.com',
    passwordHash: customerPasswordHash,
    phone: '+92 321 4567890',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'customer',
    addresses: [
      {
        title: 'Home Address',
        street: 'House 14-B, Street 7, DHA Phase 5',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54792',
        country: 'Pakistan',
        phone: '+92 321 4567890',
        isDefault: true,
      },
      {
        title: 'Karachi Residence',
        street: 'Apartment 8C, Ocean Heights, Clifton Block 4',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '75600',
        country: 'Pakistan',
        phone: '+92 321 4567890',
        isDefault: false,
      },
    ],
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Seed Categories
  console.log('Seeding Categories...');
  const catSkincare = await db.collection('categories').insertOne({
    name: 'Organic Skincare',
    slug: 'skincare',
    description: 'Cold-pressed botanical elixirs, rejuvenating face creams, and active herbal serums.',
    image: '/images/products/serum-main.jpg',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catFragrance = await db.collection('categories').insertOne({
    name: 'Home Fragrance & Candles',
    slug: 'home-fragrance',
    description: 'Hand-poured ceramic soy candles and reed diffusers infused with wild mountain cedar.',
    image: '/images/products/candle-main.jpg',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catApothecary = await db.collection('categories').insertOne({
    name: 'Apothecary & Mists',
    slug: 'apothecary-mists',
    description: 'Aura mists, floral hydrosols, and therapeutic ambient room sprays.',
    image: '/images/products/mist-main.jpg',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catBody = await db.collection('categories').insertOne({
    name: 'Bath & Body Rituals',
    slug: 'bath-and-body',
    description: 'Soothing golden body elixirs, botanical bathing salts, and skin-softening balms.',
    image: '/images/products/body-oil.jpg',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 4. Seed Products with rich variants & hotspots
  console.log('Seeding Products...');
  const products = [
    {
      name: 'Alpine Sage Botanical Renewal Serum',
      slug: 'alpine-sage-botanical-renewal-serum',
      shortDescription: 'High-potency organic herbal serum with cold-pressed alpine sage, squalane, and bioactive antioxidants.',
      description: 'An extraordinary restorative treatment formulated to deeply replenish fatigued skin. Hand-harvested alpine sage works in synergy with plant-derived olive squalane and jojoba seed lipids to deliver weightless cellular hydration, calm inflammation, and restore natural luminosity. Housed in a custom frosted glass vessel with a sustainable bamboo precision dropper.',
      category: catSkincare.insertedId,
      images: ['/images/products/serum-main.jpg', '/images/products/cream-main.jpg'],
      variants: [
        {
          id: 'v1',
          name: '50ml Fluted Sage Glass',
          value: '#789575',
          image: '/images/products/serum-main.jpg',
          sku: 'SAGE-SRM-50',
          price: 4200,
          salePrice: 3650,
          stock: 45,
          active: true,
        },
        {
          id: 'v2',
          name: '100ml Apothecary Edition',
          value: '#567053',
          image: '/images/products/serum-main.jpg',
          sku: 'SAGE-SRM-100',
          price: 7400,
          salePrice: 6800,
          stock: 28,
          active: true,
        },
        {
          id: 'v3',
          name: '30ml Travel Pipette',
          value: '#AAB99F',
          image: '/images/products/serum-main.jpg',
          sku: 'SAGE-SRM-30',
          price: 2800,
          salePrice: 2450,
          stock: 60,
          active: true,
        },
      ],
      specifications: [
        { key: 'Skin Type', value: 'All skin types, sensitive and dry skin' },
        { key: 'Key Actives', value: 'Alpine Sage Extract, Squalane, Vitamin E, Rosemary Leaf' },
        { key: 'Extraction Method', value: 'Supercritical CO2 Cold Extraction' },
        { key: 'Certifications', value: '100% Organic, Vegan & Cruelty-Free' },
      ],
      features: [
        'Instantly locks in deep hydration without greasiness',
        'Visible reduction in redness and morning puffiness within 7 days',
        'Shields against environmental oxidative stressors',
        'Crafted in small botanical batches in temperature-controlled glass vats'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Natural Bamboo Dropper',
          partName: 'Precision Bamboo Dispenser',
          description: 'Carved from sustainable alpine bamboo with a pharmaceutical-grade elastomer bulb.',
          benefits: 'Delivers measured 3-drop dosages to prevent wasteful over-application.',
          technicalInfo: 'FSC-Certified eco-bamboo collar, 100% recyclable glass pipette.',
          x: 50,
          y: 14,
        },
        {
          id: 'h2',
          title: 'Supercritical Sage Core',
          partName: 'Cold-Extracted Sage Elixir',
          description: 'A pure golden-green herbal extract rich in carnosic and ursolic acids.',
          benefits: 'Powerful botanical antioxidants soothe stress and fortify the dermal barrier.',
          technicalInfo: 'Harvested at 1,800m altitude at peak morning dew bloom.',
          x: 48,
          y: 56,
        },
        {
          id: 'h3',
          title: 'Frosted Glass Flacon',
          partName: 'UV-Shielding Heavy Glass',
          description: 'Frosted Pale Sage Ivory vessel weighted for luxury tactile elegance.',
          benefits: 'Prevents photo-oxidation of delicate terpenes and natural chlorophyll.',
          technicalInfo: '100% infinitely recyclable soda-lime glass.',
          x: 75,
          y: 78,
        },
      ],
      model3D: {
        enabled: true,
        color: '#789575',
        shape: 'serum',
      },
      price: 4200,
      salePrice: 3650,
      SKU: 'SAGE-SRM-50',
      stock: 133,
      rating: 4.9,
      reviewsCount: 38,
      featured: true,
      bestSeller: true,
      trending: true,
      status: 'published',
      ingredients: 'Salvia Officinalis (Sage) Leaf Extract, Simmondsia Chinensis (Jojoba) Seed Oil, Olive Squalane, Tocopherol (Vitamin E), Anthemis Nobilis (Chamomile) Flower Oil, Rosmarinus Officinalis Extract.',
      howToUse: 'Warm 3-4 drops between clean palms and gently press onto freshly cleansed face, neck, and decolletage every morning and evening before heavier creams.',
      shippingInfo: 'Dispatched via express courier within 24 hours. Free Cash on Delivery for orders above Rs. 3,500.',
      returnPolicy: '30-day effortless returns if seal remains untampered. 100% satisfaction guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Artisanal Ceramic Soy Candle — No. 04 Herbal Hearth',
      slug: 'artisanal-ceramic-soy-candle-herbal-hearth',
      shortDescription: 'Slow-burning organic soy wax candle hand-poured in a pale sage ceramic vessel with crackling wooden wick.',
      description: 'Transform your living space into a tranquil alpine sanctuary. Hand-poured with pure, non-GMO soy wax infused with wild sage, crisp eucalyptus, and smoky cedar bark. Features a crackling FSC-certified cherry wood wick that mimics the gentle hearth of a woodland cabin. Once finished, the heavy artisan ceramic container becomes an enduring keepsake.',
      category: catFragrance.insertedId,
      images: ['/images/products/candle-main.jpg'],
      variants: [
        {
          id: 'v1',
          name: '280g Pale Sage Ceramic',
          value: '#D4DBC0',
          image: '/images/products/candle-main.jpg',
          sku: 'SAGE-CND-280',
          price: 3800,
          salePrice: 3250,
          stock: 35,
          active: true,
        },
        {
          id: 'v2',
          name: '450g Double Wooden Wick',
          value: '#789575',
          image: '/images/products/candle-main.jpg',
          sku: 'SAGE-CND-450',
          price: 5900,
          salePrice: 5200,
          stock: 19,
          active: true,
        },
      ],
      specifications: [
        { key: 'Burn Time', value: '65+ hours (280g) / 100+ hours (450g)' },
        { key: 'Wax Type', value: '100% Pure Organic Soybean Wax' },
        { key: 'Wick', value: 'FSC-Certified Natural Cherry Wood' },
        { key: 'Vessel Material', value: 'Hand-thrown Stoneware Ceramic' },
      ],
      features: [
        'Clean soot-free burn with comforting crackling fireplace acoustics',
        'Artisanal ceramic jar doubles as coffee cup or succulent planter',
        'Phthalate-free and paraben-free pure essential scent oils'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Crackling Wood Wick',
          partName: 'FSC Natural Cherry Wood',
          description: 'A flat-cut organic wood wick that creates a mesmerizing horizontal flame and soft crackle.',
          benefits: 'Throws scent 40% faster than cotton wicks while producing zero toxic soot.',
          technicalInfo: 'Harvested from sustainably managed US forests.',
          x: 50,
          y: 22,
        },
        {
          id: 'h2',
          title: 'Hand-Thrown Stoneware',
          partName: 'Matte Pale Sage Vessel',
          description: 'Thick ceramic body with custom satin glaze in our bespoke pale sage hue.',
          benefits: 'Insulates heat gently and preserves its look as a luxury home decor centerpiece.',
          technicalInfo: 'Fired at 1250°C, microwave and dishwasher safe after wax cleanup.',
          x: 72,
          y: 70,
        },
      ],
      model3D: {
        enabled: true,
        color: '#D4DBC0',
        shape: 'candle',
      },
      price: 3800,
      salePrice: 3250,
      SKU: 'SAGE-CND-280',
      stock: 54,
      rating: 4.8,
      reviewsCount: 24,
      featured: true,
      bestSeller: false,
      trending: true,
      status: 'published',
      ingredients: 'Organic Hydrogenated Soybean Oil, Salvia Officinalis Essential Oil, Cupressus Sempervirens (Cypress) Oil, Eucalyptus Globulus Leaf Oil, Natural Plant Extracts.',
      howToUse: 'On first light, allow the wax pool to reach the vessel edge (2-3 hours). Trim wood wick to 1/8 inch before each subsequent relight.',
      shippingInfo: 'Packaged in custom biodegradable molded pulp packaging for shatter-proof transit.',
      returnPolicy: '30 days unused return policy.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Velvet Botanical Rejuvenating Cream',
      slug: 'velvet-botanical-rejuvenating-cream',
      shortDescription: 'Ultra-nourishing barrier repair face cream with mountain sage, shea butter, and plant ceramides.',
      description: 'A decadent moisture cocoon that melts upon skin contact. Powered by biocompatible ceramides, organic wild sage leaf hydrolat, and whipped African nilotica shea, this rich yet breathable cream seals in hydration, repairs compromised lipid barriers, and leaves a radiant velvet-soft satin finish.',
      category: catSkincare.insertedId,
      images: ['/images/products/cream-main.jpg'],
      variants: [
        {
          id: 'v1',
          name: '60ml Frosted Heavy Jar',
          value: '#E5E8CE',
          image: '/images/products/cream-main.jpg',
          sku: 'SAGE-CRM-60',
          price: 4600,
          salePrice: 3950,
          stock: 40,
          active: true,
        },
        {
          id: 'v2',
          name: '120ml Luxury Double Jar',
          value: '#789575',
          image: '/images/products/cream-main.jpg',
          sku: 'SAGE-CRM-120',
          price: 7900,
          salePrice: 6900,
          stock: 22,
          active: true,
        },
      ],
      specifications: [
        { key: 'Texture', value: 'Rich, whipped velvet emulsion' },
        { key: 'Finish', value: 'Subtle dewy satin, non-comedogenic' },
        { key: 'Ideal For', value: 'Dry, compromised, sensitive, and mature skin' },
      ],
      features: [
        'Clinically shown to restore skin moisture barrier within 24 hours',
        'Zero artificial silicones or pore-clogging mineral oils',
        'Enriched with botanical squalane and 5 essential ceramides'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Natural Beechwood Lid',
          partName: 'Airtight Wood Screw Cap',
          description: 'Turned from solid beechwood with an internal silicone seal to prevent evaporation.',
          benefits: 'Keeps bioactive cold-pressed botanical enzymes fresh and active.',
          technicalInfo: 'Water-resistant natural food-safe wax polish.',
          x: 50,
          y: 20,
        },
        {
          id: 'h2',
          title: 'Velvet Emulsion Base',
          partName: 'Micro-Encapsulated Ceramide Core',
          description: 'A whipped cloud texture that dissolves upon finger warmth.',
          benefits: 'Deep trans-epidermal hydration that lasts for over 48 hours.',
          technicalInfo: 'pH 5.5 balanced to match healthy skin mantle.',
          x: 48,
          y: 58,
        },
      ],
      model3D: {
        enabled: true,
        color: '#E5E8CE',
        shape: 'jar',
      },
      price: 4600,
      salePrice: 3950,
      SKU: 'SAGE-CRM-60',
      stock: 62,
      rating: 5.0,
      reviewsCount: 19,
      featured: true,
      bestSeller: true,
      trending: false,
      status: 'published',
      ingredients: 'Salvia Officinalis Hydrosol, Butyrospermum Parkii (Shea) Butter, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Phytosphingosine, Cetearyl Alcohol, Glycerin.',
      howToUse: 'Scoop a pea-sized amount with clean fingertip and smooth over face and neck morning and night.',
      shippingInfo: 'Fast delivery across Pakistan in 2-4 business days.',
      returnPolicy: '30-day money-back guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Botanical Hydration Mist & Room Aura',
      slug: 'botanical-hydration-mist-room-aura',
      shortDescription: 'Ultra-fine atomized facial and atmospheric mist infused with steam-distilled sage and mountain rosewater.',
      description: 'An invigorating multi-use botanical hydration mist. Created via copper alembic distillation of freshly cut sage leaves and wild roses, this fine aromatic veil awakens tired skin, sets mineral makeup, and purifies surrounding air with a fresh botanical herbal breeze.',
      category: catApothecary.insertedId,
      images: ['/images/products/mist-main.jpg'],
      variants: [
        {
          id: 'v1',
          name: '100ml Brushed Gold Sprayer',
          value: '#789575',
          image: '/images/products/mist-main.jpg',
          sku: 'SAGE-MST-100',
          price: 2900,
          salePrice: 2450,
          stock: 50,
          active: true,
        },
        {
          id: 'v2',
          name: '200ml Refill Flask',
          value: '#AAB99F',
          image: '/images/products/mist-main.jpg',
          sku: 'SAGE-MST-200',
          price: 4500,
          salePrice: 3900,
          stock: 35,
          active: true,
        },
      ],
      specifications: [
        { key: 'Application', value: 'Face, body, linens, and ambient meditation space' },
        { key: 'Formula', value: 'Alcohol-free, 100% steam distilled hydrosol' },
      ],
      features: [
        'Instant 88% boost in skin surface moisture on contact',
        'Aromatherapeutic benefits reduce mental tension and elevate mood',
        'Micro-droplet spray technology leaves no damp patches'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Gold Atomizer Nozzle',
          partName: 'Micro-Droplet Spray Engine',
          description: 'A brushed gold pump with internal micro-mesh producing a 35-micron aerosolized cloud.',
          benefits: 'Delivers even, velvety coverage without disrupting makeup or dripping.',
          technicalInfo: 'Lead-free brass plating with rust-proof stainless steel spring.',
          x: 50,
          y: 16,
        },
      ],
      model3D: {
        enabled: true,
        color: '#789575',
        shape: 'mist',
      },
      price: 2900,
      salePrice: 2450,
      SKU: 'SAGE-MST-100',
      stock: 85,
      rating: 4.7,
      reviewsCount: 16,
      featured: false,
      bestSeller: false,
      trending: true,
      status: 'published',
      ingredients: 'Salvia Officinalis Flower/Leaf Hydrosol, Rosa Damascena Flower Water, Aloe Barbadensis Leaf Juice, Sodium Hyaluronate, Leuconostoc/Radish Root Ferment Filtrate.',
      howToUse: 'Hold 8-10 inches from face with eyes closed and mist generously throughout the day as needed.',
      shippingInfo: 'Dispatched in insulated protective wraps.',
      returnPolicy: '30-day returns accepted.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Wild Sage & Cedar Fluted Diffuser',
      slug: 'wild-sage-cedar-fluted-diffuser',
      shortDescription: 'Continuous botanical home aroma in a fluted emerald-sage glass decanter with natural rattan reeds.',
      description: 'A sophisticated architectural statement for discerning interiors. Notes of crisp mountain clary sage, white cedarwood, crushed moss, and solar bergamot drift effortlessly into the atmosphere for up to 90 days of flame-free natural scent diffusion.',
      category: catFragrance.insertedId,
      images: ['/images/products/diffuser-main.jpg'],
      variants: [
        {
          id: 'v1',
          name: '200ml Fluted Sage Vessel',
          value: '#789575',
          image: '/images/products/diffuser-main.jpg',
          sku: 'SAGE-DIF-200',
          price: 4800,
          salePrice: 4100,
          stock: 32,
          active: true,
        },
        {
          id: 'v2',
          name: '500ml Grand Sanctuary Vessel',
          value: '#567053',
          image: '/images/products/diffuser-main.jpg',
          sku: 'SAGE-DIF-500',
          price: 8900,
          salePrice: 7800,
          stock: 14,
          active: true,
        },
      ],
      specifications: [
        { key: 'Lifespan', value: '3 to 4 months of continuous scenting' },
        { key: 'Reeds', value: '8 High-absorption natural porous rattan sticks' },
      ],
      features: [
        'Continuous ambient fragrance without heat, open flames, or electricity',
        'Custom fluted glass bottle creates striking architectural decor',
        'VOC-compliant and formulated without artificial musk binders'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Natural Rattan Reeds',
          partName: 'Porous Core Wicking Canes',
          description: 'Indonesian unbleached rattan stalks with vertical capillaries.',
          benefits: 'Steadily pulls fragrance upward without clogging or sticky residue.',
          technicalInfo: '30cm length for maximum room throw.',
          x: 50,
          y: 20,
        },
        {
          id: 'h2',
          title: 'Fluted Glass Decanter',
          partName: 'Architectural Ribbed Glass',
          description: 'Solid heavy-base glassware with vertical fluted ribbing.',
          benefits: 'Reflects soft ambient room light into emerald and sage tones.',
          technicalInfo: '380g empty glass weight for stable, tip-free placement.',
          x: 52,
          y: 72,
        },
      ],
      model3D: {
        enabled: true,
        color: '#789575',
        shape: 'serum',
      },
      price: 4800,
      salePrice: 4100,
      SKU: 'SAGE-DIF-200',
      stock: 46,
      rating: 4.9,
      reviewsCount: 22,
      featured: false,
      bestSeller: true,
      trending: false,
      status: 'published',
      ingredients: 'Bio-based Dipropylene Glycol Methyl Ether, Salvia Sclarea (Clary Sage) Oil, Cedrus Atlantica (Cedarwood) Bark Oil, Citrus Aurantium Bergamia (Bergamot) Fruit Oil.',
      howToUse: 'Insert 6-8 reeds into the vessel. Invert reeds once a week or whenever an extra burst of scent is desired.',
      shippingInfo: 'Arrives in a rigid presentation gift cylinder box.',
      returnPolicy: '30-day unopened returns.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Botanical Golden Body & Bath Oil',
      slug: 'botanical-golden-body-bath-oil',
      shortDescription: 'Luminous organic dry body oil infused with alpine sage blossoms, golden jojoba, and calendula petals.',
      description: 'An indulgent multi-correctional body oil that drapes the skin in golden botanical radiance. Fast-absorbing organic macadamia, rosehip, and jojoba oils soften rough textures, soothe sun-drenched skin, and leave a luminous, non-greasy glow scented with wild sage and sweet orange.',
      category: catBody.insertedId,
      images: ['/images/products/body-oil.jpg'],
      variants: [
        {
          id: 'v1',
          name: '150ml Golden Pipette',
          value: '#F2F0E7',
          image: '/images/products/body-oil.jpg',
          sku: 'SAGE-OIL-150',
          price: 4500,
          salePrice: 3850,
          stock: 42,
          active: true,
        },
        {
          id: 'v2',
          name: '250ml Spa Bath Decanter',
          value: '#D4DBC0',
          image: '/images/products/body-oil.jpg',
          sku: 'SAGE-OIL-250',
          price: 6800,
          salePrice: 5900,
          stock: 25,
          active: true,
        },
      ],
      specifications: [
        { key: 'Absorption', value: 'Rapid dry oil absorption in under 60 seconds' },
        { key: 'Key Oils', value: 'Cold-pressed Jojoba, Rosehip, Sweet Almond, Sage' },
      ],
      features: [
        'Instant silky non-greasy skin finish with natural healthy radiance',
        'Can be massaged directly onto damp post-shower skin or poured into warm bath',
        'Floating whole botanical flowers preserved inside every bottle'
      ],
      hotspots: [
        {
          id: 'h1',
          title: 'Suspended Herbarium',
          partName: 'Whole Organic Calendula & Sage',
          description: 'Hand-picked organic botanical petals gently submerged in golden oil.',
          benefits: 'Continuously releases restorative phytonutrients into the carrier oil.',
          technicalInfo: 'Sterilized whole botanicals, 0% artificial colorants.',
          x: 50,
          y: 55,
        },
      ],
      model3D: {
        enabled: true,
        color: '#789575',
        shape: 'serum',
      },
      price: 4500,
      salePrice: 3850,
      SKU: 'SAGE-OIL-150',
      stock: 67,
      rating: 4.9,
      reviewsCount: 31,
      featured: true,
      bestSeller: false,
      trending: true,
      status: 'published',
      ingredients: 'Simmondsia Chinensis (Jojoba) Seed Oil, Prunus Amygdalus Dulcis (Sweet Almond) Oil, Rosa Canina (Rosehip) Seed Oil, Salvia Officinalis Oil, Calendula Officinalis Petals.',
      howToUse: 'Smooth generously over body while skin is still warm and damp after bathing. Add 2 capfuls to a warm bath for a comforting soak.',
      shippingInfo: 'Dispatched via express COD service.',
      returnPolicy: '30-day money-back guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const productInsertResult = await db.collection('products').insertMany(products);
  console.log(`Inserted ${productInsertResult.insertedCount} products.`);

  // 5. Seed Reviews for flagship serum and candle
  console.log('Seeding Customer Reviews...');
  const serumId = productInsertResult.insertedIds[0];
  const candleId = productInsertResult.insertedIds[1];

  await db.collection('reviews').insertMany([
    {
      productId: serumId,
      userId: customerResult.insertedId,
      customerName: 'Amina Khan',
      rating: 5,
      title: 'Remarkable calm and radiant glow within a week!',
      comment: 'I have very sensitive skin prone to redness. This sage renewal serum feels like pure silk and calmed my skin almost immediately. The bamboo dropper and frosted glass bottle are breathtaking on my vanity. Cash on delivery was seamless in Lahore!',
      verifiedPurchase: true,
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      productId: serumId,
      customerName: 'Zainab Tariq',
      rating: 5,
      title: 'Better than international luxury serums',
      comment: 'The texture is weightless yet deeply nourishing. Smells like a serene botanical garden. Packaging is 10/10.',
      verifiedPurchase: true,
      status: 'approved',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
      productId: candleId,
      customerName: 'Hamza Siddiqui',
      rating: 5,
      title: 'The wooden wick crackle is pure magic',
      comment: 'Lighting this candle after a long work day is an instant stress reliever. The sage and cedar scent fills my entire living room without being overpowering. Will definitely order the diffuser next.',
      verifiedPurchase: true,
      status: 'approved',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 6. Seed Coupons
  console.log('Seeding Promo Coupons...');
  await db.collection('coupons').insertMany([
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      value: 10,
      minOrderAmount: 2000,
      maxDiscount: 1000,
      validUntil: new Date('2028-12-31'),
      isActive: true,
      usageCount: 14,
    },
    {
      code: 'SAGE500',
      discountType: 'fixed',
      value: 500,
      minOrderAmount: 4000,
      validUntil: new Date('2028-12-31'),
      isActive: true,
      usageCount: 8,
    },
  ]);

  // 7. Seed Real Sample Orders for Customer & Admin Dashboard
  console.log('Seeding Sample Orders...');
  await db.collection('orders').insertMany([
    {
      orderNumber: 'SB-2026-9041',
      userId: customerResult.insertedId,
      customerDetails: {
        name: 'Amina Khan',
        email: 'customer@sageandbotanica.com',
        phone: '+92 321 4567890',
      },
      shippingAddress: {
        street: 'House 14-B, Street 7, DHA Phase 5',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54792',
        country: 'Pakistan',
        notes: 'Please ring bell twice upon arrival',
      },
      items: [
        {
          productId: serumId,
          variantId: 'v1',
          title: 'Alpine Sage Botanical Renewal Serum',
          variantName: '50ml Fluted Sage Glass',
          image: '/images/products/serum-main.jpg',
          price: 3650,
          quantity: 1,
          sku: 'SAGE-SRM-50',
          slug: 'alpine-sage-botanical-renewal-serum',
        },
        {
          productId: candleId,
          variantId: 'v1',
          title: 'Artisanal Ceramic Soy Candle — No. 04 Herbal Hearth',
          variantName: '280g Pale Sage Ceramic',
          image: '/images/products/candle-main.jpg',
          price: 3250,
          quantity: 1,
          sku: 'SAGE-CND-280',
          slug: 'artisanal-ceramic-soy-candle-herbal-hearth',
        },
      ],
      subtotal: 6900,
      discount: 500,
      shippingFee: 0,
      total: 6400,
      couponCode: 'SAGE500',
      paymentMethod: 'COD',
      paymentStatus: 'COLLECTED',
      orderStatus: 'DELIVERED',
      estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      actualDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      courierCompany: 'TCS Express Courier',
      trackingNumber: 'TCS-98421057',
      deliveryNotes: 'Delivered and cash collected successfully.',
      statusHistory: [
        { status: 'PENDING', note: 'Order placed by customer via Cash on Delivery', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { status: 'CONFIRMED', note: 'Order confirmed by concierge team', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: 'PROCESSING', note: 'Carefully hand-packaged in gift box', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: 'DISPATCHED', note: 'Handed over to TCS courier rider', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'OUT_FOR_DELIVERY', note: 'Out with rider Muhammad Asif for final delivery', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'DELIVERED', note: 'Customer accepted parcel and paid Rs. 6,400 in cash', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      orderNumber: 'SB-2026-9042',
      userId: customerResult.insertedId,
      customerDetails: {
        name: 'Amina Khan',
        email: 'customer@sageandbotanica.com',
        phone: '+92 321 4567890',
      },
      shippingAddress: {
        street: 'Apartment 8C, Ocean Heights, Clifton Block 4',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '75600',
        country: 'Pakistan',
        notes: 'Leave with reception if not home',
      },
      items: [
        {
          productId: productInsertResult.insertedIds[2],
          variantId: 'v1',
          title: 'Velvet Botanical Rejuvenating Cream',
          variantName: '60ml Frosted Heavy Jar',
          image: '/images/products/cream-main.jpg',
          price: 3950,
          quantity: 1,
          sku: 'SAGE-CRM-60',
          slug: 'velvet-botanical-rejuvenating-cream',
        },
      ],
      subtotal: 3950,
      discount: 0,
      shippingFee: 0,
      total: 3950,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'DISPATCHED',
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      courierCompany: 'Leopards Courier Service',
      trackingNumber: 'LEO-74892110',
      deliveryNotes: 'In transit to Karachi delivery hub',
      statusHistory: [
        { status: 'PENDING', note: 'Order placed by customer via Cash on Delivery', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'CONFIRMED', note: 'Order verified', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'PACKED', note: 'Sealed in tamper-evident eco pouch', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'DISPATCHED', note: 'Departed Lahore Central Hub to Karachi Hub', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      ],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  ]);

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
