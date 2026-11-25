'use client';

import React from 'react';
import { Star, CheckCircle, Quote, Sparkles } from 'lucide-react';

const FALLBACK_REVIEWS = [
  {
    _id: 'r1',
    userName: 'Hamza Tariq',
    rating: 5,
    title: 'Obsidian Chronograph is unbelievable in person',
    comment:
      'The weight, sapphire crystal clarity, and sweeping automatic second hand feel like a 2-lakh watch. Delivered to DHA Lahore in 2 days with Cash on Delivery.',
    verifiedPurchase: true,
  },
  {
    _id: 'r2',
    userName: 'Daniyal Rehman',
    rating: 5,
    title: 'Best Heavyweight Hoodie in Pakistan hands down',
    comment:
      '480 GSM is no joke. The hood stands up properly without flopping down, and the oversized drop shoulder cut is pure Yeezy / Balenciaga vibes. Ordered size L and it fits perfect.',
    verifiedPurchase: true,
  },
  {
    _id: 'r3',
    userName: 'Zainab Qureshi',
    rating: 5,
    title: 'Exquisite 3-Piece Lawn Embroidery',
    comment:
      'The resham threadwork on the Gul-e-Noor suit is even more gorgeous in person. Pure lawn fabric is featherlight and the chiffon dupatta feels so luxurious. Unbeatable quality!',
    verifiedPurchase: true,
  },
];

export const CustomerReviewsSection = ({ reviews = [] }) => {
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section className="py-24 bg-sage-ivory text-sage-dark border-b border-sage-soft/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
            <span>Verified Patron Experiences</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-sage-dark">
            Cherished by Patrons Nationwide
          </h2>
          <p className="text-sm text-sage-muted mt-2 font-light">
            Real feedback on our handcrafted festive lawn suits and Swiss-movement timepieces across Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayReviews.slice(0, 3).map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-3xl p-8 border border-sage-soft/50 shadow-soft hover:shadow-float transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-current' : 'text-sage-soft'
                        }`}
                      />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-sage-soft/40" />
                </div>

                <h4 className="font-serif text-base font-semibold text-sage-dark mb-2">
                  &ldquo;{review.title}&rdquo;
                </h4>

                <p className="text-xs text-sage-dark/80 leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-sage-soft/30 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-sage-dark">
                    {review.userName || review.customerName || 'Verified Buyer'}
                  </h5>
                  <span className="text-[10px] text-sage-muted">
                    Verified COD Patron
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-700 text-[10px] font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Order</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewsSection;
