'use client';
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
export const VariantSelector = ({ variants, selectedVariant, onSelectVariant, className = '', }) => {
    const [hoveredVariant, setHoveredVariant] = useState(null);
    if (!variants || variants.length === 0)
        return null;
    return (<div className={`space-y-3 ${className}`}>
      {/* Active / Hovered label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-sage-dark uppercase tracking-wider">
          Available Editions & Volumes:
        </span>
        <motion.span key={hoveredVariant?.id || selectedVariant?.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-semibold text-sage-primary">
          {hoveredVariant ? hoveredVariant.name : selectedVariant?.name}
        </motion.span>
      </div>

      {/* Circular Swatches with interactive blur */}
      <div className="flex flex-wrap items-center gap-3">
        {variants.map((v) => {
            const isSelected = selectedVariant?.id === v.id;
            const isHovered = hoveredVariant?.id === v.id;
            return (<div key={v.id} className="relative group">
              <button type="button" onClick={() => onSelectVariant(v)} onMouseEnter={() => setHoveredVariant(v)} onMouseLeave={() => setHoveredVariant(null)} aria-label={v.name} className={`relative flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-300 ${isSelected
                    ? 'border-sage-dark bg-white shadow-soft scale-102 ring-1 ring-sage-dark'
                    : 'border-sage-soft/60 bg-white/70 filter blur-[0.7px] opacity-75 hover:blur-none hover:opacity-100 hover:border-sage-primary'}`}>
                {/* Circular Color/Icon swatch */}
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-black/10 shadow-sm transition-transform group-hover:scale-110" style={{
                    backgroundColor: v.value.startsWith('#') ? v.value : '#789575',
                }}>
                  {isSelected && <Check className="w-3 h-3 text-white drop-shadow"/>}
                </span>

                <div className="text-left">
                  <span className="block text-xs font-semibold text-sage-dark leading-tight">
                    {v.name}
                  </span>
                  <span className="block text-[10px] text-sage-muted">
                    Rs. {(v.salePrice || v.price).toLocaleString()}
                  </span>
                </div>
              </button>

              {/* Floating Tooltip displaying SKU and Stock info */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                <div className="bg-sage-dark text-sage-ivory text-[10px] py-1 px-2.5 rounded-lg whitespace-nowrap shadow-float font-medium">
                  {v.sku} • {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                </div>
              </div>
            </div>);
        })}
      </div>
    </div>);
};
export default VariantSelector;
