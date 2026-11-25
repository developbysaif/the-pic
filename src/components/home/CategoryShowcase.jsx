'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, Watch, Shirt, Footprints, Layers } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  {
    name: 'Clothes',
    slug: 'clothes',
    tagline: 'Embroidered 3-Piece Lawn & Festive Suits',
    count: '12 Luxury Suits',
    image: '/images/clothes/Ladies_Suit_001.png',
    icon: Shirt,
  },
  {
    name: 'Watches',
    slug: 'watches',
    tagline: 'Swiss Chronographs & Titanium',
    count: 'Signature Chronographs',
    image: '/images/watches/watch_obsidian_cutout.png',
    icon: Watch,
  },
];

export const CategoryShowcase = ({ categories = [] }) => {
  const displayCategories = (categories.length > 0 ? categories : FALLBACK_CATEGORIES)
    .filter((cat) => !['shirts', 'slides'].includes(cat.slug));

  return (
    <section id="categories" className="py-20 sm:py-28 bg-sage-ivory text-sage-dark border-b border-sage-soft/30 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sage-soft/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sage-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm">
              <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
              <span>Signature Pillars</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-sage-dark">
              Curated Collections
            </h2>
            <p className="text-sage-dark/75 text-sm max-w-xl font-light">
              Explore our signature luxury disciplines: mastercrafted Swiss horology timepieces and handcrafted embroidered 3-piece festive lawn suits.
            </p>
          </div>

          <Link
            href="/shop"
            className="mt-6 md:mt-0 text-xs font-semibold uppercase tracking-widest text-sage-primary hover:text-sage-dark flex items-center space-x-2 group px-5 py-2.5 rounded-full border border-sage-soft/60 bg-white hover:bg-sage-soft/30 transition-all duration-300 shadow-soft-sm"
          >
            <span>Explore All 2026 Drops</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* 4 Category Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.slice(0, 4).map((cat, idx) => (
            <motion.div
              key={cat._id || cat.slug || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link
                href={`/category/${cat.slug}`}
                className="group relative block rounded-3xl overflow-hidden bg-sage-soft/20 border border-sage-soft/50 hover:border-sage-primary shadow-soft hover:shadow-float transition-all duration-500 h-[380px] sm:h-[420px]"
              >
                {/* Image */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={cat.image || FALLBACK_CATEGORIES[idx % 4].image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/85 via-sage-dark/35 to-transparent opacity-75 group-hover:opacity-65 transition-opacity" />
                </div>

                {/* Top Corner Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded-lg glass-panel text-[10px] font-mono font-bold text-sage-dark uppercase tracking-widest shadow-soft-sm">
                    DROP 0{idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-sage-dark group-hover:bg-sage-dark group-hover:text-sage-ivory transition-colors shadow-soft-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 z-10 text-left text-white">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-sage-soft font-semibold block mb-1">
                    {cat.tagline || cat.description || 'Exclusive Collection'}
                  </span>
                  <h3 className="font-serif text-2xl font-normal tracking-wide text-white uppercase group-hover:text-sage-bg transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-1 font-light">
                    {cat.description || 'Handcrafted luxury with authentic materials & precision.'}
                  </p>
                  <div className="mt-3 inline-flex items-center text-[11px] font-semibold text-sage-bg group-hover:underline transition-colors">
                    <span>Shop Collection →</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
