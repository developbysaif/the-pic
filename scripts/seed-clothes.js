const mongoose = require('mongoose');

const suitCatalog = [
  {
    code: '001',
    name: 'Gul-e-Noor Magenta Embroidered 3-Piece Lawn Suit',
    slug: 'gul-e-noor-magenta-embroidered-3-piece-lawn-suit',
    color: 'Magenta Fuchsia',
    image: '/images/clothes/Ladies_Suit_001.png',
    hex: '#D11D6B',
    embroidery: 'Floral Booti & Neckline Embroidery',
    dupatta: 'Digital Printed Chiffon Dupatta (2.5m)'
  },
  {
    code: '014',
    name: 'Zeenat Mint Aqua Embroidered 3-Piece Lawn Suit',
    slug: 'zeenat-mint-aqua-embroidered-3-piece-lawn-suit',
    color: 'Mint Aqua',
    image: '/images/clothes/Ladies_Suit_014.png',
    hex: '#7DC8B5',
    embroidery: 'Pastel Lilac Floral Border Embroidery',
    dupatta: 'Lightweight Printed Voile Dupatta (2.5m)'
  },
  {
    code: '004',
    name: 'Banafsha Royal Violet 3-Piece Lawn Suit',
    slug: 'banafsha-royal-violet-3-piece-lawn-suit',
    color: 'Royal Violet',
    image: '/images/clothes/Ladies_Suit_004.png',
    hex: '#6B2D82',
    embroidery: 'Intricate Geometric & Floral Motif Embroidery',
    dupatta: 'Chevron Border Printed Chiffon Dupatta (2.5m)'
  },
  {
    code: '018',
    name: 'Amber Ochre Golden 3-Piece Lawn Suit',
    slug: 'amber-ochre-golden-3-piece-lawn-suit',
    color: 'Mustard Gold',
    image: '/images/clothes/Ladies_Suit_018.png',
    hex: '#DDAA33',
    embroidery: 'Fuchsia Contrast Neckline Embroidery',
    dupatta: 'Digital Printed Multi-Color Dupatta (2.5m)'
  },
  {
    code: '005',
    name: 'Neelam Midnight Blue 3-Piece Lawn Suit',
    slug: 'neelam-midnight-blue-3-piece-lawn-suit',
    color: 'Midnight Navy Blue',
    image: '/images/clothes/Ladies_Suit_005.png',
    hex: '#1E355B',
    embroidery: 'Blush Pink Floral Vines Embroidery',
    dupatta: 'Traditional Royal Printed Chiffon Dupatta (2.5m)'
  },
  {
    code: '006',
    name: 'Nargis Peach Blossom 3-Piece Lawn Suit',
    slug: 'nargis-peach-blossom-3-piece-lawn-suit',
    color: 'Peach Ochre',
    image: '/images/clothes/Ladies_Suit_006.png',
    hex: '#E59866',
    embroidery: 'Multi-Color Threadwork Embroidered Damann',
    dupatta: 'Classic Ethnic Printed Dupatta (2.5m)'
  },
  {
    code: '010',
    name: 'Mah-e-Rukh Coral Pink 3-Piece Lawn Suit',
    slug: 'mah-e-rukh-coral-pink-3-piece-lawn-suit',
    color: 'Coral Pink',
    image: '/images/clothes/Ladies_Suit_010.png',
    hex: '#E06B75',
    embroidery: 'Delicate Resham Threadwork Embroidery',
    dupatta: 'Printed Voile Dupatta with Laser Borders (2.5m)'
  },
  {
    code: '011',
    name: 'Firoza Celestial Teal 3-Piece Lawn Suit',
    slug: 'firoza-celestial-teal-3-piece-lawn-suit',
    color: 'Celestial Teal',
    image: '/images/clothes/Ladies_Suit_011.png',
    hex: '#2B7A78',
    embroidery: 'Golden Tilla & Resham Neckline Embroidery',
    dupatta: 'Digital Printed Silk-Chiffon Dupatta (2.5m)'
  },
  {
    code: '016',
    name: 'Kashish Lilac Whisper 3-Piece Lawn Suit',
    slug: 'kashish-lilac-whisper-3-piece-lawn-suit',
    color: 'Lilac Whisper',
    image: '/images/clothes/Ladies_Suit_016.png',
    hex: '#A388AC',
    embroidery: 'Fine Monochrome Botanical Embroidery',
    dupatta: 'Airy Chiffon Printed Dupatta (2.5m)'
  },
  {
    code: '024',
    name: 'Shehnaz Ruby Crimson 3-Piece Lawn Suit',
    slug: 'shehnaz-ruby-crimson-3-piece-lawn-suit',
    color: 'Ruby Crimson',
    image: '/images/clothes/Ladies_Suit_024.png',
    hex: '#962D3E',
    embroidery: 'Rich Festive Heavy Neckline Embroidery',
    dupatta: 'Printed Chiffon Dupatta with Pallu Border (2.5m)'
  },
  {
    code: '027',
    name: 'Dhanak Emerald Green 3-Piece Lawn Suit',
    slug: 'dhanak-emerald-green-3-piece-lawn-suit',
    color: 'Emerald Green',
    image: '/images/clothes/Ladies_Suit_027.png',
    hex: '#2E6F40',
    embroidery: 'Gold Zari Accent Botanical Embroidery',
    dupatta: 'Digital Printed Organza Chiffon Dupatta (2.5m)'
  },
  {
    code: '030',
    name: 'Sitara Olive Glamour 3-Piece Lawn Suit',
    slug: 'sitara-olive-glamour-3-piece-lawn-suit',
    color: 'Warm Olive',
    image: '/images/clothes/Ladies_Suit_030.png',
    hex: '#5E6B4A',
    embroidery: 'Subtle Contrast Threadwork Embroidery',
    dupatta: 'Ethnic Patterned Dupatta (2.5m)'
  }
];

async function seedClothes() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sage_store');
  const cat = await mongoose.connection.collection('categories').findOne({ slug: 'clothes' });
  if (!cat) {
    console.error('Clothes category not found');
    process.exit(1);
  }
  
  // Update category metadata
  await mongoose.connection.collection('categories').updateOne(
    { _id: cat._id },
    {
      $set: {
        description: 'Luxury 3-Piece Embroidered Lawn Collection with Chiffon Dupatta. Premium seasonal drop on sale for PKR 4,200.',
        image: '/images/clothes/Ladies_Suit_001.png',
        updatedAt: new Date()
      }
    }
  );
  
  // Remove old demo clothes
  await mongoose.connection.collection('products').deleteMany({ category: cat._id });
  
  // Insert new ladies suits with price 4500 cut to 4200
  const docs = suitCatalog.map((s, idx) => ({
    name: s.name,
    slug: s.slug,
    shortDescription: 'Luxury 3-Piece Embroidered & Printed Lawn Collection with Digital Printed Dupatta.',
    description: 'Elevate your seasonal wardrobe with the ' + s.name + '. Crafted from premium high-density 100% pure combed lawn fabric that delivers supreme breathability and an ultra-soft hand feel. Featuring ' + s.embroidery + ', matched with dyed solid cambric trousers (2.5m) and a breathtaking ' + s.dupatta + '. Specially discounted to PKR 4,200 for a limited time with free Cash on Delivery across Pakistan.',
    category: cat._id,
    images: [s.image],
    variants: [
      {
        id: 'unstitched',
        name: 'Unstitched 3-Piece Set',
        value: s.hex,
        image: s.image,
        sku: 'SUIT-' + s.code + '-UN',
        price: 4500,
        salePrice: 4200,
        stock: 40,
        active: true
      },
      {
        id: 'stitched-std',
        name: 'Stitched Standard (Custom Size)',
        value: s.hex,
        image: s.image,
        sku: 'SUIT-' + s.code + '-ST',
        price: 5200,
        salePrice: 4800,
        stock: 20,
        active: true
      }
    ],
    specifications: [
      { key: 'Fabric', value: '100% Pure High-Density Combed Lawn' },
      { key: 'Shirt', value: 'Embroidered Lawn Front (1.25m), Printed Back & Sleeves (1.75m)' },
      { key: 'Dupatta', value: s.dupatta },
      { key: 'Trouser', value: 'Dyed Premium Cambric Cotton Trouser (2.5m)' },
      { key: 'Care Instructions', value: 'Do not bleach. Iron at moderate temperature. Hand wash or gentle cycle.' }
    ],
    features: [
      'Intricate resham & tilla threadwork embroidery',
      'Featherlight, breathable pure lawn cotton weave',
      'Vibrant colorfast digital printing on soft drape dupatta',
      'Full 3-Piece unstitched fabric bundle ready to tailor',
      '100% Cash on Delivery Across Pakistan'
    ],
    model3D: { enabled: false },
    price: 4500,
    salePrice: 4200,
    SKU: 'LADIES-SUIT-' + s.code,
    stock: 60,
    rating: 4.9,
    reviewsCount: 38 + (idx * 5),
    featured: true,
    bestSeller: idx < 6,
    trending: true,
    status: 'published',
    shippingInfo: 'Dispatched via Express Courier within 24 hours. Free Cash on Delivery across Pakistan.',
    returnPolicy: '7-day hassle-free replacement or return guarantee.',
    createdAt: new Date(),
    updatedAt: new Date()
  }));
  
  const res = await mongoose.connection.collection('products').insertMany(docs);
  console.log('Successfully inserted', res.insertedCount, 'ladies suit products into clothes category!');
  await mongoose.disconnect();
}

seedClothes();
