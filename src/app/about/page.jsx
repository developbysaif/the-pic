import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Leaf, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
export default function AboutPage() {
    return (<div className="bg-sage-ivory min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>The Botanical Philosophy</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-sage-dark font-normal leading-tight">
            Elevating Classical Herbalism into Modern Sensory Alchemy
          </h1>
          <p className="text-base text-sage-dark/80 mt-4 font-light leading-relaxed">
            Founded with a reverence for wild alpine sage, sustainable agroforestry, and non-toxic formulation. Handcrafted for patrons who seek quiet, uncompromising luxury.
          </p>
        </div>

        {/* Narrative & Visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-float border border-sage-soft/40">
            <Image src="/images/products/serum-main.jpg" alt="Botanical Serum Studio" fill className="object-cover"/>
          </div>

          <div className="space-y-5 text-sm text-sage-dark/80 leading-relaxed font-light">
            <h2 className="font-serif text-2xl text-sage-dark font-normal">
              Purity in Every Cold-Pressed Drop
            </h2>
            <p>
              In our formulation laboratory, we discard synthetic texturizers, parabens, artificial fragrances, and micro-plastics. Every essence begins with wild-harvested salvia officinalis leaves distilled alongside pristine mountain waters.
            </p>
            <p>
              We pair this bioactive herbal heart with biocompatible squalane and plant ceramides that mirror the human skin lipid structure, providing profound nourishment without heavy film or congestion.
            </p>
            <div className="pt-2">
              <Link href="/shop" className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-sage-dark hover:bg-sage-primary text-white text-xs font-semibold transition-colors">
                <span>Explore Formulations</span>
                <ArrowRight className="w-3.5 h-3.5"/>
              </Link>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-sage-soft/30">
          <div className="glass-panel p-6 rounded-3xl border border-sage-soft/40">
            <Leaf className="w-6 h-6 text-sage-primary mb-3"/>
            <h3 className="font-serif text-lg text-sage-dark font-medium mb-1">Cold Extraction</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Supercritical CO2 extraction preserves volatile terpenes and antioxidants that heat processes destroy.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-sage-soft/40">
            <ShieldCheck className="w-6 h-6 text-sage-primary mb-3"/>
            <h3 className="font-serif text-lg text-sage-dark font-medium mb-1">Cash on Delivery</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Serving our clients across Pakistan with 100% door-to-door cash collection and parcel inspection guarantee.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-sage-soft/40">
            <Heart className="w-6 h-6 text-sage-primary mb-3"/>
            <h3 className="font-serif text-lg text-sage-dark font-medium mb-1">Heirloom Vessels</h3>
            <p className="text-xs text-sage-muted leading-relaxed">
              Heavy frosted glass and natural bamboo lids engineered for lasting vanity beauty and endless re-use.
            </p>
          </div>
        </div>
      </div>
    </div>);
}
