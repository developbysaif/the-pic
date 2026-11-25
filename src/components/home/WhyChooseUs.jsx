'use client';

import React from 'react';
import {
  Banknote,
  ShieldCheck,
  Sparkles,
  Truck,
  RotateCcw,
  Package,
} from 'lucide-react';

export const WhyChooseUs = () => {
  const perks = [
    {
      icon: Banknote,
      title: 'Cash on Delivery Across Pakistan',
      description:
        'Zero risk. Inspect your luxury package at your doorstep anywhere in Pakistan and hand cash directly to the courier.',
    },
    {
      icon: ShieldCheck,
      title: '100% Authentic Horology & Apparel',
      description:
        'Engineered with real aerospace titanium, scratchproof sapphire crystals, custom 480 GSM French terry, and genuine mulberry silk.',
    },
    {
      icon: Package,
      title: 'Bespoke Collector Presentation',
      description:
        'Every timepiece arrives in a weighted velvet-lined collector box, while luxury lawn suits arrive in bespoke gift packaging.',
    },
    {
      icon: Sparkles,
      title: 'Limited Batch Archival Drops',
      description:
        'Our designs are produced in strictly numbered, limited edition quantities to ensure distinct exclusivity for our patrons.',
    },
    {
      icon: Truck,
      title: 'Express Doorstep Courier Delivery',
      description:
        'Complimentary insured express delivery on orders over Rs. 4,500 with real-time SMS tracking updates straight to your mobile.',
    },
    {
      icon: RotateCcw,
      title: '7-Day Easy Exchange Guarantee',
      description:
        'Need an exchange? We arrange seamless, instant courier pickups for quick exchanges with zero hassle.',
    },
  ];

  return (
    <section className="py-24 bg-sage-bg/35 text-sage-dark border-b border-sage-soft/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
            <span>The Atelier Commitment</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-sage-dark">
            Why Discerning Patrons Choose Vogue Atelier
          </h2>
          <p className="text-sm text-sage-dark/75 mt-3 font-light leading-relaxed">
            Where precision Swiss horology and luxury 3-piece embroidered lawn collections converge with effortless quiet luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => {
            const Icon = perk.icon;
            return (
              <div
                key={index}
                className="glass-panel p-8 rounded-3xl border border-sage-soft/50 shadow-soft hover:shadow-float transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-sage-primary/15 text-sage-primary flex items-center justify-center mb-5 group-hover:bg-sage-primary group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg text-sage-dark font-medium mb-2 group-hover:text-sage-primary transition-colors">
                  {perk.title}
                </h3>
                <p className="text-xs text-sage-dark/75 leading-relaxed font-light">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
