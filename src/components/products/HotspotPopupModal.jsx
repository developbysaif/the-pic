'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, Info } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
export const HotspotPopupModal = () => {
    const { activeHotspot, closeHotspot } = useModal();
    if (!activeHotspot)
        return null;
    const { hotspot, productTitle, productImage } = activeHotspot;
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeHotspot} className="fixed inset-0 bg-sage-dark/40 backdrop-blur-sm"/>

        {/* Modal Window */}
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 15 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-sage-ivory rounded-3xl shadow-float border border-sage-soft/40 p-6 z-10 overflow-hidden">
          {/* Subtle botanical background aura */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-sage-soft/30 rounded-full blur-2xl pointer-events-none"/>

          {/* Close button */}
          <button onClick={closeHotspot} className="absolute top-4 right-4 p-1.5 rounded-full text-sage-dark/60 hover:text-sage-dark hover:bg-sage-soft/30 transition-colors" aria-label="Close">
            <X className="w-5 h-5"/>
          </button>

          {/* Tag & Product Title */}
          <div className="flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>Interactive Feature Hotspot</span>
          </div>
          <p className="text-xs text-sage-muted mb-4 truncate">{productTitle}</p>

          {/* Part Name & Title */}
          <div className="mb-4">
            <h4 className="font-serif text-2xl text-sage-dark font-medium leading-tight">
              {hotspot.title}
            </h4>
            <span className="inline-block mt-1 px-3 py-1 rounded-full bg-sage-primary/15 text-sage-dark text-xs font-medium">
              {hotspot.partName}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-sage-dark/80 leading-relaxed mb-5">
            {hotspot.description}
          </p>

          {/* Benefits Box */}
          <div className="bg-white/80 rounded-2xl p-4 border border-sage-soft/50 mb-4 shadow-soft-sm">
            <div className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"/>
              <div>
                <p className="text-xs font-bold text-sage-dark uppercase tracking-wider">
                  Key Benefit & Craftsmanship
                </p>
                <p className="text-xs text-sage-dark/80 mt-1 leading-relaxed">
                  {hotspot.benefits}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          {hotspot.technicalInfo && (<div className="flex items-start space-x-2.5 text-xs text-sage-muted bg-sage-soft/20 p-3 rounded-xl border border-sage-soft/30 mb-5">
              <Info className="w-4 h-4 text-sage-primary shrink-0 mt-0.5"/>
              <div>
                <span className="font-semibold text-sage-dark">Technical Specification: </span>
                <span>{hotspot.technicalInfo}</span>
              </div>
            </div>)}

          <div className="flex justify-end pt-2">
            <button onClick={closeHotspot} className="px-5 py-2.5 bg-sage-dark text-sage-ivory text-xs font-semibold rounded-xl hover:bg-sage-primary transition-colors">
              Close Feature Insight
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);
};
export default HotspotPopupModal;
