'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Check,
  Tag,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

// ── 5 Signature Ladies Suits for Header Runway (Cut from 4500 to 4200) ────────
export const LOOKBOOK_DATA = [
  {
    id: 'look-1',
    lookNumber: '01',
    pillText: 'Fuchsia Flora',
    title: 'Gul-e-Noor Magenta Embroidered 3-Piece Lawn Suit',
    category: 'Embroidered Lawn',
    tag: '100% Pure Lawn · Chiffon Dupatta · Dyed Trouser',
    price: 4200,
    originalPrice: 4500,
    productSlug: 'gul-e-noor-magenta-embroidered-3-piece-lawn-suit',
    modelImage: '/images/clothes/header_suit_1.png',
    fallbackModel: '/images/clothes/Ladies_Suit_001.png',
    garmentImage: '/images/clothes/Ladies_Suit_001.png',
    garmentTitle: 'Gul-e-Noor Magenta 3-Piece Suit',
    garmentPrice: 4200,
    accentColor: '#D11D6B',
    description:
      'Exquisite fuchsia magenta pure lawn canvas adorned with all-over botanical resham threadwork, finished with a vibrant digital printed chiffon dupatta and solid dyed cambric trousers.',
  },
  {
    id: 'look-2',
    lookNumber: '02',
    pillText: 'Mint Aqua',
    title: 'Zeenat Mint Aqua Embroidered 3-Piece Lawn Suit',
    category: 'Embroidered Lawn',
    tag: 'Pastel Lilac Threadwork · Voile Dupatta',
    price: 4200,
    originalPrice: 4500,
    productSlug: 'zeenat-mint-aqua-embroidered-3-piece-lawn-suit',
    modelImage: '/images/clothes/header_suit_2.png',
    fallbackModel: '/images/clothes/Ladies_Suit_014.png',
    garmentImage: '/images/clothes/Ladies_Suit_014.png',
    garmentTitle: 'Zeenat Mint Aqua 3-Piece Suit',
    garmentPrice: 4200,
    accentColor: '#2B7A78',
    description:
      'Refreshing seafoam mint aqua lawn shirt decorated with delicate lilac floral creepers and geometric lace daman loops, paired with a featherlight printed voile dupatta.',
  },
  {
    id: 'look-3',
    lookNumber: '03',
    pillText: 'Royal Violet',
    title: 'Banafsha Royal Violet 3-Piece Lawn Suit',
    category: 'Festive Lawn',
    tag: 'Chevron Dupatta · Rich Resham Work',
    price: 4200,
    originalPrice: 4500,
    productSlug: 'banafsha-royal-violet-3-piece-lawn-suit',
    modelImage: '/images/clothes/header_suit_3.png',
    fallbackModel: '/images/clothes/Ladies_Suit_004.png',
    garmentImage: '/images/clothes/Ladies_Suit_004.png',
    garmentTitle: 'Banafsha Royal Violet 3-Piece Suit',
    garmentPrice: 4200,
    accentColor: '#6B2D82',
    description:
      'Regal deep violet lawn with intricate multi-color booti motifs, finished with a showstopping chevron border printed dupatta and dyed matching trousers.',
  },
  {
    id: 'look-4',
    lookNumber: '04',
    pillText: 'Mustard Gold',
    title: 'Amber Ochre Golden 3-Piece Lawn Suit',
    category: 'Festive Lawn',
    tag: 'Fuchsia Contrast · Multi Dupatta',
    price: 4200,
    originalPrice: 4500,
    productSlug: 'amber-ochre-golden-3-piece-lawn-suit',
    modelImage: '/images/clothes/header_suit_4.png',
    fallbackModel: '/images/clothes/Ladies_Suit_018.png',
    garmentImage: '/images/clothes/Ladies_Suit_018.png',
    garmentTitle: 'Amber Ochre Golden 3-Piece Suit',
    garmentPrice: 4200,
    accentColor: '#C49A28',
    description:
      'Radiant mustard ochre lawn with traditional mosaic lattice motifs, accented with a contrasting fuchsia and royal blue printed drape dupatta and solid dyed cambric pants.',
  },
];

export default function DynamicLookbookHeader({
  products = [],
  categoryName = 'Clothes',
  collectionTitle = 'Summer Festive Lawn ‘26 Collection',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { addItem } = useCart();
  const { showToast } = useToast();

  // Blend DB products with curated looks if available
  const looks = LOOKBOOK_DATA.map((look, idx) => {
    const dbProduct = products[idx];
    if (dbProduct) {
      return {
        ...look,
        title: dbProduct.name,
        price: dbProduct.salePrice || 4200,
        originalPrice: dbProduct.price || 4500,
        productSlug: dbProduct.slug,
        garmentTitle: dbProduct.name,
        garmentPrice: dbProduct.salePrice || 4200,
        garmentImage: dbProduct.images?.[0] || look.garmentImage,
        dbId: dbProduct._id,
      };
    }
    return look;
  });

  const total = looks.length;
  const activeLook = looks[activeIndex];

  const nextLook = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevLook = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // 4-Second Dynamic Auto-advance loop (pauses while hovering like Instagram reels)
  useEffect(() => {
    if (!isAutoPlaying || isHovered) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, total]);

  const handleQuickAdd = useCallback(
    (look, e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        addItem?.({
          productId: look.dbId || look.id,
          variantId: `${look.id}-unstitched`,
          name: look.garmentTitle,
          price: look.garmentPrice,
          image: look.garmentImage,
          quantity: 1,
          slug: look.productSlug,
        });
        showToast?.(`${look.garmentTitle} added to your bag for PKR ${look.garmentPrice.toLocaleString()}!`, 'success');
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 1600);
      } catch (err) {
        showToast?.('Could not add to bag. Please try again.', 'error');
      }
    },
    [addItem, showToast],
  );

  return (
    <section
      className="relative w-full rounded-3xl mb-12 overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#EAE3D9] border border-[#DDD4C7] shadow-xl select-none"
      aria-label="Ladies Clothes Interactive Runway Lookbook"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Neutral Clean Studio Background (Zero colored glow) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft floor shadow gradient simulating studio floor plane */}
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#E2D8C9]/50 via-[#EAE1D3]/20 to-transparent" />
      </div>

      {/* ── Top Header Bar ── */}
      <div className="relative z-20 px-6 sm:px-10 pt-6 sm:pt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md border border-[#D9CEBF] shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B07538] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#4A3E33] font-semibold">
              Live Festive Lawn Runway
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-700 uppercase">Special Sale</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#241F1A] font-normal tracking-tight">
            {collectionTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5E50] mt-1 font-light">
            Luxury 3-Piece Embroidered Lawn Collection · Special Promo: <span className="text-[#8C673D] font-semibold">PKR 4,200</span> <span className="line-through text-[#9E8E7F] text-xs">PKR 4,500</span> with Cash on Delivery
          </p>
        </div>

        {/* Play / Pause toggle & Look dots */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/85 hover:bg-white text-xs text-[#3D332A] border border-[#D9CEBF] shadow-xs transition-all hover:scale-102"
            title={isAutoPlaying ? 'Pause Runway Loop' : 'Play Runway Loop'}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3 text-[#8C673D]" />
                <span className="text-[11px] font-medium hidden sm:inline">Auto Runway</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#8C673D]" />
                <span className="text-[11px] font-medium hidden sm:inline">Resume</span>
              </>
            )}
          </button>

          {/* Quick Counter */}
          <div className="px-3 py-1.5 rounded-full bg-white/85 text-[11px] font-mono text-[#4A3E33] border border-[#D9CEBF]">
            <span className="font-bold text-[#8C673D]">{activeLook.lookNumber}</span>
            <span className="text-[#8C7B6D]"> / 0{total}</span>
          </div>
        </div>
      </div>

      {/* ── Main Interactive Stage: Runway Models (Left) + "In this look" Card (Right) ── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 sm:px-10 py-6 sm:py-8 min-h-[520px]">

        {/* ════════════════════════════════════════════════════════════════
            LEFT: Runway Models Lineup (5 Full-Length Transparent Cutouts)
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-end">
          {/* Models Lineup Stage */}
          <div className="relative flex items-end justify-center sm:justify-around gap-1.5 sm:gap-4 pt-10 pb-4 min-h-[380px] sm:min-h-[460px]">
            {looks.map((look, idx) => {
              const isActive = activeIndex === idx;

              return (
                <div
                  key={look.id}
                  onClick={() => setActiveIndex(idx)}
                  className="relative flex flex-col items-center cursor-pointer group transition-all duration-500 focus:outline-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveIndex(idx);
                    }
                  }}
                  aria-label={`Select ${look.title}`}
                >
                  {/* Floating active pill above model head (like "Says tailoring" in reel) */}
                  <div className="relative z-10 h-8 flex items-center justify-center mb-1">
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          key="pill"
                          initial={{ opacity: 0, y: 8, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#1F1B16] text-[#FAF7F2] text-[10px] font-medium shadow-md border border-[#3E362C]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="tracking-wide uppercase font-semibold">{look.pillText}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Model Full-body Figure */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.05 : 0.93,
                      y: isActive ? -4 : 0,
                      opacity: isActive ? 1.0 : 0.65,
                      filter: isActive ? 'grayscale(0%)' : 'grayscale(15%)',
                    }}
                    whileHover={{
                      scale: isActive ? 1.08 : 0.98,
                      opacity: 0.95,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 280,
                      damping: 24,
                    }}
                    className="relative h-64 sm:h-72 md:h-80 lg:h-[340px] flex items-end justify-center"
                  >
                    {/* Transparent box with soft shadow behind active model (Zero colored glow) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeModelBox"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="absolute inset-0 -inset-x-2.5 sm:-inset-x-3.5 -inset-y-1.5 rounded-2xl bg-white/25 backdrop-blur-[2px] border border-white/60 shadow-[0_12px_28px_rgba(40,30,20,0.08),0_2px_6px_rgba(40,30,20,0.04)] pointer-events-none z-0"
                      />
                    )}

                    {/* Model Image Cutout with fallback */}
                    <div className="relative z-10 h-full flex items-end justify-center overflow-visible">
                      <img
                        src={look.modelImage}
                        alt={look.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = look.fallbackModel;
                        }}
                        className={`h-full w-auto object-contain object-bottom drop-shadow-md transition-transform duration-500 select-none ${
                          isActive ? 'scale-102' : 'scale-98'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Soft Realistic Elliptical Floor Shadow Under Shoes */}
                  <div
                    className={`relative z-10 w-16 sm:w-24 h-2.5 rounded-full transition-all duration-500 mt-[-6px] pointer-events-none ${
                      isActive
                        ? 'bg-black/35 blur-[4px] scale-110'
                        : 'bg-black/20 blur-[3px] scale-90'
                    }`}
                  />

                  {/* Model Number & Subtitle */}
                  <div className="relative z-10 text-center mt-2.5">
                    <span
                      className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${
                        isActive
                          ? 'text-[#1F1B16] font-bold border-b-2 border-[#8C673D] pb-0.5'
                          : 'text-[#8A796A] group-hover:text-[#4A3E33]'
                      }`}
                    >
                      Look {look.lookNumber}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Runway Navigation Footer (Thumbnails & Prev/Next) */}
          <div className="flex items-center justify-between pt-4 border-t border-[#DDD4C7] mt-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#6E5F52] font-medium hidden sm:inline">
                Click any suit to inspect look details
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={prevLook}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-[#2C241D] border border-[#D9CEBF] shadow-xs hover:scale-105 active:scale-95 transition-all"
                aria-label="Previous Look"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1.5 px-2">
                {looks.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? 'w-6 bg-[#8C673D]'
                        : 'w-1.5 bg-[#BFB2A3] hover:bg-[#8A7A6A]'
                    }`}
                    aria-label={`Go to look ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextLook}
                className="p-2 rounded-full bg-[#1F1B16] hover:bg-[#3D332A] text-white shadow-xs hover:scale-105 active:scale-95 transition-all"
                aria-label="Next Look"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT: "In this look" Luxury Floating Glass Card
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 shadow-xl border border-[#D9CEBF]/80 flex flex-col justify-between">
            {/* Card Header with "In this look" */}
            <div className="pb-3.5 border-b border-[#EAE2D7] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C7A68]">
                  Curated Ensemble
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F3EDE4] text-[10px] font-mono text-[#5A4C3E] border border-[#DDD4C7] font-semibold whitespace-nowrap">
                  0{activeIndex + 1} / 0{total}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-serif text-xl sm:text-2xl text-[#2A2219] font-medium tracking-tight whitespace-nowrap">
                  In This Look
                </h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold whitespace-nowrap">
                  SALE • SAVE PKR 300
                </span>
              </div>
            </div>

            {/* Dynamic Product Card Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLook.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="py-4 space-y-4"
              >
                {/* Garment Image Container */}
                <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-white border border-[#E5DACB] group">
                  <img
                    src={activeLook.garmentImage}
                    alt={activeLook.garmentTitle}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-40 pointer-events-none" />

                  {/* Active Look Category Tag */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[9px] font-semibold uppercase tracking-wider text-[#2E251C] shadow-xs border border-[#DDD4C7]">
                      {activeLook.category}
                    </span>
                  </div>

                  {/* Trust Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white">
                    <span className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md font-mono flex items-center space-x-1">
                      <Truck className="w-3 h-3 text-emerald-300 inline mr-1" />
                      Free Cash On Delivery
                    </span>
                    <span className="bg-emerald-800/90 backdrop-blur-md text-emerald-200 px-2 py-0.5 rounded-md font-medium">
                      In Stock
                    </span>
                  </div>
                </div>

                {/* Garment Details */}
                <div>
                  <h4 className="font-serif text-base sm:text-lg text-[#1F1913] font-normal leading-snug">
                    {activeLook.garmentTitle}
                  </h4>
                  <p className="text-[11px] text-[#786655] mt-1 font-light line-clamp-2">
                    {activeLook.description}
                  </p>
                  <div className="mt-2 text-[10px] text-[#8C7A68] font-mono uppercase tracking-wider">
                    {activeLook.tag}
                  </div>
                </div>

                {/* Price Display: PKR 4,500 cut to PKR 4,200 in single line */}
                <div className="flex items-baseline flex-nowrap gap-2 sm:gap-2.5 pt-1 whitespace-nowrap overflow-hidden">
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#8C673D] whitespace-nowrap shrink-0">
                    PKR {activeLook.garmentPrice.toLocaleString()}
                  </span>
                  <span className="text-xs sm:text-sm text-[#9E8E7F] line-through font-mono font-medium whitespace-nowrap shrink-0">
                    PKR {activeLook.originalPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 whitespace-nowrap shrink-0">
                    Save PKR {(activeLook.originalPrice - activeLook.garmentPrice).toLocaleString()}
                  </span>
                </div>

                {/* Actions: Quick Add to Bag & View Product Details */}
                <div className="flex items-center gap-2 pt-2 flex-nowrap">
                  <button
                    onClick={(e) => handleQuickAdd(activeLook, e)}
                    className="flex-1 py-3 px-3 sm:px-4 rounded-xl bg-[#8C673D] hover:bg-[#72522E] text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase flex items-center justify-center space-x-1.5 shadow-soft hover:scale-102 active:scale-98 transition-all whitespace-nowrap shrink-0"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white shrink-0" />
                        <span className="whitespace-nowrap">Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5 text-white shrink-0" />
                        <span className="whitespace-nowrap">Quick Add • Rs. 4,200</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/product/${activeLook.productSlug}`}
                    className="py-3 px-3 sm:px-4 rounded-xl bg-[#FAF6F0] hover:bg-white text-[#2C241D] text-[11px] sm:text-xs font-semibold border border-[#D9CEBF] shadow-xs flex items-center justify-center space-x-1 hover:scale-102 active:scale-98 transition-all whitespace-nowrap shrink-0"
                  >
                    <span className="whitespace-nowrap">Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom mini trust statement */}
            <div className="pt-3 border-t border-[#EAE2D7] flex items-center justify-between text-[10px] text-[#8C7A68]">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#8C673D]" />
                <span>100% Original Lawn Guarantee</span>
              </span>
              <span>Express Delivery Pakistan</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
