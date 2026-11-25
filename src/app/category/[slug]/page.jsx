import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb/mongoose';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { ProductCard3D } from '@/components/products/ProductCard3D';
import AnimatedCardGallerySlider from '@/components/category/AnimatedCardGallerySlider';
import WatchTryOnHeader from '@/components/category/WatchTryOnHeader';
import DynamicLookbookHeader from '@/components/category/DynamicLookbookHeader';
import ShirtFittingRoomHeader from '@/components/category/ShirtFittingRoomHeader';
import { Sparkles, ArrowLeft, PackageOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;

  if (['shirts', 'slides'].includes(slug)) {
    return { title: 'Collection Not Found' };
  }

  const category = await Category.findOne({ slug, isActive: true }).lean();

  if (!category) {
    return { title: 'Collection Not Found' };
  }

  const title = `${category.name} | Botanical Collections`;
  const description =
    category.description ||
    `Explore handcrafted ${category.name} formulations made with organic botanicals. Available with Cash on Delivery across Pakistan.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category/${slug}`,
      type: 'website',
      images: [
        {
          url: category.image || '/images/products/serum-main.jpg',
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [category.image || '/images/products/serum-main.jpg'],
    },
  };
}

export default async function CategoryPage({ params }) {
  await connectDB();
  const { slug } = await params;

  if (['shirts', 'slides'].includes(slug)) {
    notFound();
  }

  const categoryDoc = await Category.findOne({ slug, isActive: true }).lean();
  if (!categoryDoc) {
    notFound();
  }

  const category = JSON.parse(JSON.stringify(categoryDoc));

  const productsDocs = await Product.find({
    category: category._id,
    status: 'published',
  })
    .sort({ createdAt: -1 })
    .lean();

  const products = JSON.parse(JSON.stringify(productsDocs));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections',
        item: `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${siteUrl}/category/${category.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="bg-sage-ivory min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-sage-primary hover:text-sage-dark mb-6 group min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Collections</span>
          </Link>

          {/* Category Headers: Watches has wrist try-on atelier; Clothes has dynamic runway lookbook */}
          {category.slug === 'watches' ? (
            <WatchTryOnHeader
              products={products}
              categoryName={category.name}
            />
          ) : category.slug === 'clothes' ? (
            <DynamicLookbookHeader
              products={products}
              categoryName={category.name}
            />
          ) : (
            <AnimatedCardGallerySlider
              categoryName={category.name}
              categoryDescription={category.description}
              products={products}
            />
          )}

          {/* Section Heading before Product Grid */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-sage-soft/40">
            <div>
              <span className="text-xs uppercase font-semibold text-sage-primary tracking-widest block mb-1">
                Explore Full Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-sage-dark font-normal">
                All {category.name} ({products.length})
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs text-sage-dark/70 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="hidden sm:inline">100% Cash on Delivery Across Pakistan</span>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 sm:p-16 text-center max-w-md mx-auto my-12">
              <PackageOpen className="w-12 h-12 text-sage-muted mx-auto mb-3" />
              <h3 className="font-serif text-xl text-sage-dark">No products in this collection</h3>
              <p className="text-xs text-sage-muted mt-2">
                Our new seasonal batch is currently in production. Check back shortly.
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-block px-6 py-2.5 rounded-xl bg-sage-primary text-white text-xs font-semibold"
              >
                Explore Other Collections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {products.map((product, idx) => (
                <ProductCard3D key={product._id} product={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
