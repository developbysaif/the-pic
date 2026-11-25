import mongoose from 'mongoose';
import { connectDB } from '../src/lib/mongodb/mongoose.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';

const SHIRTS_DATA = [
  {
    shirtIndex: 1,
    name: 'Milano Champagne Sand Tailored Shirt',
    slug: 'milano-champagne-sand-tailored-shirt',
    color: 'Champagne Sand',
    hex: '#E2D3B8',
    price: 8900,
    salePrice: 7500,
    sku: 'SHT-MIL-SND-01',
    description: 'Woven with refined 80s two-ply Egyptian long-staple cotton in a luxurious champagne sand hue. Features an Italian spread collar, genuine mother-of-pearl buttons, and tailored cuffs for a relaxed yet commanding silhouette.',
    shortDescription: 'Tailored Italian spread collar shirt in champagne sand Egyptian cotton.',
  },
  {
    shirtIndex: 2,
    name: 'Riviera Azure Sky Blue Oxford',
    slug: 'riviera-azure-sky-blue-oxford',
    color: 'Azure Sky Blue',
    hex: '#9BBDE6',
    price: 8400,
    salePrice: 7400,
    sku: 'SHT-RIV-BLU-02',
    description: 'The definitive smart casual essential. Crafted from breathable, mid-weight pinpoint Oxford cotton with crisp azure blue color saturation. Designed to drape cleanly whether worn tucked or untucked.',
    shortDescription: 'Breathable pinpoint Oxford cotton in Mediterranean azure blue.',
  },
  {
    shirtIndex: 3,
    name: 'Obsidian Noir Luxury Formal Shirt',
    slug: 'obsidian-noir-luxury-formal-shirt',
    color: 'Obsidian Noir',
    hex: '#1E1E22',
    price: 9200,
    salePrice: 8200,
    sku: 'SHT-OBS-BLK-03',
    description: 'Deep pitch-black saturation dyed with premium vat pigments to resist fading. Tailored from high-twist combed cotton twill with a silky sheen, structured collar stays, and tonal matte buttons.',
    shortDescription: 'High-twist combed cotton twill in deep pitch obsidian black.',
  },
  {
    shirtIndex: 4,
    name: 'Pale Sage Mint Pinpoint Cotton Shirt',
    slug: 'pale-sage-mint-pinpoint-cotton-shirt',
    color: 'Pale Sage Mint',
    hex: '#D7E5DE',
    price: 8600,
    salePrice: 7600,
    sku: 'SHT-SAG-MNT-04',
    description: 'An understated botanical pastel tone engineered for temperate climates. Offers natural thermal regulation and an ultra-soft hand feel with reinforced French side-seam stitching.',
    shortDescription: 'Understated botanical pastel mint cotton with French side-seam stitching.',
  },
  {
    shirtIndex: 5,
    name: 'Tuscan Rose Blush Twill Shirt',
    slug: 'tuscan-rose-blush-twill-shirt',
    color: 'Rose Blush',
    hex: '#DAB8C7',
    price: 8800,
    salePrice: 7800,
    sku: 'SHT-TUS-ROS-05',
    description: 'Subtle Tuscan rose blush tones in a rich diagonal micro-twill weave. Naturally wrinkle-resistant and crafted with a generous back yoke pleat for full mobility.',
    shortDescription: 'Diagonal micro-twill weave in a warm Tuscan rose blush hue.',
  },
  {
    shirtIndex: 6,
    name: 'Silver Mist Ash Grey Dress Shirt',
    slug: 'silver-mist-ash-grey-dress-shirt',
    color: 'Silver Mist Grey',
    hex: '#DDE2E4',
    price: 8400,
    salePrice: 7400,
    sku: 'SHT-SLV-GRY-06',
    description: 'A crisp modern architectural grey. Features an immaculate clean placket, removable collar bones, and two-button convertible cuffs suitable for cufflinks.',
    shortDescription: 'Architectural silver mist dress shirt with convertible cufflink cuffs.',
  },
  {
    shirtIndex: 7,
    name: 'Pure Alabaster Crisp White Royal Shirt',
    slug: 'pure-alabaster-crisp-white-royal-shirt',
    color: 'Pure White',
    hex: '#F9F8F6',
    price: 9500,
    salePrice: 8500,
    sku: 'SHT-WHT-ALB-07',
    description: 'The foundation of gentlemanly style. 100% Giza 87 Egyptian cotton woven into a luminous, pristine white royal Oxford fabric with hand-turned collar edges.',
    shortDescription: 'Luminous pure white royal Oxford in Giza 87 Egyptian cotton.',
  },
  {
    shirtIndex: 8,
    name: 'Midnight Deep Navy Business Shirt',
    slug: 'midnight-deep-navy-business-shirt',
    color: 'Midnight Navy',
    hex: '#1C2740',
    price: 8900,
    salePrice: 7900,
    sku: 'SHT-NVY-MID-08',
    description: 'Rich, saturated midnight navy that pairs effortlessly with tailored suits or beige trousers. Features mother-of-pearl buttons and a comfortable regular-tapered fit.',
    shortDescription: 'Deep midnight navy business shirt with regular-tapered fit.',
  },
  {
    shirtIndex: 9,
    name: 'Mediterranean Coastal Cerulean Shirt',
    slug: 'mediterranean-coastal-cerulean-shirt',
    color: 'Coastal Cerulean',
    hex: '#A8CCEC',
    price: 8600,
    salePrice: 7600,
    sku: 'SHT-CER-BLU-09',
    description: 'Vibrant coastal sky cerulean blue with a light chambray texture. Perfect for summer afternoons and effortless evening events.',
    shortDescription: 'Vibrant coastal cerulean blue with a light chambray texture.',
  },
];

async function seedShirts() {
  await connectDB();
  console.log('Connected to MongoDB.');

  let shirtCat = await Category.findOne({ slug: 'shirts' });
  if (!shirtCat) {
    shirtCat = await Category.create({
      name: 'Shirts',
      slug: 'shirts',
      description: 'Handcrafted Egyptian cotton, Italian silk blends, and tailored Oxford button-downs.',
      image: '/images/shirt/shirt1.jpeg',
      isActive: true,
      displayOrder: 3,
    });
    console.log('Created Shirts Category.');
  }

  // Remove existing products in shirts category
  await Product.deleteMany({ category: shirtCat._id });
  console.log('Cleared old shirt products.');

  for (const s of SHIRTS_DATA) {
    const shirtImg = `/images/shirt/shirt${s.shirtIndex}.jpeg`;
    const modelImg = `/images/model_shirt_${s.shirtIndex}.jpg`;

    const variants = ['S', 'M', 'L', 'XL', 'XXL'].map((sz, vIdx) => ({
      id: `${s.sku}-${sz}`,
      name: `${s.color} / Size ${sz}`,
      value: s.hex,
      image: shirtImg,
      sku: `${s.sku}-${sz}`,
      price: s.price,
      salePrice: s.salePrice,
      stock: 25 + vIdx * 5,
      active: true,
    }));

    await Product.create({
      name: s.name,
      slug: s.slug,
      description: s.description,
      shortDescription: s.shortDescription,
      category: shirtCat._id,
      images: [shirtImg, modelImg],
      variants,
      specifications: [
        { key: 'Fabric', value: '100% Extra-Long Staple Egyptian Cotton' },
        { key: 'Collar Style', value: 'Italian Semi-Spread Collar' },
        { key: 'Fit', value: 'Tailored Regular Fit' },
        { key: 'Buttons', value: 'Authentic Mother-of-Pearl' },
        { key: 'Care', value: 'Machine wash warm (40°C), hang dry, warm iron' },
      ],
      features: [
        'Natural breathability and silky drape',
        'Structured collar band with removable stays',
        'Reinforced split back yoke for freedom of motion',
        'Cash on Delivery available nationwide',
      ],
      model3D: { enabled: false },
      price: s.price,
      salePrice: s.salePrice,
      SKU: s.sku,
      stock: 120,
      rating: 4.9,
      reviewsCount: 30 + s.shirtIndex * 4,
      featured: s.shirtIndex <= 3,
      bestSeller: s.shirtIndex === 1 || s.shirtIndex === 7,
      trending: s.shirtIndex === 2 || s.shirtIndex === 8,
      status: 'published',
      howToUse: 'Pair with light chinos or tailored trousers. Machine wash cold, hang dry.',
      shippingInfo: 'Fast dispatch within 24 hours. Free Cash on Delivery across Pakistan.',
      returnPolicy: '7-day easy exchange & size guarantee.',
    });

    console.log(`Seeded shirt: ${s.name}`);
  }

  console.log('Finished seeding all 9 shirts!');
  process.exit(0);
}

seedShirts().catch(err => {
  console.error(err);
  process.exit(1);
});
