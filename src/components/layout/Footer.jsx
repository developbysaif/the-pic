'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Banknote,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-sage-dark text-sage-ivory pt-16 pb-12 border-t border-sage-soft/20">
      {/* Brand Perks Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-sage-soft/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-sage-primary/20 text-sage-soft">
              <Banknote className="w-6 h-6 text-sage-bg" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white">Cash on Delivery</h4>
              <p className="text-xs text-sage-soft/70 mt-1 leading-relaxed">
                Pay safely in cash when your luxury parcel arrives at your doorstep nationwide in Pakistan.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-sage-primary/20 text-sage-soft">
              <Truck className="w-6 h-6 text-sage-bg" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white">Complimentary Express</h4>
              <p className="text-xs text-sage-soft/70 mt-1 leading-relaxed">
                Free insured courier delivery on all orders above Rs. 4,500.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-sage-primary/20 text-sage-soft">
              <ShieldCheck className="w-6 h-6 text-sage-bg" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white">100% Authentic Quality</h4>
              <p className="text-xs text-sage-soft/70 mt-1 leading-relaxed">
                Grade-5 aerospace titanium, scratchproof sapphire, 480 GSM cotton, and mulberry silk.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-2xl bg-sage-primary/20 text-sage-soft">
              <RotateCcw className="w-6 h-6 text-sage-bg" />
            </div>
            <div>
              <h4 className="font-serif text-base text-white">7-Day Fit Guarantee</h4>
              <p className="text-xs text-sage-soft/70 mt-1 leading-relaxed">
                Effortless size swaps and courier pickups. Your complete satisfaction is guaranteed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-sage-soft/20">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <span className="font-serif text-2xl tracking-[0.2em] font-normal text-white">
                VOGUE ATELIER
              </span>
            </Link>
            <p className="text-xs text-sage-soft/80 leading-relaxed max-w-sm mb-6 font-light">
              A contemporary quiet luxury atelier curating handcrafted Pakistani festive lawn collections and precision Swiss horology.
            </p>
            <div className="flex items-center space-x-3 text-sage-soft">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-sage-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-sage-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="mailto:concierge@vogueatelier.com"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-sage-primary hover:text-white flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h5 className="font-serif text-xs uppercase tracking-widest text-sage-soft font-semibold mb-4">
              Disciplines
            </h5>
            <ul className="space-y-2.5 text-xs text-sage-soft/80">
              <li>
                <Link href="/category/clothes" className="hover:text-white transition-colors">
                  Designer Clothes (Festive Lawn)
                </Link>
              </li>
              <li>
                <Link href="/category/watches" className="hover:text-white transition-colors">
                  Watches (Swiss Chronographs)
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h5 className="font-serif text-xs uppercase tracking-widest text-sage-soft font-semibold mb-4">
              Client Concierge
            </h5>
            <ul className="space-y-2.5 text-xs text-sage-soft/80">
              <li>
                <Link href="/account?tab=orders" className="hover:text-white transition-colors">
                  Track Your Parcel
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Cash on Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="font-serif text-xs uppercase tracking-widest text-sage-soft font-semibold mb-4">
              HQ Flagship
            </h5>
            <div className="space-y-3 text-xs text-sage-soft/80">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-sage-soft shrink-0 mt-0.5" />
                <span>Vogue Atrium, Gulberg III, Lahore, Pakistan</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sage-soft shrink-0" />
                <span>+92 300 8472910</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sage-soft shrink-0" />
                <span>concierge@vogueatelier.com</span>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-sage-primary/30 text-[10px] text-sage-bg uppercase tracking-widest font-semibold border border-sage-primary/40">
                  COD Verified Store
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sage-soft/60">
          <p>© {new Date().getFullYear()} VOGUE ATELIER. All rights reserved. Clothes • Watches.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0 text-[11px]">
            <span>Cash on Delivery Pakistan</span>
            <span>•</span>
            <span>Insured Courier</span>
            <span>•</span>
            <span>100% Authentic</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
