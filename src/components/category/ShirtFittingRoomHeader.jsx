'use client';

import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ShirtFittingRoomHeader({ products = [], categoryName = 'Shirts' }) {
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'ADD_TO_CART') {
        addItem?.(e.data.item);
        showToast?.(`Added ${e.data.item.name} (${e.data.item.size || 'M'}) to bag!`, 'success');
      } else if (e.data?.type === 'OPEN_CART') {
        openCart?.();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addItem, openCart, showToast]);

  return (
    <section className="relative w-full mb-12 rounded-3xl overflow-hidden shadow-2xl border border-[#D5C6B5]">
      <div className="relative w-full h-[88vh] min-h-[620px] max-h-[880px] bg-[#e9e4dc]">
        <iframe
          src="/virtualfit.html"
          className="w-full h-full border-0 select-none block"
          title="VirtualFit: Spatial Try-On Arc"
          allow="accelerometer; gyroscope"
        />
      </div>
    </section>
  );
}
