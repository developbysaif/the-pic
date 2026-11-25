import React from 'react';
import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { ProductCard3D } from '@/components/products/ProductCard3D';
import Link from 'next/link';
import { Sparkles, Search, X } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function ShopPage({ searchParams }) {
    await connectDB();
    const params = await searchParams;
    const currentCategorySlug = params.category || 'all';
    const currentSearch = params.search || '';
    const currentSort = params.sort || 'newest';
    const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
    const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
    // Categories from MongoDB
    const categoriesDocs = await Category.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean();
    const categories = JSON.parse(JSON.stringify(categoriesDocs));
    // Build filter query
        const filter = { status: 'published' };
    if (currentCategorySlug && currentCategorySlug !== 'all') {
        const matchedCategory = categories.find((c) => c.slug === currentCategorySlug);
        if (matchedCategory) {
            filter.category = matchedCategory._id;
        }
    }
    if (currentSearch) {
        filter.$or = [
            { name: { $regex: currentSearch, $options: 'i' } },
            { description: { $regex: currentSearch, $options: 'i' } },
            { shortDescription: { $regex: currentSearch, $options: 'i' } },
        ];
    }
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice)
            filter.price.$gte = minPrice;
        if (maxPrice)
            filter.price.$lte = maxPrice;
    }
    // Sort query
        let sortQuery = { createdAt: -1 };
    if (currentSort === 'price-asc')
        sortQuery = { price: 1 };
    if (currentSort === 'price-desc')
        sortQuery = { price: -1 };
    if (currentSort === 'popularity')
        sortQuery = { rating: -1, reviewsCount: -1 };
    const productsDocs = await Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortQuery)
        .lean();
    const products = JSON.parse(JSON.stringify(productsDocs));
    return (<div className="bg-sage-ivory min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>The Complete Collection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal">
            Botanical Apothecary Catalog
          </h1>
          <p className="text-xs sm:text-sm text-sage-muted mt-2 font-light leading-relaxed">
            All formulations are cold-pressed in small batches and eligible for Cash on Delivery across Pakistan.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 mb-10 border border-sage-soft/40 shadow-soft">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search form */}
            <form method="GET" action="/shop" className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
              <input type="text" name="search" defaultValue={currentSearch} placeholder="Search formulas, ingredients, notes..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark placeholder-sage-muted"/>
              {currentCategorySlug !== 'all' && (<input type="hidden" name="category" value={currentCategorySlug}/>)}
              {currentSort !== 'newest' && (<input type="hidden" name="sort" value={currentSort}/>)}
            </form>

            {/* Sort & Quick Select */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-sage-muted">Sort by:</span>
              <div className="flex items-center space-x-2">
                {[
            { label: 'Newest', value: 'newest' },
            { label: 'Popularity', value: 'popularity' },
            { label: 'Price: Low to High', value: 'price-asc' },
            { label: 'Price: High to Low', value: 'price-desc' },
        ].map((s) => (<Link key={s.value} href={`/shop?category=${currentCategorySlug}&sort=${s.value}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${currentSort === s.value
                ? 'bg-sage-dark text-white shadow-sm'
                : 'bg-white/80 text-sage-dark hover:bg-sage-soft/40'}`}>
                    {s.label}
                  </Link>))}
              </div>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="mt-5 pt-4 border-t border-sage-soft/30 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <Link href={`/shop?sort=${currentSort}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`} className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${currentCategorySlug === 'all'
            ? 'bg-sage-primary text-white shadow-soft-sm'
            : 'bg-white/70 text-sage-dark hover:bg-white'}`}>
              All Formulations
            </Link>

            {categories.map((c) => (<Link key={c._id} href={`/shop?category=${c.slug}&sort=${currentSort}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`} className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${currentCategorySlug === c.slug
                ? 'bg-sage-primary text-white shadow-soft-sm'
                : 'bg-white/70 text-sage-dark hover:bg-white'}`}>
                {c.name}
              </Link>))}
          </div>

          {/* Active Filter Tags */}
          {(currentCategorySlug !== 'all' || currentSearch) && (<div className="mt-3 flex items-center space-x-2 text-xs">
              <span className="text-sage-muted">Filtering:</span>
              {currentCategorySlug !== 'all' && (<span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sage-soft/30 text-sage-dark text-[11px] font-medium">
                  <span>Category: {currentCategorySlug}</span>
                  <Link href={`/shop?sort=${currentSort}`}>
                    <X className="w-3 h-3 hover:text-red-500"/>
                  </Link>
                </span>)}
              {currentSearch && (<span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-sage-soft/30 text-sage-dark text-[11px] font-medium">
                  <span>Search: &ldquo;{currentSearch}&rdquo;</span>
                  <Link href={`/shop?category=${currentCategorySlug}&sort=${currentSort}`}>
                    <X className="w-3 h-3 hover:text-red-500"/>
                  </Link>
                </span>)}
              <Link href="/shop" className="text-[11px] text-sage-primary underline font-medium ml-2">
                Reset All Filters
              </Link>
            </div>)}
        </div>

        {/* Product Count & Results */}
        <div className="mb-6 flex justify-between items-center text-xs text-sage-muted">
          <span>Showing {products.length} handcrafted products</span>
          <span className="text-emerald-700 font-medium">Cash on Delivery Available</span>
        </div>

        {/* Products 3D Grid */}
        {products.length === 0 ? (<div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-sage-soft/30 flex items-center justify-center text-sage-muted mx-auto mb-4">
              <Search className="w-8 h-8"/>
            </div>
            <h3 className="font-serif text-xl text-sage-dark">No formulations found</h3>
            <p className="text-xs text-sage-muted mt-2 leading-relaxed">
              We couldn&apos;t find any products matching your specific query. Try clearing your search or switching categories.
            </p>
            <Link href="/shop" className="mt-6 inline-block px-6 py-2.5 rounded-xl bg-sage-primary text-white text-xs font-semibold hover:bg-sage-accent transition-colors shadow-soft-sm">
              View All Products
            </Link>
          </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, idx) => (<ProductCard3D key={product._id} product={product} index={idx}/>))}
          </div>)}
      </div>
    </div>);
}
