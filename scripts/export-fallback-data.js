const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function exportFallback() {
  await mongoose.connect('mongodb://127.0.0.1:27017/sage_store');
  const cats = await mongoose.connection.collection('categories').find({ isActive: true }).toArray();
  const prods = await mongoose.connection.collection('products').find({ status: 'published' }).toArray();

  // Format categories
  const cleanCats = cats.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description:
      c.description ||
      (c.slug === 'clothes'
        ? 'Luxury Pakistani 3-Piece Embroidered Festive Lawn Collection'
        : 'Precision Swiss-Inspired Luxury Horology'),
    image:
      c.image ||
      (c.slug === 'clothes'
        ? '/images/clothes/hero_clothes_magenta.jpg'
        : '/images/watches/watch_obsidian_cutout.png'),
    isActive: true,
    displayOrder: c.displayOrder || 1,
  }));

  const catMap = {};
  cleanCats.forEach((c) => {
    catMap[c._id] = c;
  });

  // Format products
  const cleanProds = prods.map((p) => {
    const matchedCat = catMap[p.category?.toString()] || cleanCats[0];
    return {
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription || p.name,
      description: p.description || p.name,
      category: {
        _id: matchedCat._id,
        name: matchedCat.name,
        slug: matchedCat.slug,
      },
      images: p.images || [],
      variants: p.variants || [],
      specifications: p.specifications || [],
      features: p.features || [],
      price: p.price,
      salePrice: p.salePrice || p.price,
      SKU: p.SKU || p.slug,
      stock: p.stock || 50,
      rating: p.rating || 4.9,
      reviewsCount: p.reviewsCount || 40,
      featured: Boolean(p.featured),
      bestSeller: Boolean(p.bestSeller),
      trending: Boolean(p.trending),
      status: 'published',
      howToUse: p.howToUse || 'Hand wash or dry clean recommended.',
      shippingInfo: p.shippingInfo || 'Free Cash on Delivery across Pakistan.',
      returnPolicy: p.returnPolicy || '7-day hassle-free exchange.',
    };
  });

  const fileContent = `// Auto-generated resilient fallback data for serverless & live deployments
export const FALLBACK_CATEGORIES = ${JSON.stringify(cleanCats, null, 2)};

export const FALLBACK_PRODUCTS = ${JSON.stringify(cleanProds, null, 2)};

export function getFallbackCategoryBySlug(slug) {
  return FALLBACK_CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getFallbackProductBySlug(slug) {
  return FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getFallbackProductsByCategory(slug) {
  const cat = getFallbackCategoryBySlug(slug);
  if (!cat) return [];
  return FALLBACK_PRODUCTS.filter((p) => p.category?.slug === slug || p.category?._id === cat._id);
}
`;

  fs.writeFileSync(path.join(__dirname, '../src/lib/fallback-data.js'), fileContent);
  console.log('Successfully wrote src/lib/fallback-data.js with', cleanCats.length, 'categories and', cleanProds.length, 'products');
  process.exit(0);
}

exportFallback();
