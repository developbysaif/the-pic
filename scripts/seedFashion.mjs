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
      // ignore
    }
  }

  // 1. Seed Store Settings
  console.log('Seeding Store Settings...');
  await db.collection('storesettings').insertOne({
    siteName: 'VOGUE ATELIER',
    announcementText: '🔥 NEW SEASON 2026: CLOTHES, WATCHES, SHIRTS & SLIDES | CASH ON DELIVERY ACROSS PAKISTAN | FREE SHIPPING OVER RS. 4,500',
    announcementActive: true,
    freeShippingThreshold: 4500,
    shippingFee: 300,
    supportEmail: 'concierge@vogueatelier.com',
    supportPhone: '+92 300 8472910',
    instagramUrl: 'https://instagram.com/vogueatelier',
    heroTitle: 'Modern Luxury Apparel & Timepieces',
    heroSubtitle: 'Tailored luxury streetwear, handcrafted Swiss-inspired chronographs, silk-blend shirting, and architectural comfort slides.',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 2. Seed Users
  console.log('Seeding Users...');
  const adminPasswordHash = await bcrypt.hash('admin12345', 10);
  const customerPasswordHash = await bcrypt.hash('customer12345', 10);

  const adminResult = await db.collection('users').insertOne({
    name: 'Master Admin',
    email: 'admin@vogueatelier.com',
    passwordHash: adminPasswordHash,
    phone: '+92 300 8472910',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'admin',
    addresses: [
      {
        title: 'HQ Flagship',
        street: 'Suite 501, Vogue Atrium, Gulberg III',
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
    name: 'Saif Malik',
    email: 'saif@vogueatelier.com',
    passwordHash: customerPasswordHash,
    phone: '+92 321 4567890',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    role: 'customer',
    addresses: [
      {
        title: 'Home Address',
        street: 'Villa 18, Block G, Phase 6 DHA',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54792',
        country: 'Pakistan',
        phone: '+92 321 4567890',
        isDefault: true,
      },
    ],
    isVerified: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 3. Seed Categories: Clothes, Watches, Shirts, Slides
  console.log('Seeding Fashion Categories...');
  const catClothes = await db.collection('categories').insertOne({
    name: 'Clothes',
    slug: 'clothes',
    description: 'Heavyweight hoodies, tailored outerwear, luxury streetwear, and oversized silhouettes.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catWatches = await db.collection('categories').insertOne({
    name: 'Watches',
    slug: 'watches',
    description: 'Precision Swiss-movement chronographs, forged titanium bezels, and luxury timepieces.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catShirts = await db.collection('categories').insertOne({
    name: 'Shirts',
    slug: 'shirts',
    description: 'Italian silk-blend shirts, tailored Oxford cotton, and relaxed Cuban collar resort shirts.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const catSlides = await db.collection('categories').insertOne({
    name: 'Slides',
    slug: 'slides',
    description: 'High-rebound cloud EVA foam slides, ergonomic contoured footbeds, and modern footwear.',
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 4. Seed Products
  console.log('Seeding Products...');
  const products = [
    // WATCHES
    {
      name: 'Royal Obsidian Chronograph X',
      slug: 'royal-obsidian-chronograph-x',
      shortDescription: 'Mastercrafted forged titanium chronograph with scratchproof sapphire crystal and automatic Swiss movement.',
      description: 'The pinnacle of precision horology. Designed with a deep obsidian sunburst dial, hand-brushed aerospace grade-5 titanium casing, and dual sub-dial chronograph counters. Features an anti-reflective double-domed sapphire crystal and 100-meter water resistance. Accompanied by both an integrated titanium link bracelet and a vulcanized FKM rubber sport strap.',
      category: catWatches.insertedId,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Obsidian Black / Titanium',
          value: '#1A1A1A',
          image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
          sku: 'WTC-OBS-01',
          price: 48500,
          salePrice: 42900,
          stock: 25,
          active: true,
        },
        {
          id: 'v2',
          name: 'Silver Steel / Midnight Blue',
          value: '#C0C0C0',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
          sku: 'WTC-SIL-02',
          price: 48500,
          salePrice: 42900,
          stock: 18,
          active: true,
        }
      ],
      specifications: [
        { key: 'Movement', value: 'Automatic Calibre VA-99 Precision Movement (48h Reserve)' },
        { key: 'Case Material', value: 'Grade-5 Aerospace Titanium (42mm)' },
        { key: 'Glass', value: 'Double-Domed Anti-Reflective Sapphire Crystal' },
        { key: 'Water Resistance', value: '10 ATM (100 Meters / 330 Feet)' },
        { key: 'Warranty', value: '5-Year International Movement Warranty' }
      ],
      features: [
        'Automatic sweeping second hand with Swiss luminescent indices',
        'Scratch-resistant double-curved sapphire crystal face',
        'Dual micro-adjustable deployment clasp for custom comfort fit',
        'Includes bespoke velvet-lined presentation collector box'
      ],
      model3D: { enabled: false },
      price: 48500,
      salePrice: 42900,
      SKU: 'WTC-OBS-01',
      stock: 43,
      rating: 4.9,
      reviewsCount: 52,
      featured: true,
      bestSeller: true,
      trending: true,
      status: 'published',
      howToUse: 'Wind the crown 20 turns before first wear. To set time, pull crown to position 2 and rotate clockwise.',
      shippingInfo: 'Dispatched via Insured Express Courier within 24 hours. Free Cash on Delivery across Pakistan.',
      returnPolicy: '7-day inspection period with 100% money-back guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Aura Minimalist Rose Gold Chrono',
      slug: 'aura-minimalist-rose-gold-chrono',
      shortDescription: 'Sleek champagne gold sunburst dial with genuine Italian top-grain leather strap.',
      description: 'An understated masterpiece of minimalist elegance. Hand-polished 316L surgical stainless steel dipped in 18K rose gold PVD coating. Ultra-slim 8.2mm profile seamlessly slides under shirt cuffs.',
      category: catWatches.insertedId,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Rose Gold / Tan Leather',
          value: '#B76E79',
          image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop',
          sku: 'WTC-GLD-01',
          price: 34000,
          salePrice: 29500,
          stock: 30,
          active: true,
        }
      ],
      specifications: [
        { key: 'Case', value: '316L Stainless Steel 18K PVD (40mm)' },
        { key: 'Movement', value: 'Precision Quartz Calibre' },
        { key: 'Strap', value: 'Italian Full-Grain Vegetable Tanned Leather' }
      ],
      features: [
        'Ultra-slim 8.2mm profile',
        'Quick-release interchangeable strap mechanism',
        'Water-resistant to 50 meters'
      ],
      model3D: { enabled: false },
      price: 34000,
      salePrice: 29500,
      SKU: 'WTC-GLD-01',
      stock: 30,
      rating: 4.8,
      reviewsCount: 34,
      featured: false,
      bestSeller: true,
      trending: false,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // CLOTHES
    {
      name: 'Noir Velour Heavyweight Oversized Hoodie',
      slug: 'noir-velour-heavyweight-oversized-hoodie',
      shortDescription: '480 GSM ultra-dense French terry cotton with structured double-layered hood and relaxed drop shoulders.',
      description: 'Crafted for the ultimate modern silhouette. Made from custom-milled 480 GSM 100% pre-shrunk combed organic cotton with an ultra-soft fleece interior. Features a double-layered hood without drawstrings for a clean architectural aesthetic, heavy ribbed cuffs, and seamless drop shoulders.',
      category: catClothes.insertedId,
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Pitch Black / Size S',
          value: '#0F0F0F',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
          sku: 'CLT-HD-BLK-S',
          price: 14900,
          salePrice: 12500,
          stock: 20,
          active: true,
        },
        {
          id: 'v2',
          name: 'Pitch Black / Size M',
          value: '#0F0F0F',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
          sku: 'CLT-HD-BLK-M',
          price: 14900,
          salePrice: 12500,
          stock: 35,
          active: true,
        },
        {
          id: 'v3',
          name: 'Pitch Black / Size L',
          value: '#0F0F0F',
          image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
          sku: 'CLT-HD-BLK-L',
          price: 14900,
          salePrice: 12500,
          stock: 25,
          active: true,
        }
      ],
      specifications: [
        { key: 'Weight', value: '480 GSM Custom-Milled French Terry' },
        { key: 'Material', value: '100% Combed Cotton' },
        { key: 'Fit', value: 'Sculpted Boxy Oversized Fit' },
        { key: 'Origin', value: 'Artisanal Batch Production' }
      ],
      features: [
        'Double-layered structured hood stands upright without slouching',
        'Pre-shrunk fabric ensures zero size reduction after washing',
        'Concealed side-entry kangaroo pocket with phone divider',
        'Reinforced flatlock stitching across high-tension seams'
      ],
      model3D: { enabled: false },
      price: 14900,
      salePrice: 12500,
      SKU: 'CLT-HD-BLK-M',
      stock: 80,
      rating: 4.9,
      reviewsCount: 68,
      featured: true,
      bestSeller: true,
      trending: true,
      status: 'published',
      howToUse: 'Cold wash inside out at 30°C. Hang dry away from direct sunlight.',
      shippingInfo: 'Free Cash on Delivery across Pakistan. Delivered in 2-3 working days.',
      returnPolicy: '7-day free size exchange and hassle-free returns.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Structured Double-Breasted Wool Trench',
      slug: 'structured-double-breasted-wool-trench',
      shortDescription: 'Italian virgin wool and cashmere tailored trench coat with storm flap and Horn buttons.',
      description: 'An iconic silhouette redefined. Crafted from heavyweight 620 GSM Italian virgin wool blended with cashmere for superlative thermal warmth and a drape that commands authority.',
      category: catClothes.insertedId,
      images: [
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Charcoal Camel / Size 40R',
          value: '#8C7853',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
          sku: 'CLT-TRN-CAM-40',
          price: 28000,
          salePrice: 24000,
          stock: 12,
          active: true,
        }
      ],
      specifications: [
        { key: 'Fabric', value: '80% Virgin Wool, 20% Cashmere' },
        { key: 'Lining', value: '100% Cupro Bemberg Breathable Lining' }
      ],
      features: [
        'Genuine buffalo horn buttons',
        'Deep storm flap and belted waist'
      ],
      model3D: { enabled: false },
      price: 28000,
      salePrice: 24000,
      SKU: 'CLT-TRN-CAM-40',
      stock: 12,
      rating: 5.0,
      reviewsCount: 19,
      featured: false,
      bestSeller: false,
      trending: true,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // SHIRTS
    {
      name: 'Milano Silk-Blend Resort Shirt',
      slug: 'milano-silk-blend-resort-shirt',
      shortDescription: 'Luxurious Italian mulberry silk and long-staple cotton with genuine mother-of-pearl buttons.',
      description: 'Effortless luxury tailored for temperate elegance. Crafted from a 40% Italian mulberry silk and 60% extra-long staple Egyptian cotton blend that falls like liquid on the skin. Styled with an open camp Cuban collar, piped sleeve cuffs, and genuine iridescent mother-of-pearl buttons.',
      category: catShirts.insertedId,
      images: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Alabaster Ivory / Size M',
          value: '#F8F6F0',
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
          sku: 'SHT-SLK-IVY-M',
          price: 8900,
          salePrice: 7500,
          stock: 28,
          active: true,
        },
        {
          id: 'v2',
          name: 'Alabaster Ivory / Size L',
          value: '#F8F6F0',
          image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
          sku: 'SHT-SLK-IVY-L',
          price: 8900,
          salePrice: 7500,
          stock: 22,
          active: true,
        }
      ],
      specifications: [
        { key: 'Composition', value: '40% Mulberry Silk, 60% Long-Staple Cotton' },
        { key: 'Collar Style', value: 'Camp / Cuban Resort Collar' },
        { key: 'Buttons', value: 'Authentic Mother-of-Pearl (MOP)' }
      ],
      features: [
        'Silky cool-to-touch hand feel with subtle satin sheen',
        'Relaxed boxy cut with side split hem for freedom of movement',
        'Cross-stitched genuine shell buttons for lifelong security'
      ],
      model3D: { enabled: false },
      price: 8900,
      salePrice: 7500,
      SKU: 'SHT-SLK-IVY-M',
      stock: 50,
      rating: 4.9,
      reviewsCount: 42,
      featured: true,
      bestSeller: true,
      trending: true,
      status: 'published',
      howToUse: 'Gentle hand wash in cold water or dry clean. Iron on silk setting inside out.',
      shippingInfo: 'Nationwide Cash on Delivery across Pakistan. Free shipping on orders over Rs. 4,500.',
      returnPolicy: '7-day easy exchange and return guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Crisp Royal Oxford Button-Down',
      slug: 'crisp-royal-oxford-button-down',
      shortDescription: 'Substantial 100% two-ply pinpoint Oxford cotton shirt with structured roll collar.',
      description: 'The definitive smart casual essential. Woven with 80s two-ply yarn for breathability, durability, and a clean structured drape that stays sharp from morning to midnight.',
      category: catShirts.insertedId,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Sky Blue / Size M',
          value: '#87CEEB',
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop',
          sku: 'SHT-OXF-BLU-M',
          price: 7400,
          salePrice: 6200,
          stock: 35,
          active: true,
        }
      ],
      specifications: [
        { key: 'Weave', value: 'Two-Ply Pinpoint Oxford (160 GSM)' },
        { key: 'Collar', value: 'Classic 3-Inch Button Down Roll' }
      ],
      features: [
        'Non-iron easy care finish',
        'Reinforced side gussets with contrast stitching'
      ],
      model3D: { enabled: false },
      price: 7400,
      salePrice: 6200,
      SKU: 'SHT-OXF-BLU-M',
      stock: 35,
      rating: 4.8,
      reviewsCount: 29,
      featured: false,
      bestSeller: true,
      trending: false,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    // SLIDES
    {
      name: 'Mono Sculpt Architectural Cloud Slides',
      slug: 'mono-sculpt-architectural-cloud-slides',
      shortDescription: 'Injection-molded ultra-rebound EVA foam with deep ergonomic arch support and anti-slip tread.',
      description: 'Experience gravity-defying comfort. Engineered with single-piece injection molded high-density EVA foam that absorbs 45% more ground impact than standard slide sandals. Features a deep sculpted heel cup, curved toe grip bar, and an exaggerated futuristic outsole silhouette that sets the standard in contemporary streetwear footwear.',
      category: catSlides.insertedId,
      images: [
        'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Bone White / EU 41',
          value: '#E8E5DD',
          image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
          sku: 'SLD-MNO-WHT-41',
          price: 6400,
          salePrice: 5200,
          stock: 40,
          active: true,
        },
        {
          id: 'v2',
          name: 'Bone White / EU 42',
          value: '#E8E5DD',
          image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
          sku: 'SLD-MNO-WHT-42',
          price: 6400,
          salePrice: 5200,
          stock: 55,
          active: true,
        },
        {
          id: 'v3',
          name: 'Bone White / EU 43',
          value: '#E8E5DD',
          image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1200&auto=format&fit=crop',
          sku: 'SLD-MNO-WHT-43',
          price: 6400,
          salePrice: 5200,
          stock: 30,
          active: true,
        }
      ],
      specifications: [
        { key: 'Material', value: 'High-Rebound Closed-Cell EVA Foam' },
        { key: 'Sole Height', value: '4.2 cm Sculpted Platform' },
        { key: 'Traction', value: 'Multi-Directional Wave Grip Outsole' },
        { key: 'Waterproof', value: '100% Water Resistant & Odor Resistant' }
      ],
      features: [
        'Single-piece seamless molding with zero glue or pressure points',
        'Deep 30mm anatomical heel cradle realigns natural foot posture',
        'Featherlight weight of only 185g per slide',
        'Easy rinse-and-wipe maintenance'
      ],
      model3D: { enabled: false },
      price: 6400,
      salePrice: 5200,
      SKU: 'SLD-MNO-WHT-42',
      stock: 125,
      rating: 4.9,
      reviewsCount: 84,
      featured: true,
      bestSeller: true,
      trending: true,
      status: 'published',
      howToUse: 'Wipe clean with a damp cloth or warm soapy water. Do not leave in intense direct sun inside parked cars.',
      shippingInfo: 'Shipped with COD nationwide. Free shipping on orders over Rs. 4,500.',
      returnPolicy: '7-day size exchange guarantee.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Onyx Black Sculpted Foam Slides',
      slug: 'onyx-black-sculpted-foam-slides',
      shortDescription: 'Triple black matte finish cloud slides with textured footbed and shock-absorbing midsole.',
      description: 'The iconic sculpt in stealth matte black. Combines architectural streetwear proportions with unmatched pillow-soft cushioning.',
      category: catSlides.insertedId,
      images: [
        'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop'
      ],
      variants: [
        {
          id: 'v1',
          name: 'Triple Black / EU 42',
          value: '#151515',
          image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop',
          sku: 'SLD-ONX-BLK-42',
          price: 5800,
          salePrice: 4900,
          stock: 45,
          active: true,
        }
      ],
      specifications: [
        { key: 'Material', value: 'Dual-Density EVA' },
        { key: 'Weight', value: '190g' }
      ],
      features: [
        'All-weather waterproof design',
        'Textured anti-sweat footbed'
      ],
      model3D: { enabled: false },
      price: 5800,
      salePrice: 4900,
      SKU: 'SLD-ONX-BLK-42',
      stock: 45,
      rating: 4.8,
      reviewsCount: 47,
      featured: false,
      bestSeller: true,
      trending: true,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];

  await db.collection('products').insertMany(products);
  console.log(`Successfully seeded ${products.length} fashion products.`);

  // 5. Seed Reviews
  console.log('Seeding Reviews...');
  const reviews = [
    {
      user: customerResult.insertedId,
      userName: 'Hamza Tariq',
      product: products[0]._id,
      rating: 5,
      title: 'Obsidian Chronograph is unbelievable in person',
      comment: 'The weight, the sapphire glass clarity, and the sweeping second hand feel like a 2-lakh watch. Delivered to DHA Lahore in 2 days with Cash on Delivery. Top notch!',
      status: 'approved',
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: customerResult.insertedId,
      userName: 'Daniyal Rehman',
      product: products[2]._id,
      rating: 5,
      title: 'Best Heavyweight Hoodie in Pakistan hands down',
      comment: '480 GSM is no joke. The hood stands up properly without flopping down, and the oversized drop shoulder cut is pure Yeezy / Balenciaga vibes. Ordered size L and it fits perfect.',
      status: 'approved',
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: customerResult.insertedId,
      userName: 'Zainab Qureshi',
      product: products[4]._id,
      rating: 5,
      title: 'The silk blend shirt feels so premium',
      comment: 'Gifted this resort shirt to my husband. The drape is so silky and luxurious, and the mother-of-pearl buttons are gorgeous. Incredible quality for this price.',
      status: 'approved',
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      user: customerResult.insertedId,
      userName: 'Ali Raza',
      product: products[6]._id,
      rating: 5,
      title: 'Literally walking on clouds',
      comment: 'The cloud slides are super comfortable! Wore them all weekend, zero blister, insane arch support. Everyone asked me where I bought them from.',
      status: 'approved',
      verifiedPurchase: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  await db.collection('reviews').insertMany(reviews);

  console.log('Database successfully re-seeded with fashion, watches, clothes, shirts, and slides!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
