'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard3D } from '@/components/products/ProductCard3D';

export const ProductGridSection = ({
  title,
  subtitle,
  badgeText = 'Drops',
  products = [],
  viewAllLink = '/shop',
  bgClass = 'bg-sage-ivory',
  showTabs = false,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  if (!products || products.length === 0) return null;

  const categories = ['all', 'clothes', 'watches'];

  const filteredProducts =
    showTabs && activeTab !== 'all'
      ? products.filter((p) => {
          const catSlug = p.category?.slug || p.category?.name?.toLowerCase() || '';
          return catSlug.includes(activeTab);
        })
      : products;

  return (
    <section className={`py-20 sm:py-28 border-b border-sage-soft/30 ${bgClass} text-sage-dark relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
              <span>{badgeText}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-sage-dark">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-sage-dark/75 mt-2 max-w-xl font-light">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {showTabs && (
              <div className="flex items-center space-x-1.5 p-1 rounded-2xl glass-panel shadow-soft-sm border border-sage-soft/60">
                {categories.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeTab === tab
                        ? 'bg-sage-dark text-sage-ivory shadow-sm'
                        : 'text-sage-dark/70 hover:text-sage-dark hover:bg-sage-soft/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {viewAllLink && (
              <Link
                href={viewAllLink}
                className="text-xs font-semibold text-sage-primary hover:text-sage-dark uppercase tracking-widest flex items-center space-x-1.5 group px-5 py-2.5 rounded-full border border-sage-soft/60 bg-white hover:bg-sage-soft/30 transition-all shadow-soft-sm"
              >
                <span>Full Archive</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product, idx) => (
            <ProductCard3D key={product._id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGridSection;
