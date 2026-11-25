'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const AnnouncementBar = ({
  active = true,
}) => {
  if (!active) return null;

  return (
    <div className="bg-sage-dark text-sage-ivory py-1.5 px-4 border-b border-sage-soft/20 z-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 whitespace-nowrap">

        {/* Left: Brand tagline */}
        <div className="hidden lg:flex items-center space-x-1.5 text-sage-soft/80 shrink-0">
          <Sparkles className="w-3 h-3 text-sage-primary" />
          <span className="text-[10px] tracking-widest font-medium uppercase">VOGUE ATELIER</span>
        </div>

        {/* Center: Scrolling announcements — single line */}
        <div className="flex-1 flex items-center justify-center space-x-1.5 overflow-hidden">
          <Truck className="w-3 h-3 text-sage-soft shrink-0" />
          <span className="text-[10px] tracking-wider font-medium uppercase text-sage-ivory truncate">
            🔥 NEW 2026 ARCHIVE: CLOTHES &amp; WATCHES
            &nbsp;|&nbsp; CASH ON DELIVERY ACROSS PAKISTAN
            &nbsp;|&nbsp; FREE SHIPPING OVER RS. 4,500
          </span>
        </div>

        {/* Right: Quick links */}
        <div className="hidden md:flex items-center space-x-3 text-sage-soft/70 shrink-0">
          <Link href="/shop" className="text-[10px] tracking-widest uppercase hover:text-white transition-colors">
            Catalog
          </Link>
          <span className="text-sage-soft/40">•</span>
          <Link href="/account" className="text-[10px] tracking-widest uppercase hover:text-white transition-colors">
            Track Order
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AnnouncementBar;
