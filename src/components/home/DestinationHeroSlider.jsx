'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Clock,
  Shirt,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

// ── 4 Signature Luxury Drops: 1 Watch + 3 Real Ladies Festive Lawn Suits ────────
export const SLIDER_DATA = [
  {
    id: 'watches',
    category: 'Watches',
    indexLabel: '01',
    badge: 'SWISS HOROLOGY ARCHIVE',
    title: 'Royal Obsidian Chronograph X',
    subtitle: 'Dual-Time Automatic Movement & Grade-5 Titanium',
    description:
      'Mastercrafted with a deep sunburst dial, double-domed anti-reflective sapphire crystal, and high-frequency automatic calibre. Engineered for uncompromising elegance and 100M water resistance.',
    price: 48500,
    salePrice: 42900,
    image: '/images/watches/hero_watch_obsidian.jpg',
    thumbnail: '/images/watches/watch_obsidian_cutout.png',
    link: '/category/watches',
    productSlug: 'royal-obsidian-chronograph-x',
    icon: Clock,
    specs: ['Grade-5 Titanium', 'Sapphire Crystal', 'Automatic Calibre', '100M Water Resistant'],
    tag: 'Limited Edition • 100 Pcs',
  },
  {
    id: 'clothes-fuchsia',
    category: 'Clothes',
    indexLabel: '02',
    badge: 'FESTIVE LAWN ‘26 ARCHIVE',
    title: 'Gul-e-Noor Magenta Embroidered 3-Piece Suit',
    subtitle: 'Pure Combed Lawn, Chiffon Dupatta & Dyed Cambric Trouser',
    description:
      'Exquisite fuchsia magenta pure lawn canvas adorned with all-over botanical resham threadwork, finished with a vibrant digital printed chiffon dupatta and solid dyed cambric trousers.',
    price: 4500,
    salePrice: 4200,
    image: '/images/clothes/hero_clothes_magenta.jpg',
    thumbnail: '/images/clothes/Ladies_Suit_001.png',
    link: '/category/clothes',
    productSlug: 'gul-e-noor-magenta-embroidered-3-piece-lawn-suit',
    icon: Shirt,
    specs: ['100% Pure Lawn', 'Resham Embroidery (3m)', 'Chiffon Dupatta (2.5m)', 'Cambric Trouser (2.5m)'],
    tag: 'Special Sale • Save PKR 300',
  },
  {
    id: 'clothes-mint',
    category: 'Clothes',
    indexLabel: '03',
    badge: 'SUMMER FESTIVE LAWN',
    title: 'Zeenat Mint Aqua Embroidered 3-Piece Suit',
    subtitle: 'Pastel Lilac Threadwork & Printed Voile Dupatta',
    description:
      'Refreshing seafoam mint aqua lawn shirt decorated with delicate lilac floral creepers and geometric lace daman loops, paired with a featherlight printed voile dupatta and solid trousers.',
    price: 4500,
    salePrice: 4200,
    image: '/images/clothes/hero_clothes_mint.jpg',
    thumbnail: '/images/clothes/Ladies_Suit_014.png',
    link: '/category/clothes',
    productSlug: 'zeenat-mint-aqua-embroidered-3-piece-lawn-suit',
    icon: Shirt,
    specs: ['Pure Lawn Canvas', 'Lilac Threadwork', 'Voile Dupatta (2.5m)', 'Dyed Cambric Trouser'],
    tag: 'Special Sale • Save PKR 300',
  },
  {
    id: 'clothes-violet',
    category: 'Clothes',
    indexLabel: '04',
    badge: 'ROYAL FESTIVE LAWN',
    title: 'Banafsha Royal Violet 3-Piece Lawn Suit',
    subtitle: 'Chevron Dupatta & Rich Resham Multi-Booti Work',
    description:
      'Regal deep violet lawn with intricate multi-color booti motifs, finished with a showstopping chevron border printed drape dupatta and dyed matching cambric trousers.',
    price: 4500,
    salePrice: 4200,
    image: '/images/clothes/hero_clothes_violet.jpg',
    thumbnail: '/images/clothes/Ladies_Suit_004.png',
    link: '/category/clothes',
    productSlug: 'banafsha-royal-violet-3-piece-lawn-suit',
    icon: Shirt,
    specs: ['Deep Violet Lawn', 'Multi-Resham Booti', 'Chevron Dupatta', 'Dyed Cambric Trouser'],
    tag: 'Special Sale • Save PKR 300',
  },
];

const TIMER_DURATION_MS = 6000; // Relaxed, luxury 6-second pacing

export default function DestinationHeroSlider({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const { addItem } = useCart();
  const { showToast } = useToast();

  const slides = SLIDER_DATA;
  const currentSlide = slides[currentIndex];
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (targetIndex) => {
    if (targetIndex === currentIndex) return;
    setDirection(targetIndex > currentIndex ? 1 : -1);
    setCurrentIndex(targetIndex);
    setProgress(0);
  };

  // 6-second Auto-timer loop with pause on hover
  useEffect(() => {
    if (isHovered) return;

    const intervalStep = 50; // update progress every 50ms
    const stepIncrement = (intervalStep / TIMER_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  // Remaining slides for the preview cards on bottom-right (excluding current)
  const remainingSlides = slides
    .map((slide, idx) => ({ ...slide, originalIndex: idx }))
    .filter((_, idx) => idx !== currentIndex);

  const handleQuickAdd = (slide, e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    try {
      if (addItem) {
        addItem({
          productId: slide.id,
          variantId: `${slide.id}-std`,
          name: slide.title,
          price: slide.salePrice || slide.price,
          image: slide.thumbnail || slide.image,
          quantity: 1,
          variant: { name: 'Standard Edition', sku: `${slide.id.toUpperCase()}-STD` },
        });
      }
      if (showToast) {
        showToast(`${slide.title} added to bag for PKR ${(slide.salePrice || slide.price).toLocaleString()}!`, 'success');
      }
    } catch (err) {
      if (showToast) {
        showToast('Could not add to bag. Please try again.', 'error');
      }
    }
  };

  return (
    <section
      className="relative w-full h-[580px] sm:h-[640px] lg:h-[calc(100vh-100px)] lg:max-h-[720px] bg-[#111712] text-white overflow-hidden select-none border-b border-sage-soft/30"
      aria-label="Modern Luxury Collection Slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. Full-Bleed Luxury Atelier Campaign Banner with Smooth Crossfade ── */}
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={currentSlide.id}
          custom={direction}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover object-center"
          />

          {/* Luxury Editorial Vignette & Gradient Overlays:
              Deep dark on the left so typography and CTAs stand out sharply,
              subtle and clear on the center-right so the model, skylight and suit are 100% visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
        </motion.div>
      </AnimatePresence>

      {/* ── 2. Stage Content: Left Editorial Details + Right Preview Cards ── */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-5 sm:pt-6 pb-3 sm:pb-4">
        {/* Top Status Bar / Slide Index Indicator */}
        <div className="flex items-center justify-between text-xs tracking-widest uppercase">
          <div className="flex items-center space-x-3 text-sage-ivory/80">
            <span className="text-sage-bg font-mono font-bold text-sm">
              {currentSlide.indexLabel}
            </span>
            <span className="w-8 h-[1px] bg-sage-soft/40" />
            <span className="font-mono text-sage-soft/70">0{totalSlides}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sage-soft/20 text-[10px] text-sage-bg font-semibold border border-sage-soft/30 backdrop-blur-sm">
              {currentSlide.category}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px] tracking-[0.25em] text-sage-soft/70 font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>2026 ARCHIVE • COD VERIFIED</span>
          </div>
        </div>

        {/* ── Middle Stage: Left Typography & CTAs + Right Preview Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end my-auto py-2">
          {/* LEFT: Text on Every Image (lg:col-span-7 xl:col-span-6) */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-2.5 text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5"
              >
                {/* Category Badge & Tag */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sage-primary/25 border border-sage-primary/50 text-sage-bg text-[10px] font-semibold tracking-wider uppercase backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-sage-bg" />
                    <span>{currentSlide.badge}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-sage-ivory text-[10px] font-medium tracking-wide border border-white/15 backdrop-blur-sm">
                    {currentSlide.tag}
                  </span>
                </div>

                {/* Main Large Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] xl:text-[2.6rem] font-serif font-normal tracking-tight text-white uppercase leading-[1.08] drop-shadow-md">
                  {currentSlide.title}
                </h1>

                {/* Subtitle / Subheading */}
                <p className="text-xs sm:text-[13px] text-sage-soft font-medium tracking-wide drop-shadow-xs">
                  {currentSlide.subtitle}
                </p>

                {/* Detailed Description */}
                <p className="text-[11px] sm:text-xs text-sage-ivory/85 leading-relaxed max-w-xl font-light line-clamp-2 drop-shadow-xs">
                  {currentSlide.description}
                </p>

                {/* Key Spec Chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentSlide.specs.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/15 text-[10px] text-sage-soft font-medium flex items-center space-x-1"
                    >
                      <span className="w-1 h-1 rounded-full bg-sage-primary" />
                      <span>{spec}</span>
                    </span>
                  ))}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline space-x-2.5 pt-1">
                  <span className="text-xl sm:text-2xl font-serif font-bold text-white drop-shadow-sm">
                    PKR {currentSlide.salePrice.toLocaleString()}
                  </span>
                  {currentSlide.price > currentSlide.salePrice && (
                    <span className="text-xs sm:text-sm font-mono text-white/60 line-through">
                      PKR {currentSlide.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-300 font-medium px-2 py-0.5 rounded bg-emerald-900/50 border border-emerald-500/30 backdrop-blur-xs">
                    Free Cash On Delivery
                  </span>
                </div>

                {/* Action CTAs in Sage & Ivory */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  <Link
                    href={`/product/${currentSlide.productSlug}`}
                    className="px-5 py-2.5 rounded-xl bg-sage-primary hover:bg-sage-accent text-sage-ivory font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-102 flex items-center space-x-1.5 shadow-float"
                  >
                    <span>Shop This Drop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={(e) => handleQuickAdd(currentSlide, e)}
                    className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white hover:text-sage-dark text-white font-semibold text-xs tracking-wide transition-all duration-300 border border-white/25 shadow-soft-sm backdrop-blur-md flex items-center space-x-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-sage-primary" />
                    <span>Quick Add</span>
                  </button>

                  <Link
                    href={currentSlide.link}
                    className="px-2 py-2 text-[11px] text-sage-soft hover:text-white transition-colors flex items-center space-x-1 underline decoration-sage-soft/40 underline-offset-4"
                  >
                    <span>Explore All {currentSlide.category}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: Floating Preview Cards (lg:col-span-5 xl:col-span-6) */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col items-start lg:items-end justify-end mt-2 lg:mt-0">
            <div className="flex items-center justify-between w-full max-w-sm mb-2 px-1 text-[10px] tracking-widest uppercase text-sage-soft/80">
              <span className="font-semibold text-sage-bg">Upcoming Drops</span>
              <span className="text-[9px] text-sage-soft/60">0{currentIndex + 1} / 0{totalSlides}</span>
            </div>

            {/* Preview Cards in horizontal line */}
            <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto w-full max-w-sm pb-1 scrollbar-none">
              {remainingSlides.map((slide) => (
                <motion.div
                  key={`${slide.id}-${slide.originalIndex}`}
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => goToSlide(slide.originalIndex)}
                  className="relative group flex-shrink-0 w-26 sm:w-28 h-38 sm:h-44 rounded-2xl overflow-hidden cursor-pointer border border-white/20 hover:border-sage-primary shadow-float transition-all duration-300 bg-black/40 backdrop-blur-md"
                >
                  <img
                    src={slide.thumbnail || slide.image}
                    alt={slide.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-mono text-sage-ivory">
                    <span className="px-1 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 font-bold text-sage-bg">
                      {slide.indexLabel}
                    </span>
                    <span className="text-[7px] uppercase tracking-wider text-sage-soft bg-black/50 px-1 py-0.5 rounded">
                      {slide.category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <h3 className="text-[10px] font-serif font-bold text-white line-clamp-1 uppercase leading-tight group-hover:text-sage-bg transition-colors">
                      {slide.title}
                    </h3>
                    <p className="text-[9px] font-mono text-emerald-400 font-semibold mt-0.5">
                      PKR {slide.salePrice.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrows & Slide Indicators */}
            <div className="flex items-center justify-between w-full max-w-sm mt-2 pt-2 border-t border-white/15">
              <div className="flex items-center space-x-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'w-6 bg-sage-primary' : 'w-1.5 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={prevSlide}
                  className="p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1.5 sm:p-2 rounded-full bg-sage-primary hover:bg-sage-accent text-white transition-all font-bold hover:scale-105 active:scale-95 shadow-soft"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Trust Strip ── */}
        <div className="pt-2 mt-1 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-[11px] text-sage-ivory/80">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium truncate">100% Cash on Delivery</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-bg shrink-0" />
            <span className="font-medium truncate">Authentic Luxury Guarantee</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-primary shrink-0" />
            <span className="font-medium truncate">Special Sale • PKR 4,200</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium truncate">7-Day Easy Size Exchange</span>
          </div>
        </div>
      </div>

      {/* ── Bottom 6-Second Progress Line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          className="h-full bg-gradient-to-r from-sage-primary via-sage-soft to-sage-accent transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(120,149,117,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}
