'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
export const ImageHotspotsViewer = ({ image, productName, hotspots = [], }) => {
    const [activeHotspot, setActiveHotspot] = useState(null);
    return (<div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-sage-soft/20 border border-sage-soft/40 shadow-soft group select-none">
      {/* Product Image */}
      <div className="relative w-full h-full">
        <Image src={image} alt={productName} fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-103"/>
      </div>

      {/* Hotspots clickable points */}
      {hotspots.map((spot) => {
            const isCurrent = activeHotspot?.id === spot.id;
            return (<div key={spot.id} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 z-20">
            <button onClick={() => setActiveHotspot(isCurrent ? null : spot)} className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-float focus:outline-none ${isCurrent
                    ? 'bg-sage-dark text-sage-ivory scale-125 ring-4 ring-sage-primary/40'
                    : 'bg-white/90 text-sage-primary hover:bg-sage-primary hover:text-white hover:scale-110 hotspot-pulse'}`} aria-label={`Inspect ${spot.partName}`}>
              <Sparkles className="w-4 h-4"/>
            </button>

            {/* Micro tooltip label on hover */}
            {!isCurrent && (<span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden md:group-hover:inline-block pointer-events-none whitespace-nowrap px-2.5 py-1 rounded-lg bg-sage-dark/90 text-white text-[11px] font-medium tracking-wide shadow-md backdrop-blur-sm">
                {spot.partName}
              </span>)}
          </div>);
        })}

      {/* Floating Interactive Popup directly over the image */}
      <AnimatePresence>
        {activeHotspot && (<motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.25 }} className="absolute bottom-4 inset-x-4 md:inset-x-6 z-30 glass-panel rounded-2xl p-5 shadow-float border border-sage-soft/60 backdrop-blur-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-md bg-sage-primary text-white">
                  <Sparkles className="w-3.5 h-3.5"/>
                </span>
                <div>
                  <h4 className="font-serif text-base font-semibold text-sage-dark">
                    {activeHotspot.title}
                  </h4>
                  <span className="text-xs text-sage-primary font-medium">
                    {activeHotspot.partName}
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveHotspot(null)} className="p-1 rounded-full text-sage-dark/60 hover:text-sage-dark hover:bg-sage-soft/30 transition-colors" aria-label="Close feature details">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <p className="text-xs text-sage-dark/80 mt-2.5 leading-relaxed">
              {activeHotspot.description}
            </p>

            <div className="mt-3 flex items-start space-x-2 bg-white/70 p-2.5 rounded-xl border border-sage-soft/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5"/>
              <p className="text-[11px] text-sage-dark/90 leading-tight">
                <strong>Botanical Benefit:</strong> {activeHotspot.benefits}
              </p>
            </div>

            {activeHotspot.technicalInfo && (<p className="text-[10px] text-sage-muted mt-2 font-mono">
                Spec: {activeHotspot.technicalInfo}
              </p>)}
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export default ImageHotspotsViewer;
