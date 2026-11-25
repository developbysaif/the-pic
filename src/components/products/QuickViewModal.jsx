'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';

export const QuickViewModal = () => {
  const { quickViewProduct, closeQuickView } = useModal();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const addToCartBtnRef = useRef(null);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedVariant(quickViewProduct.variants?.[0] || null);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const currentPrice =
    selectedVariant?.salePrice ||
    selectedVariant?.price ||
    quickViewProduct.salePrice ||
    quickViewProduct.price;
  const originalPrice = selectedVariant?.salePrice
    ? selectedVariant.price
    : quickViewProduct.salePrice
    ? quickViewProduct.price
    : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;
  const currentImage =
    selectedVariant?.image ||
    quickViewProduct.images?.[0] ||
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop';
  const currentStock = selectedVariant ? selectedVariant.stock : quickViewProduct.stock;

  const handleAddToCart = () => {
    const rect = addToCartBtnRef.current?.getBoundingClientRect() || null;
    addItem(
      {
        productId: quickViewProduct._id,
        variantId: selectedVariant?.id || 'default',
        title: quickViewProduct.name,
        variantName: selectedVariant?.name || 'Standard Edition',
        image: currentImage,
        price: currentPrice,
        quantity: quantity,
        sku: selectedVariant?.sku || quickViewProduct.SKU,
        slug: quickViewProduct.slug,
      },
      rect
    );
    closeQuickView();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickView}
          className="fixed inset-0 bg-sage-dark/50 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-3xl bg-sage-ivory text-sage-dark rounded-3xl shadow-2xl border border-sage-soft/40 overflow-hidden z-10 my-8"
        >
          <button
            onClick={closeQuickView}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 text-sage-dark hover:bg-white shadow-sm transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Image Showcase */}
            <div className="relative bg-sage-soft/20 aspect-square md:aspect-auto md:h-full p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sage-soft/30">
              <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-soft">
                <Image
                  src={currentImage}
                  alt={quickViewProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-all duration-500"
                />
              </div>
              {discountPercent > 0 && (
                <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-sage-dark text-sage-ivory text-xs font-semibold tracking-wider uppercase">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Right Details */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(quickViewProduct.rating || 5)
                            ? 'fill-current'
                            : 'text-sage-soft'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-sage-muted font-medium">
                    {quickViewProduct.rating || 5.0} ({quickViewProduct.reviewsCount || 24} reviews)
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-sage-dark leading-snug">
                  {quickViewProduct.name}
                </h3>

                <p className="text-xs text-sage-muted font-mono mt-1">
                  SKU: {selectedVariant?.sku || quickViewProduct.SKU}
                </p>

                {/* Price */}
                <div className="flex items-baseline space-x-3 mt-4">
                  <span className="text-2xl font-serif font-bold text-sage-dark">
                    PKR {currentPrice.toLocaleString()}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-sage-muted line-through">
                      PKR {originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Cash on Delivery
                  </span>
                </div>

                <p className="text-xs text-sage-dark/80 mt-3 line-clamp-3 leading-relaxed font-light">
                  {quickViewProduct.shortDescription || quickViewProduct.description}
                </p>

                {/* Variant Selector */}
                {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-sage-soft/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-sage-dark uppercase tracking-wider">
                        Select Variant
                      </span>
                      <span className="text-xs text-sage-primary font-medium">
                        {selectedVariant?.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {quickViewProduct.variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            title={v.name}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-300 ${
                              isSelected
                                ? 'bg-sage-dark text-white border-sage-dark shadow-sm scale-105'
                                : 'bg-white/80 text-sage-dark/70 border-sage-soft hover:border-sage-primary'
                            }`}
                          >
                            <span>{v.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock status */}
                <div className="mt-4 flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentStock > 0 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-xs font-medium text-sage-dark">
                    {currentStock > 0
                      ? `In Stock (${currentStock} units available for COD)`
                      : 'Temporarily Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-5 border-t border-sage-soft/30 space-y-3">
                <div className="flex items-center space-x-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-sage-soft rounded-xl bg-white px-2 py-1.5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 text-sage-dark hover:text-sage-primary text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-sage-dark min-w-[24px] text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 text-sage-dark hover:text-sage-primary text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    ref={addToCartBtnRef}
                    onClick={handleAddToCart}
                    disabled={currentStock <= 0}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-sage-primary hover:bg-sage-accent text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-soft disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4 font-bold" />
                    <span>Add to Bag</span>
                  </button>
                </div>

                <Link
                  href={`/product/${quickViewProduct.slug}`}
                  onClick={closeQuickView}
                  className="flex items-center justify-center space-x-1.5 w-full py-2 text-xs font-semibold text-sage-primary hover:text-sage-dark transition-colors"
                >
                  <span>View Complete Drop Details & Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
