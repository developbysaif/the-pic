'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  Sparkles,
  Check,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useModal } from '@/context/ModalContext';
import { useToast } from '@/context/ToastContext';

// High-resolution category alternate angles for products that currently have 1 image.
// When the user uploads their own images into product.images in MongoDB / Admin,
// the component automatically prioritizes the user's uploaded images.
const CATEGORY_ANGLE_FALLBACKS = {
  watches:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop',
  clothes:
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  shirts:
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop',
  slides:
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop',
};

export const ProductCard3D = ({ product, index = 0 }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const cardRef = useRef(null);
  const addBtnRef = useRef(null);

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useModal();
  const { showToast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  // Category determination for smart fallback angles
  const categorySlug = (
    product.category?.slug ||
    product.category?.name ||
    product.category ||
    ''
  )
    .toString()
    .toLowerCase();

  const fallbackSecondary =
    categorySlug.includes('watch')
      ? CATEGORY_ANGLE_FALLBACKS.watches
      : categorySlug.includes('cloth') ||
        categorySlug.includes('hoodie') ||
        categorySlug.includes('trench')
      ? CATEGORY_ANGLE_FALLBACKS.clothes
      : categorySlug.includes('shirt')
      ? CATEGORY_ANGLE_FALLBACKS.shirts
      : categorySlug.includes('slide')
      ? CATEGORY_ANGLE_FALLBACKS.slides
      : CATEGORY_ANGLE_FALLBACKS.watches;

  // Build dynamic images array:
  // 1. Variant image first (if selected)
  // 2. All product.images uploaded by the user
  // Never inject foreign category images (e.g. watches into clothes)
  const baseImages = selectedVariant?.image
    ? [selectedVariant.image, ...(product.images || []).filter((img) => img !== selectedVariant.image)]
    : product.images && product.images.length > 0
    ? product.images
    : [
        '/images/watches/watch_obsidian_cutout.png',
      ];

  const displayImages = baseImages;
  const primaryImage = displayImages[0];
  const secondaryImage = displayImages.length > 1 ? displayImages[1] : displayImages[0];

  // 3D Tilt calculation with Framer Motion Springs (disabled if reduced motion requested)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], shouldReduceMotion ? ['0deg', '0deg'] : ['5deg', '-5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], shouldReduceMotion ? ['0deg', '0deg'] : ['-5deg', '5deg']);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // On desktop hover: seamlessly reveal the secondary/alternate angle
    if (displayImages.length > 1) {
      setActiveImageIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveImageIndex(0);
    x.set(0);
    y.set(0);
  };

  // Touch handlers for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Swipe left (advance to next image)
    if (diff > 40) {
      setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
    }
    // Swipe right (go back to previous image)
    else if (diff < -40) {
      setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
    setTouchStartX(null);
  };

  // Pricing calculation
  const currentPrice =
    selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const originalPrice = selectedVariant?.salePrice
    ? selectedVariant.price
    : product.salePrice
    ? product.price
    : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const inWish = isInWishlist(product._id);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = addBtnRef.current?.getBoundingClientRect() || null;
    try {
      if (addItem) {
        addItem(
          {
            productId: product._id,
            variantId: selectedVariant?.id || 'default',
            title: product.name,
            variantName: selectedVariant?.name || 'Standard Edition',
            image: displayImages[activeImageIndex] || primaryImage,
            price: currentPrice,
            quantity: 1,
            sku: selectedVariant?.sku || product.SKU,
            slug: product.slug,
          },
          rect
        );
      }
      if (showToast) {
        showToast(`${product.name} added to your bag!`, 'success');
      }
    } catch (_) {
      if (showToast) {
        showToast('Could not add to bag. Please try again.', 'error');
      }
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (showToast) {
      showToast(
        inWish
          ? `Removed ${product.name} from wishlist.`
          : `Saved ${product.name} to wishlist!`,
        'info'
      );
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.55,
        delay: Math.min((index % 4) * 0.08, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: shouldReduceMotion ? 'flat' : 'preserve-3d',
      }}
      className="relative rounded-3xl bg-sage-ivory border border-sage-soft/40 shadow-soft hover:shadow-float transition-all duration-300 flex flex-col justify-between overflow-hidden group select-none text-sage-dark will-change-transform"
    >
      {/* 3D Depth Layer */}
      <div
        style={{ transform: shouldReduceMotion ? 'none' : 'translateZ(25px)' }}
        className="p-4 sm:p-5 flex-1 flex flex-col"
      >
        {/* Top Badges & Wishlist */}
        <div className="flex items-center justify-between mb-3 z-10">
          <div className="flex flex-wrap gap-1.5">
            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-sage-dark text-sage-ivory text-[10px] font-bold tracking-wider uppercase shadow-sm">
                Save {discountPercent}%
              </span>
            )}
            {product.bestSeller && (
              <span className="px-2.5 py-1 rounded-full bg-sage-primary text-white text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                Bestseller
              </span>
            )}
            {product.trending && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                Trending
              </span>
            )}
          </div>

          {/* Interactive Wishlist Heart Button with micro-bounce */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full transition-all duration-300 ${
              inWish
                ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-200'
                : 'bg-white/85 text-sage-dark/60 hover:text-red-500 hover:bg-white shadow-soft-sm'
            }`}
            aria-label={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
            title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-300 ${
                inWish ? 'fill-current scale-110' : 'scale-100'
              }`}
            />
          </motion.button>
        </div>

        {/* Dynamic Product Image Preview Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-square rounded-2xl bg-sage-soft/20 overflow-hidden mb-4 flex items-center justify-center p-3 border border-sage-soft/30 cursor-pointer"
        >
          <motion.div
            style={{
              transform:
                shouldReduceMotion
                  ? 'none'
                  : isHovered
                  ? 'translateZ(30px) scale(1.04)'
                  : 'translateZ(0px) scale(1)',
            }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full rounded-xl overflow-hidden"
          >
            {/* Primary Image: Smooth Fade and Subtle Scale */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeImageIndex === 0
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <Image
                src={primaryImage}
                alt={`${product.name} - Front Angle`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center"
                priority={index < 4}
              />
            </div>

            {/* Secondary/Alternate Image: Smooth Reveal Fade-In */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                activeImageIndex === 1
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 z-0'
              }`}
            >
              <Image
                src={secondaryImage}
                alt={`${product.name} - Alternate Angle Preview`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center"
              />
            </div>

            {/* Soft Ambient Shadow on Image Stage */}
            <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
          </motion.div>

          {/* Interactive Micro Perspective Pill Badge on Hover (only if multiple angles exist) */}
          {displayImages.length > 1 && (
            <div
              className={`absolute top-2.5 left-2.5 z-20 pointer-events-none transition-all duration-300 ${
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-1'
              }`}
            >
              <span className="px-2 py-0.5 rounded-md bg-sage-dark/85 backdrop-blur-md text-[9px] font-mono font-medium text-sage-ivory flex items-center space-x-1 shadow-sm border border-sage-soft/30">
                <Layers className="w-2.5 h-2.5 text-sage-primary" />
                <span>
                  ANGLE 0{activeImageIndex + 1}/0{displayImages.length}
                </span>
              </span>
            </div>
          )}

          {/* Mobile & Desktop Multi-Angle Indicator Dots */}
          {displayImages.length > 1 && (
            <div
              className="absolute bottom-2.5 inset-x-0 flex items-center justify-center space-x-1.5 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImageIndex(dotIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                    activeImageIndex === dotIdx
                      ? 'w-5 bg-sage-primary shadow-sm'
                      : 'w-1.5 bg-sage-dark/40 hover:bg-sage-dark/70'
                  }`}
                  aria-label={`Preview angle ${dotIdx + 1}`}
                  title={`View angle ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Quick View Button Hover Slide-up */}
          <div className="absolute inset-x-4 bottom-7 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              className="px-4 py-2 rounded-xl bg-sage-dark/90 hover:bg-sage-dark text-sage-ivory text-xs font-semibold backdrop-blur-md shadow-float flex items-center space-x-1.5 transition-colors border border-sage-soft/30"
            >
              <Eye className="w-3.5 h-3.5 text-sage-primary" />
              <span>Quick View</span>
            </motion.button>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Rating Stars */}
            <div className="flex items-center space-x-1.5 mb-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-current'
                        : 'text-sage-soft'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-sage-muted font-medium">
                {product.rating || 5.0} ({product.reviewsCount || 24})
              </span>
            </div>

            {/* Title with Smooth Underline Transition */}
            <Link href={`/product/${product.slug}`} className="block group/title">
              <h3 className="font-serif text-base sm:text-lg text-sage-dark group-hover/title:text-sage-primary transition-colors line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-sage-muted line-clamp-2 mt-1 leading-relaxed font-light">
              {product.shortDescription || product.description}
            </p>
          </div>

          {/* Variants with Interactive Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-sage-soft/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-semibold text-sage-muted tracking-wider">
                  Options
                </span>
                <span className="text-[10px] text-sage-dark font-medium truncate max-w-[140px]">
                  {selectedVariant?.name}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(v);
                        setActiveImageIndex(0);
                      }}
                      title={`${v.name} - PKR ${(
                        v.salePrice || v.price
                      ).toLocaleString()}`}
                      className={`relative rounded-full transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-sage-primary ring-offset-2 ring-offset-sage-ivory scale-110 z-10'
                          : 'filter blur-[0.6px] opacity-70 hover:filter-none hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ width: 22, height: 22 }}
                    >
                      <span
                        className="w-full h-full rounded-full border border-black/10 flex items-center justify-center text-[8px] font-bold"
                        style={{
                          backgroundColor: v.value?.startsWith('#')
                            ? v.value
                            : '#789575',
                          color: '#ffffff',
                        }}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 drop-shadow" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price & Add to Cart button */}
          <div className="mt-4 pt-3 border-t border-sage-soft/30 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-serif font-bold text-base sm:text-lg text-sage-dark">
                  PKR {currentPrice.toLocaleString()}
                </span>
                {originalPrice && (
                  <span className="text-xs text-sage-muted line-through">
                    PKR {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium block">
                Cash on Delivery Available
              </span>
            </div>

            {/* Interactive Add to Bag Button with Micro-Animation */}
            <motion.button
              ref={addBtnRef}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className="p-2.5 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white shadow-soft hover:shadow-float transition-all duration-200 disabled:opacity-40 flex items-center justify-center"
              title="Add to Bag"
              aria-label={`Add ${product.name} to Bag`}
            >
              <ShoppingBag className="w-4 h-4 font-bold" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard3D;
