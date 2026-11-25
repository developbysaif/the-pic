'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';

export const InstagramGallery = () => {
  const posts = [
    {
      image: '/images/watches/watch_obsidian_cutout.png',
      tag: '@vogueatelier',
      title: 'Obsidian Chronograph in midnight light',
      category: 'Watches',
    },
    {
      image: '/images/clothes/header_suit_1.png',
      tag: '@vogueatelier',
      title: 'Gul-e-Noor Magenta Embroidered 3-Piece Lawn',
      category: 'Clothes',
    },
    {
      image: '/images/clothes/Ladies_Suit_014.png',
      tag: '@vogueatelier',
      title: 'Zeenat Mint Aqua Embroidered Lawn Ensemble',
      category: 'Clothes',
    },
    {
      image: '/images/clothes/Ladies_Suit_004.png',
      tag: '@vogueatelier',
      title: 'Banafsha Royal Violet Festive Lawn 3-Piece',
      category: 'Clothes',
    },
    {
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      tag: '@vogueatelier',
      title: 'Haute couture editorial styling',
      category: 'Editorial',
    },
  ];

  return (
    <section className="py-24 bg-sage-ivory text-sage-dark border-b border-sage-soft/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm mb-3">
          <Instagram className="w-3.5 h-3.5 text-sage-primary" />
          <span>The Atelier Archive</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal">
          @vogueatelier on Instagram
        </h2>
        <p className="text-xs sm:text-sm text-sage-muted mt-2 font-light">
          Tag #VogueAtelier to be featured in our seasonal lookbook.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts.map((post, idx) => (
          <a
            key={idx}
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square rounded-2xl overflow-hidden bg-sage-soft/30 shadow-soft hover:shadow-float transition-all block border border-sage-soft/40"
          >
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-sage-dark/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center text-white backdrop-blur-xs">
              <Instagram className="w-6 h-6 mb-2 text-sage-bg" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-sage-soft">
                {post.category}
              </span>
              <p className="text-xs text-white/90 line-clamp-2 mt-1 font-medium">
                {post.title}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramGallery;
