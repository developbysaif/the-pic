'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Eye,
  Sliders,
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

// Default signature Clothes items.
// Easily update or replace these with your own brand images!
export const DEFAULT_CLOTHES_SLIDES = [
  {
    id: 'hoodie-noir',
    title: 'Noir Velour Heavyweight Hoodie',
    tag: '480 GSM French Terry',
    category: 'Clothes',
    price: 12500,
    originalPrice: 14900,
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    slug: 'noir-velour-heavyweight-oversized-hoodie',
  },
  {
    id: 'trench-wool',
    title: 'Structured Double-Breasted Wool Trench',
    tag: 'Italian Virgin Wool',
    category: 'Outerwear',
    price: 24000,
    originalPrice: 28000,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    slug: 'structured-double-breasted-wool-trench',
  },
  {
    id: 'jacket-oversized',
    title: 'Tokyo Minimalist Bomber Jacket',
    tag: 'Custom Matte Shell',
    category: 'Jackets',
    price: 18500,
    originalPrice: 21000,
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    slug: 'noir-velour-heavyweight-oversized-hoodie',
  },
  {
    id: 'knit-terry',
    title: 'Milano Sculpted Relaxed Knit',
    tag: 'Long-Staple Combed Cotton',
    category: 'Knitwear',
    price: 11900,
    originalPrice: 13500,
    image:
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1200&auto=format&fit=crop',
    slug: 'noir-velour-heavyweight-oversized-hoodie',
  },
  {
    id: 'cargo-trousers',
    title: 'Architectural Pleated Trouser',
    tag: 'Tailored Wide Silhouette',
    category: 'Bottoms',
    price: 13900,
    originalPrice: 16000,
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    slug: 'noir-velour-heavyweight-oversized-hoodie',
  },
];

export default function AnimatedCardGallerySlider({
  categoryName = 'Clothes',
  categoryDescription = 'Heavyweight hoodies, tailored outerwear, luxury streetwear, and oversized silhouettes.',
  products = [],
}) {
  // If products are passed from DB for clothes, map them into slide format; otherwise use DEFAULT_CLOTHES_SLIDES
  const slides =
    products.length >= 3
      ? products.map((p, idx) => ({
          id: p._id || `prod-${idx}`,
          title: p.name,
          tag: p.variants?.[0]?.name || 'Luxury Archive',
          category: categoryName,
          price: p.salePrice || p.price,
          originalPrice: p.salePrice && p.salePrice < p.price ? p.price : null,
          image:
            p.images?.[0] ||
            DEFAULT_CLOTHES_SLIDES[idx % DEFAULT_CLOTHES_SLIDES.length].image,
          slug: p.slug,
        }))
      : DEFAULT_CLOTHES_SLIDES;

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const containerRef = useRef(null);
  const { openQuickView } = useModal();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 3-second Auto-slider loop: automatically advances cards continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(timer);
  }, [total]);

  // Mouse wheel scroll handler (scroll to switch prominent card)
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 30) {
      if (e.deltaX > 20 || e.deltaY > 30) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0)
      return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  const activeCard = slides[activeIndex];

  const handleQuickAdd = (slide, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (addItem) {
        addItem({
          productId: slide.id,
          variantId: `${slide.id}-std`,
          name: slide.title,
          price: slide.price,
          image: slide.image,
          quantity: 1,
          slug: slide.slug,
        });
      }
      if (showToast) {
        showToast(`${slide.title} added to bag!`, 'success');
      }
    } catch (_) {}
  };

  return (
    <section className="relative w-full bg-gradient-to-b from-sage-dark via-[#1e2a1b] to-sage-dark text-sage-ivory py-10 sm:py-14 border-b border-sage-soft/30 shadow-2xl select-none overflow-hidden">
      {/* Background ambient luxury glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-sage-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Information */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center space-x-2 text-sage-bg text-xs font-semibold uppercase tracking-widest px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-sage-primary animate-pulse" />
          <span>Curated {categoryName} Gallery</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tight">
          {categoryName} Archive Drops
        </h1>

        <p className="text-xs sm:text-sm text-sage-soft mt-2 max-w-xl mx-auto font-light leading-relaxed">
          {categoryDescription}
        </p>

        <p className="text-[10px] tracking-widest uppercase text-sage-muted mt-2 font-mono">
          Scroll or swipe cards to inspect • Active card becomes prominent
        </p>
      </div>

      {/* 3D Animated Slider Gallery Container (like @codewith_muhilan) */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[320px] sm:h-[390px] md:h-[430px] flex items-center justify-center overflow-hidden"
        style={{ perspective: 1200 }}
      >
        <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
          {slides.map((slide, idx) => {
            // Calculate distance offset relative to active card
            let offset = idx - activeIndex;

            // Handle wrap-around so cards flow smoothly in infinite circle
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2; // Show active + 2 on left + 2 on right

            if (!isVisible) return null;

            // Compute 3D Card Transform values:
            // Center: translateX 0, scale 1.15, rotateY 0, translateZ 120, zIndex 30
            // Side 1: translateX +/- 150px, scale 0.90, rotateY -/+ 24deg, zIndex 20
            // Side 2: translateX +/- 270px, scale 0.78, rotateY -/+ 36deg, zIndex 10
            const translateX = offset * (typeof window !== 'undefined' && window.innerWidth < 640 ? 85 : 160);
            const rotateY = -offset * 24; // 3D tilt inwards
            const scale = isCenter ? 1.12 : Math.max(0.72, 1 - Math.abs(offset) * 0.16);
            const zIndex = 30 - Math.abs(offset) * 10;
            const opacity = isCenter ? 1 : Math.max(0.4, 0.9 - Math.abs(offset) * 0.28);
            const translateZ = isCenter ? 120 : -Math.abs(offset) * 90;

            return (
              <motion.div
                key={slide.id}
                onClick={() => setActiveIndex(idx)}
                initial={false}
                animate={{
                  x: translateX,
                  rotateY: rotateY,
                  scale: scale,
                  z: translateZ,
                  opacity: opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 24,
                  mass: 0.8,
                }}
                className={`absolute w-52 sm:w-64 md:w-72 h-72 sm:h-88 md:h-96 rounded-3xl overflow-hidden cursor-pointer select-none transition-shadow duration-300 ${
                  isCenter
                    ? 'ring-2 ring-sage-primary shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-default'
                    : 'hover:brightness-110 shadow-xl'
                }`}
                style={{
                  zIndex: zIndex,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Product Image inside Card */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700"
                />

                {/* Card Gradient Overlays */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
                    isCenter ? 'opacity-90' : 'opacity-70'
                  }`}
                />

                {/* Top Badge on Card */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-white/90">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 font-bold text-sage-bg">
                    0{idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sage-primary/80 backdrop-blur-md uppercase tracking-wider text-[9px] font-semibold text-white">
                    {slide.tag}
                  </span>
                </div>

                {/* Card Bottom Content (Title, Price & Action) */}
                <div className="absolute bottom-3.5 inset-x-3.5 text-left text-white">
                  <h3
                    className={`font-serif font-bold uppercase leading-tight line-clamp-1 transition-colors ${
                      isCenter
                        ? 'text-sm sm:text-base text-white'
                        : 'text-xs text-sage-ivory/90'
                    }`}
                  >
                    {slide.title}
                  </h3>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline space-x-1.5">
                      <span className="font-serif font-bold text-xs sm:text-sm text-sage-bg">
                        PKR {slide.price.toLocaleString()}
                      </span>
                      {slide.originalPrice && (
                        <span className="text-[10px] font-mono text-sage-muted line-through">
                          PKR {slide.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-emerald-300 font-medium">
                      COD Ready
                    </span>
                  </div>

                  {/* Actions visible when Card is Centered & Prominent */}
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2.5 pt-2 border-t border-white/20 flex items-center space-x-2"
                    >
                      <Link
                        href={`/product/${slide.slug}`}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-sage-primary hover:bg-sage-accent text-white text-[11px] font-semibold uppercase tracking-wider text-center flex items-center justify-center space-x-1 shadow-sm transition-colors"
                      >
                        <span>Shop Drop</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={(e) => handleQuickAdd(slide, e)}
                        className="p-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-sage-dark backdrop-blur-md transition-colors"
                        title="Quick Add to Bag"
                        aria-label="Quick Add"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Subtle Glow Ring on Prominent Center Card */}
                {isCenter && (
                  <div className="absolute inset-0 rounded-3xl border border-sage-primary/60 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls: Navigation Arrows + Micro Dots */}
      <div className="relative z-10 flex items-center justify-between max-w-sm mx-auto mt-4 pt-3 border-t border-white/15">
        {/* Prev Button */}
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Dots Indicator */}
        <div className="flex items-center space-x-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-7 bg-sage-primary'
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-sage-primary hover:bg-sage-accent text-white backdrop-blur-md shadow-md transition-all hover:scale-105 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
