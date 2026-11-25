import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/lib/fallback-data';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Static routes (About page removed)
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category/clothes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category/watches`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    await connectDB();

    const [products, categories] = await Promise.all([
      Product.find({ status: 'published' }).select('slug updatedAt').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
    ]);

    const prodsList = products && products.length > 0 ? products : FALLBACK_PRODUCTS;
    const catsList = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

    const productRoutes = prodsList.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryRoutes = catsList.map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap from DB, using fallbacks:', error.message);
    const productRoutes = FALLBACK_PRODUCTS.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
    return [...staticRoutes, ...productRoutes];
  }
}
