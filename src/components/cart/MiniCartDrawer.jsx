'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const MiniCartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  const FREE_SHIPPING_THRESHOLD = 4500;
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-sage-dark/50 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-sage-ivory text-sage-dark shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-sage-soft/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-sage-primary" />
                  <h3 className="font-serif text-lg text-sage-dark font-medium">
                    Your Shopping Bag ({totalItems})
                  </h3>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-sage-dark/60 hover:text-sage-dark hover:bg-sage-soft/30 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress bar */}
              <div className="bg-sage-soft/20 px-6 py-3.5 border-b border-sage-soft/30">
                <div className="flex justify-between text-xs font-medium text-sage-dark mb-1.5">
                  {amountNeeded > 0 ? (
                    <span>
                      Add <strong className="text-sage-primary">PKR {amountNeeded.toLocaleString()}</strong> for Free Delivery
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                      <span>🎉 Complimentary Express Delivery Unlocked!</span>
                    </span>
                  )}
                  <span className="font-mono text-sage-dark/70">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-sage-soft/50 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-sage-primary h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-sage-soft/30 flex items-center justify-center text-sage-muted mb-4 border border-sage-soft/40">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-serif text-lg text-sage-dark font-medium">Your Bag is Empty</p>
                    <p className="text-xs text-sage-muted mt-1 max-w-xs leading-relaxed font-light">
                      Explore our 2026 Archive collections for precision watches, streetwear hoodies, silk shirts, and cloud slides.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 px-6 py-3 rounded-2xl bg-sage-dark text-sage-ivory text-xs font-semibold uppercase tracking-wider hover:bg-sage-primary transition-colors shadow-soft"
                    >
                      Explore 2026 Drops
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex space-x-4 pb-5 border-b border-sage-soft/30 group"
                    >
                      <div className="relative w-20 h-20 rounded-2xl bg-sage-soft/20 overflow-hidden flex-shrink-0 border border-sage-soft/40">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif text-xs sm:text-sm font-semibold text-sage-dark line-clamp-1">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="text-sage-muted hover:text-red-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.variantName && (
                            <span className="text-[10px] text-sage-primary block mt-0.5">
                              {item.variantName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded-xl border border-sage-soft/60">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity - 1)
                              }
                              className="text-sage-dark hover:text-sage-primary transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-sage-dark px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                              className="text-sage-dark hover:text-sage-primary transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-serif text-xs sm:text-sm font-bold text-sage-dark">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Checkout Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-sage-soft/40 bg-white/80 space-y-4">
                  <div className="space-y-1.5 text-xs text-sage-dark/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-serif text-sage-dark font-bold">
                        PKR {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nationwide Delivery</span>
                      <span className="font-mono text-emerald-700">
                        {amountNeeded === 0 ? 'FREE' : 'PKR 300'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-sage-dark pt-2 border-t border-sage-soft/30">
                      <span>Estimated Total</span>
                      <span className="font-serif text-sage-dark">
                        PKR {(subtotal + (amountNeeded === 0 ? 0 : 300)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-sage-dark/80 bg-sage-soft/20 p-2.5 rounded-xl border border-sage-soft/40">
                    <Banknote className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>100% Cash on Delivery — Pay rider at your doorstep</span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-4 rounded-2xl bg-sage-dark hover:bg-sage-primary text-sage-ivory font-semibold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2 shadow-float"
                  >
                    <span>Proceed to Cash on Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MiniCartDrawer;
