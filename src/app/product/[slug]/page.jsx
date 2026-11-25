import React from 'react';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductDetailView from '@/components/products/ProductDetailView';
import {
  FALLBACK_PRODUCTS,
  getFallbackProductBySlug,
} from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let product = null;

  try {
    await connectDB();
    product = await Product.findOne({ slug }).lean();
  } catch (err) {
    // fallback below
  }

  if (!product) {
    product = getFallbackProductBySlug(slug);
  }

  if (!product) {
    return { title: 'Product Not Found | Vogue Atelier' };
  }

  const title = `${product.name} | Vogue Atelier`;
  const description =
    product.shortDescription ||
    `Discover ${product.name}. Available with Cash on Delivery across Pakistan.`;
  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/images/clothes/hero_clothes_magenta.jpg';

  return {
    title,
    description,
    alternates: {
      canonical: `/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/product/${slug}`,
      type: 'website',
      images: [
        {
          url: image,
          width: 1000,
          height: 1000,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  let product = null;
  let relatedProducts = [];
  let initialReviews = [];

  try {
    await connectDB();
    const productDoc = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .lean();

    if (productDoc) {
      product = JSON.parse(JSON.stringify(productDoc));

      const relatedDocs = await Product.find({
        category: productDoc.category,
        _id: { $ne: productDoc._id },
        status: 'published',
      })
        .limit(4)
        .lean();
      relatedProducts = JSON.parse(JSON.stringify(relatedDocs || []));

      const reviewsDocs = await Review.find({
        productId: productDoc._id,
        status: 'approved',
      })
        .sort({ createdAt: -1 })
        .lean();
      initialReviews = JSON.parse(JSON.stringify(reviewsDocs || []));
    }
  } catch (err) {
    console.error('ProductPage DB fetch error, using fallback:', err.message);
  }

  // Resilient fallback for live / serverless environments
  if (!product) {
    product = getFallbackProductBySlug(slug);
  }

  if (!product) {
    notFound();
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    relatedProducts = FALLBACK_PRODUCTS.filter(
      (p) => p.slug !== product.slug && p.category?.slug === product.category?.slug
    ).slice(0, 4);
  }

  // Structured Data (JSON-LD)
  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.shortDescription || product.description,
    sku: product.SKU,
    brand: {
      '@type': 'Brand',
      name: 'VOGUE ATELIER',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${product.slug}`,
      priceCurrency: 'PKR',
      price: product.salePrice || product.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'VOGUE ATELIER',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5,
      reviewCount: Math.max(1, product.reviewsCount || 1),
    },
  };

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
        name: product.category?.name || 'Shop',
        item: product.category?.slug
          ? `${siteUrl}/category/${product.category.slug}`
          : `${siteUrl}/shop`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${siteUrl}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        initialReviews={initialReviews}
      />
    </>
  );
}
