'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Clock } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

// ─── Luxury Watches with precise wrist alignment ─────────────────────────────
const WATCH_PRODUCTS = [
  {
    id: 'watch-obsidian',
    name: 'Royal Obsidian Chronograph X',
    shortName: 'Royal Obsidian',
    tag: 'Forged Carbon & Titanium',
    price: 48500,
    salePrice: 42900,
    slug: 'royal-obsidian-chronograph-x',
    thumbImage: '/images/watches/watch_obsidian.jpg',
    wristImage: '/images/watches/watch_obsidian_sm.png',
    accent: '#8C673D',
    label: 'Stealth Edition',
    // Exact position on the wrist joint (no bottom shadow, natural rotation)
    wristPos: { left: '46%', top: '39%', width: '31%', rotate: 12 },
  },
  {
    id: 'watch-rose-gold',
    name: 'Aura Minimalist Rose Gold Chrono',
    shortName: 'Aura Rose Gold',
    tag: '18k Rose Gold · Alligator Strap',
    price: 34000,
    salePrice: 29500,
    slug: 'aura-minimalist-rose-gold-chrono',
    thumbImage: '/images/watches/watch_rose_gold.jpg',
    wristImage: '/images/watches/watch_rose_gold_sm.png',
    accent: '#B07538',
    label: 'Dress Watch',
    wristPos: { left: '46%', top: '39%', width: '31%', rotate: 12 },
  },
  {
    id: 'watch-emerald',
    name: 'Nautilus Emerald Diver',
    shortName: 'Nautilus Emerald',
    tag: 'Stainless Steel · Diver Pro',
    price: 38000,
    salePrice: 32500,
    slug: 'royal-obsidian-chronograph-x',
    thumbImage: '/images/watches/watch_emerald.jpg',
    wristImage: '/images/watches/watch_emerald_sm.png',
    accent: '#3E6B4A',
    label: '300m Water Resistant',
    wristPos: { left: '46%', top: '39%', width: '31%', rotate: 12 },
  },
];

export default function WatchTryOnHeader({ products = [], categoryName = 'Watches' }) {
  const [activeWatch, setActiveWatch] = useState(null); // null = bare wrist
  const [isAnimating, setIsAnimating] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const watches = WATCH_PRODUCTS.map((w, idx) => {
    const dbProd = products[idx];
    if (dbProd) {
      return {
        ...w,
        name: dbProd.name,
        price: dbProd.price || w.price,
        salePrice: dbProd.salePrice || w.salePrice,
        slug: dbProd.slug,
        dbId: dbProd._id,
      };
    }
    return w;
  });

  const handleWatchClick = useCallback(
    (watch) => {
      if (isAnimating) return;
      setIsAnimating(true);
      if (activeWatch?.id === watch.id) {
        // Deselect -> bare wrist
        setActiveWatch(null);
        setTimeout(() => setIsAnimating(false), 400);
      } else {
        // Switch to new watch
        setActiveWatch(null);
        setTimeout(() => {
          setActiveWatch(watch);
          setIsAnimating(false);
        }, 280);
      }
    },
    [activeWatch, isAnimating],
  );

  const handleQuickAdd = useCallback(
    (watch, e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        addItem?.({
          productId: watch.dbId || watch.id,
          variantId: `${watch.id}-std`,
          name: watch.name,
          price: watch.salePrice || watch.price,
          image: watch.thumbImage,
          quantity: 1,
          slug: watch.slug,
        });
        showToast?.(`${watch.shortName} added to bag!`, 'success');
      } catch {}
    },
    [addItem, showToast],
  );

  const activeProd = activeWatch;

  return (
    <section className="relative w-full overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-[#F7F3EE] via-[#EFE6DC] to-[#E5DACB] shadow-xl border border-[#D9CEBF]">
      {/* ── Warm ambient glow that shifts with active watch ──────────────── */}
      <AnimatePresence>
        {activeProd && (
          <motion.div
            key={activeProd.id + '-ambient'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 60% at 75% 50%, ${activeProd.accent}15 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Main two-column layout ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[480px] sm:min-h-[520px] lg:min-h-[560px]">

        {/* ════════════════════════════════════════════════════════════════
            LEFT PANEL — Static wrist photo + precise watch overlay
            ════════════════════════════════════════════════════════════════ */}
        <div className="relative flex-shrink-0 w-full lg:w-[50%] min-h-[360px] sm:min-h-[420px] lg:min-h-full overflow-hidden bg-[#FAF7F2]">
          {/* Static wrist editorial photo */}
          <Image
            src="/images/watches/wrist_portrait.jpg"
            alt="Bare wrist on stone"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            priority
          />

          {/* Smooth blend from wrist photo into the light brown right panel */}
          <div className="absolute inset-y-0 right-0 w-20 lg:w-32 bg-gradient-to-r from-transparent to-[#EFE6DC] pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#E5DACB]/80 to-transparent pointer-events-none lg:hidden" />

          {/* ── Watch positioned exactly on the wrist joint ── */}
          <AnimatePresence mode="wait">
            {activeProd && (
              <motion.div
                key={activeProd.id}
                initial={{ opacity: 0, scale: 0.75, y: 18 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  rotate: activeProd.wristPos.rotate || 12,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  y: -15,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 22,
                  mass: 0.7,
                }}
                className="absolute pointer-events-none"
                style={{
                  left: activeProd.wristPos.left,
                  top: activeProd.wristPos.top,
                  width: activeProd.wristPos.width,
                  zIndex: 20,
                }}
              >
                {/* Watch without any bottom shadow or artificial glow */}
                <Image
                  src={activeProd.wristImage}
                  alt={activeProd.name + ' on wrist'}
                  width={340}
                  height={460}
                  className="w-full h-auto object-contain select-none pointer-events-none"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Instruction badge at bottom-left of wrist ── */}
          <div className="absolute bottom-5 left-5 right-12 flex items-center space-x-2 z-30">
            <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-[#D9CEBF] px-3.5 py-2 rounded-xl shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#8C673D] animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-medium text-[#3A2D23] leading-tight">
                {activeProd ? (
                  <span>
                    <span className="text-[#8C673D] font-bold">{activeProd.shortName}</span>
                    {' '}on wrist · Click to change
                  </span>
                ) : (
                  'Click any watch to try it on your wrist →'
                )}
              </span>
            </div>
          </div>

          {/* ── Category badge top-left ── */}
          <div className="absolute top-5 left-5 z-30">
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-[#D9CEBF] px-3 py-1.5 rounded-full shadow-sm">
              <Clock className="w-3.5 h-3.5 text-[#8C673D]" />
              <span className="text-[11px] font-semibold text-[#3A2D23] uppercase tracking-widest">{categoryName}</span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT PANEL — Light Brown / Warm Camel Luxury Watch Shelf
            ════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-8 lg:py-10 bg-gradient-to-b from-[#EFE6DC] via-[#EAE0D2] to-[#E3D6C5]">

          {/* Header Title & Dynamic Subtitle */}
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8C673D] block mb-1">
              Virtual Horology Atelier
            </span>
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#2A2118] leading-tight"
            >
              {activeProd ? (
                <>
                  <span className="text-[#8C673D] font-medium">{activeProd.shortName}</span>
                  <br />
                  <span className="text-[#6E5C4B] text-base sm:text-lg font-light">{activeProd.tag}</span>
                </>
              ) : (
                <>
                  Curated <span className="text-[#8C673D]">Timepieces</span>
                  <br />
                  <span className="text-[#6E5C4B] text-base sm:text-lg font-light">Select a timepiece to wear on wrist</span>
                </>
              )}
            </motion.h1>

            {/* Price display when watch is selected */}
            <AnimatePresence mode="wait">
              {activeProd && (
                <motion.div
                  key={activeProd.id + '-price'}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-baseline space-x-3 mt-3 flex-nowrap whitespace-nowrap overflow-hidden"
                >
                  <span className="font-serif text-2xl font-bold text-[#8C673D] whitespace-nowrap shrink-0">
                    PKR {activeProd.salePrice.toLocaleString()}
                  </span>
                  {activeProd.salePrice < activeProd.price && (
                    <span className="text-sm text-[#8C7A68] line-through font-mono whitespace-nowrap shrink-0">
                      PKR {activeProd.price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[11px] bg-[#8C673D]/15 text-[#6E4F28] px-2.5 py-0.5 rounded-full border border-[#8C673D]/30 font-medium whitespace-nowrap shrink-0">
                    COD Available
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Watch Cards List in Light Brown Aesthetic ── */}
          <div className="flex flex-col space-y-3.5">
            {watches.map((watch, idx) => {
              const isActive = activeWatch?.id === watch.id;
              return (
                <motion.div
                  key={watch.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleWatchClick(watch)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleWatchClick(watch);
                    }
                  }}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + idx * 0.08, ease: 'easeOut' }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={`relative group flex items-center space-x-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#8C673D] ${
                    isActive
                      ? 'border-[#8C673D] bg-white shadow-md ring-2 ring-[#8C673D]/30'
                      : 'border-[#D9CEBF] bg-white/75 hover:bg-white hover:border-[#BFB09D] shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Watch thumbnail */}
                  <div
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white transition-all duration-300 ${
                      isActive ? 'ring-2 ring-[#8C673D]' : 'ring-1 ring-[#D9CEBF]'
                    }`}
                  >
                    <Image
                      src={watch.thumbImage}
                      alt={watch.name}
                      fill
                      sizes="80px"
                      className="object-cover object-center"
                    />
                    {/* Active pulse dot on thumbnail */}
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#8C673D] ring-2 ring-white shadow" />
                    )}
                  </div>

                  {/* Watch Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p
                          className={`font-serif font-semibold text-sm sm:text-base leading-tight truncate transition-colors ${
                            isActive ? 'text-[#2A2118]' : 'text-[#3A2D23] group-hover:text-[#2A2118]'
                          }`}
                        >
                          {watch.shortName}
                        </p>
                        <p className="text-[11px] text-[#7A6753] mt-0.5 truncate font-sans">{watch.tag}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-serif text-sm font-bold text-[#8C673D]">
                          {watch.salePrice.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#9E8C78] font-mono line-through">
                          {watch.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Try on indicator pill & Quick Actions */}
                    <div className="flex items-center justify-between mt-2.5">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-wider transition-all ${
                          isActive
                            ? 'bg-[#8C673D] border-[#8C673D] text-white shadow-sm'
                            : 'bg-[#F2ECE3] border-[#D9CEBF] text-[#7A6753] group-hover:bg-[#EAE0D2] group-hover:text-[#3A2D23]'
                        }`}
                      >
                        {isActive ? '✓ Wearing Now' : 'Try On Wrist'}
                      </span>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center space-x-1.5"
                        >
                          <button
                            onClick={(e) => handleQuickAdd(watch, e)}
                            className="p-1.5 rounded-lg bg-[#F2ECE3] hover:bg-[#8C673D] hover:text-white text-[#423326] transition-colors border border-[#D9CEBF]"
                            title="Add to bag"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/product/${watch.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg bg-[#8C673D] hover:bg-[#72522E] text-white transition-colors"
                            title="View product"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="mt-5 text-[11px] text-[#7A6753] font-mono text-center tracking-wider">
            ✦ Cash on Delivery · Pakistan-Wide Express Courier · Authentic Swiss Movements
          </p>
        </div>
      </div>
    </section>
  );
}
