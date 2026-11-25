'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Heart, Truck, RotateCcw, Box, Check, Banknote, } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { VariantSelector } from '@/components/products/VariantSelector';
import { ImageHotspotsViewer } from '@/components/products/ImageHotspotsViewer';
import dynamic from 'next/dynamic';
import { ProductCard3D } from '@/components/products/ProductCard3D';

const Product3DViewer = dynamic(() => import('@/components/3d/Product3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square rounded-3xl bg-sage-soft/20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sage-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});
export const ProductDetailView = ({ product, relatedProducts, initialReviews, }) => {
    const router = useRouter();
    const { addItem } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [selectedVariant, setSelectedVariant] = useState(product.variants && product.variants.length > 0 ? product.variants[0] : null);
    const [selectedImage, setSelectedImage] = useState(product.images[0] || '/images/products/serum-main.jpg');
    const [view3D, setView3D] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('benefits');
    // Reviews state
    const [reviews, setReviews] = useState(initialReviews);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewName, setReviewName] = useState('');
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    // Recently viewed products tracking
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const addToCartBtnRef = useRef(null);
    useEffect(() => {
        // Save to recently viewed in localStorage
        try {
            const stored = localStorage.getItem('sage_recently_viewed');
            let list = stored ? JSON.parse(stored) : [];
            list = [product, ...list.filter((p) => p._id !== product._id)].slice(0, 4);
            localStorage.setItem('sage_recently_viewed', JSON.stringify(list));
            setRecentlyViewed(list.filter((p) => p._id !== product._id));
        }
        catch (e) { }
    }, [product]);
    // Pricing & stock
    const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
    const originalPrice = selectedVariant?.salePrice ? selectedVariant.price : product.salePrice ? product.price : null;
    const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    const inWish = isInWishlist(product._id);
    const currentRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : (product.rating || 5);
    const currentReviewsCount = reviews.length > 0 ? reviews.length : (product.reviewsCount || 0);
    // Estimated delivery (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
    const handleVariantChange = (variant) => {
        setSelectedVariant(variant);
        if (variant.image) {
            setSelectedImage(variant.image);
        }
    };
    const handleAddToCart = () => {
        const rect = addToCartBtnRef.current?.getBoundingClientRect() || null;
        addItem({
            productId: product._id,
            variantId: selectedVariant?.id || 'default',
            title: product.name,
            variantName: selectedVariant?.name || 'Standard Edition',
            image: selectedImage,
            price: currentPrice,
            quantity,
            sku: selectedVariant?.sku || product.SKU,
            slug: product.slug,
        }, rect);
    };
    const handleBuyNow = () => {
        handleAddToCart();
        router.push('/checkout');
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewTitle || !reviewComment)
            return;
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product._id,
                    rating: reviewRating,
                    title: reviewTitle,
                    comment: reviewComment,
                    customerName: reviewName || 'Botanical Patron',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setReviews([data.review, ...reviews]);
                setReviewSuccess(true);
                setReviewTitle('');
                setReviewComment('');
                setReviewName('');
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setSubmittingReview(false);
        }
    };
    return (<div className="bg-sage-ivory py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-sage-muted mb-8">
          <Link href="/" className="hover:text-sage-dark transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-sage-dark transition-colors">
            Apothecary
          </Link>
          <span>/</span>
          {typeof product.category === 'object' && (<>
              <Link href={`/category/${product.category.slug}`} className="hover:text-sage-dark transition-colors">
                {product.category.name}
              </Link>
              <span>/</span>
            </>)}
          <span className="text-sage-dark font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Column: Image Gallery & Hotspots / 3D */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage */}
            <div className="relative">
              {/* 3D Model vs Studio Photo Toggle */}
              {product.model3D?.enabled && (<div className="absolute top-4 right-4 z-30 flex items-center p-1 rounded-2xl glass-panel shadow-soft border border-sage-soft/60">
                  <button onClick={() => setView3D(false)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${!view3D
                ? 'bg-sage-dark text-white shadow-sm'
                : 'text-sage-dark/70 hover:text-sage-dark'}`}>
                    Interactive Photo
                  </button>
                  <button onClick={() => setView3D(true)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 ${view3D
                ? 'bg-sage-primary text-white shadow-sm'
                : 'text-sage-dark/70 hover:text-sage-dark'}`}>
                    <Box className="w-3.5 h-3.5"/>
                    <span>3D Model</span>
                  </button>
                </div>)}

              {view3D ? (<div className="w-full aspect-square rounded-3xl bg-sage-soft/20 border border-sage-soft/40 flex items-center justify-center overflow-hidden">
                  <Product3DViewer color={selectedVariant?.value || product.model3D?.color || '#789575'} shape={product.model3D?.shape || 'serum'} className="w-full h-full"/>
                </div>) : (<ImageHotspotsViewer image={selectedImage} productName={product.name} hotspots={product.hotspots}/>)}

              {discountPercent > 0 && (<span className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-sage-dark text-white text-xs font-bold tracking-wider uppercase shadow-md">
                  Save {discountPercent}%
                </span>)}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (<button key={idx} onClick={() => {
                setView3D(false);
                setSelectedImage(img);
            }} className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${!view3D && selectedImage === img
                ? 'border-sage-dark ring-2 ring-sage-primary/40 scale-105'
                : 'border-sage-soft/60 opacity-70 hover:opacity-100'}`}>
                  <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover"/>
                </button>))}
            </div>
          </div>

          {/* Right Column: Product Info & Purchasing */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-semibold text-sage-primary tracking-widest">
                  {typeof product.category === 'object' ? product.category.name : 'Botanical Ritual'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(Number(currentRating)) ? 'fill-current' : 'text-sage-soft'}`}/>))}
                  </div>
                  <span className="text-xs font-semibold text-sage-dark">
                    {currentRating} ({currentReviewsCount} reviews)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-sage-muted font-mono mt-1">
                SKU: {selectedVariant?.sku || product.SKU}
              </p>
            </div>

            {/* Price section */}
            <div className="p-4 rounded-2xl bg-white/70 border border-sage-soft/40 shadow-soft-sm flex items-center justify-between">
              <div>
                <div className="flex items-baseline space-x-3">
                  <span className="font-serif text-3xl font-bold text-sage-dark">
                    Rs. {currentPrice.toLocaleString()}
                  </span>
                  {originalPrice && (<span className="text-sm text-sage-muted line-through font-light">
                      Rs. {originalPrice.toLocaleString()}
                    </span>)}
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  ✓ Cash on Delivery (COD) Eligible Across Pakistan
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentStock > 0
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-red-100 text-red-800'}`}>
                  {currentStock > 0 ? `${currentStock} in stock` : 'Sold out'}
                </span>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-sage-dark/80 leading-relaxed font-light">
              {product.shortDescription || product.description}
            </p>

            {/* Variant Selector with soft blur on unselected options */}
            <div className="p-4 rounded-2xl bg-white/50 border border-sage-soft/30">
              <VariantSelector variants={product.variants} selectedVariant={selectedVariant} onSelectVariant={handleVariantChange}/>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                {/* Quantity */}
                <div className="flex items-center border border-sage-soft rounded-2xl bg-white px-3 py-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 text-sage-dark hover:text-sage-primary text-base font-bold">
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-sage-dark min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-2 text-sage-dark hover:text-sage-primary text-base font-bold">
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button ref={addToCartBtnRef} onClick={handleAddToCart} disabled={currentStock <= 0} className="flex-1 flex items-center justify-center space-x-2 py-4 px-6 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-soft disabled:opacity-50">
                  <ShoppingBag className="w-4 h-4"/>
                  <span>Add to Bag</span>
                </button>

                {/* Wishlist toggle */}
                <button onClick={() => toggleWishlist(product)} className={`p-4 rounded-2xl border transition-colors ${inWish
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-white border-sage-soft text-sage-dark hover:bg-sage-soft/30'}`} aria-label="Wishlist">
                  <Heart className={`w-5 h-5 ${inWish ? 'fill-current' : ''}`}/>
                </button>
              </div>

              {/* Buy Now (Direct to COD Checkout) */}
              <button onClick={handleBuyNow} disabled={currentStock <= 0} className="w-full py-4 rounded-2xl bg-sage-dark hover:bg-black text-sage-ivory font-semibold text-xs uppercase tracking-widest transition-all shadow-float disabled:opacity-50 flex items-center justify-center space-x-2">
                <Banknote className="w-4 h-4 text-sage-bg"/>
                <span>Buy Now with Cash on Delivery</span>
              </button>
            </div>

            {/* Delivery Guarantee Strip */}
            <div className="p-4 rounded-2xl bg-sage-bg/30 border border-sage-soft/40 space-y-2.5 text-xs text-sage-dark">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-sage-primary shrink-0"/>
                <span>
                  Estimated delivery by <strong className="text-sage-dark">{formattedDeliveryDate}</strong> via TCS Express.
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Banknote className="w-4 h-4 text-sage-primary shrink-0"/>
                <span>Pay cash upon parcel inspection at your address.</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-sage-primary shrink-0"/>
                <span>30-Day Hassle-Free Returns on unopened bottles.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs: Specifications, Benefits, How to Use, Ingredients, Shipping */}
        <div className="mb-24">
          <div className="border-b border-sage-soft/40 flex items-center space-x-8 overflow-x-auto pb-4 mb-8">
            {[
            { id: 'benefits', label: 'Botanical Benefits' },
            { id: 'specs', label: 'Specifications & Potency' },
            { id: 'usage', label: 'Ritual & How To Use' },
            { id: 'ingredients', label: 'Full Ingredient List' },
            { id: 'shipping', label: 'COD Delivery & Returns' },
        ].map((tab) => (<button key={tab.id} 
                onClick={() => setActiveTab(tab.id)} className={`text-sm font-semibold whitespace-nowrap transition-colors pb-2 relative ${activeTab === tab.id
                ? 'text-sage-primary'
                : 'text-sage-muted hover:text-sage-dark'}`}>
                <span>{tab.label}</span>
                {activeTab === tab.id && (<span className="absolute bottom-0 inset-x-0 h-0.5 bg-sage-primary rounded-full"/>)}
              </button>))}
          </div>

          <div className="bg-white/80 rounded-3xl p-8 border border-sage-soft/40 shadow-soft">
            {activeTab === 'benefits' && (<div className="space-y-6">
                <h3 className="font-serif text-2xl text-sage-dark">
                  Targeted Restorative Actions
                </h3>
                <p className="text-sm text-sage-dark/80 leading-relaxed font-light">
                  {product.description}
                </p>
                {product.features && product.features.length > 0 && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {product.features.map((feat, i) => (<div key={i} className="flex items-start space-x-3">
                        <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"/>
                        <span className="text-xs text-sage-dark font-medium">{feat}</span>
                      </div>))}
                  </div>)}
              </div>)}

            {activeTab === 'specs' && (<div className="space-y-4">
                <h3 className="font-serif text-2xl text-sage-dark">
                  Technical Specifications
                </h3>
                <div className="divide-y divide-sage-soft/30 max-w-2xl">
                  {product.specifications?.map((spec, i) => (<div key={i} className="py-3 flex justify-between text-xs">
                      <span className="font-semibold text-sage-dark">{spec.key}</span>
                      <span className="text-sage-muted">{spec.value}</span>
                    </div>))}
                  <div className="py-3 flex justify-between text-xs">
                    <span className="font-semibold text-sage-dark">Active Packaging</span>
                    <span className="text-sage-muted">Recyclable frosted glass & sustainable bamboo</span>
                  </div>
                  <div className="py-3 flex justify-between text-xs">
                    <span className="font-semibold text-sage-dark">Batch Production</span>
                    <span className="text-sage-muted">Handcrafted in small batches of 250 units</span>
                  </div>
                </div>
              </div>)}

            {activeTab === 'usage' && (<div className="space-y-4 max-w-2xl">
                <h3 className="font-serif text-2xl text-sage-dark">
                  The Daily Application Ritual
                </h3>
                <p className="text-sm text-sage-dark/80 leading-relaxed font-light">
                  {product.howToUse ||
                'Warm 3-4 drops between clean palms. Inhale the calming botanical aroma for three conscious breaths, then gently press into clean skin.'}
                </p>
              </div>)}

            {activeTab === 'ingredients' && (<div className="space-y-4 max-w-2xl">
                <h3 className="font-serif text-2xl text-sage-dark">
                  Pure Bioactive Ingredients
                </h3>
                <p className="text-xs font-mono text-sage-dark/80 leading-relaxed bg-sage-bg/30 p-4 rounded-2xl border border-sage-soft/30">
                  {product.ingredients ||
                'Salvia Officinalis (Alpine Sage) Extract, Simmondsia Chinensis (Jojoba) Seed Oil, Olive Squalane, Tocopherol (Natural Vitamin E). 100% Organic and Paraben-free.'}
                </p>
              </div>)}

            {activeTab === 'shipping' && (<div className="space-y-4 max-w-2xl">
                <h3 className="font-serif text-2xl text-sage-dark">
                  Cash on Delivery & Courier Information
                </h3>
                <div className="text-xs text-sage-dark/80 space-y-2 leading-relaxed">
                  <p>
                    <strong>Payment Method:</strong> Cash on Delivery (COD) only. No upfront credit card or debit card needed.
                  </p>
                  <p>
                    <strong>Shipping Fee:</strong> Free for orders over Rs. 3,500. Flat Rs. 250 fee for orders under Rs. 3,500.
                  </p>
                  <p>
                    <strong>Delivery Window:</strong> 2 to 4 business days via TCS or Leopards Courier riders with SMS dispatch tracking.
                  </p>
                  <p>
                    <strong>Returns & Replacements:</strong> 30 days unopened return policy with instant courier pickup.
                  </p>
                </div>
              </div>)}
          </div>
        </div>

        {/* Customer Reviews & Submission */}
        <div className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase font-semibold text-sage-primary tracking-widest">
                Patron Testimonials
              </span>
              <h2 className="font-serif text-3xl text-sage-dark font-normal">
                Customer Reviews ({reviews.length})
              </h2>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <span className="text-3xl font-serif font-bold text-sage-dark">{product.rating}</span>
              <div className="text-xs text-sage-muted">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-sage-soft'}`}/>))}
                </div>
                <span>Based on verified orders</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {reviews.length === 0 ? (<div className="bg-white/60 p-8 rounded-3xl text-center text-xs text-sage-muted border border-sage-soft/30">
                  Be the first patron to share your experience with this formulation.
                </div>) : (reviews.map((rev) => (<div key={rev._id} className="bg-white/90 rounded-2xl p-6 border border-sage-soft/40 shadow-soft-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-sage-soft'}`}/>))}
                      </div>
                      <span className="text-[10px] text-sage-muted">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-sage-dark mb-1">
                      {rev.title}
                    </h4>
                    <p className="text-xs text-sage-dark/80 leading-relaxed font-light mb-3">
                      {rev.comment}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-sage-muted">
                      <span className="font-medium text-sage-dark">{rev.customerName}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">Verified COD Buyer</span>
                    </div>
                  </div>)))}
            </div>

            {/* Submit Review Form */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-6 border border-sage-soft/50 shadow-soft">
                <h3 className="font-serif text-lg text-sage-dark mb-1">Leave a Review</h3>
                <p className="text-xs text-sage-muted mb-4 font-light">
                  Share your impressions on texture, fragrance, and skin calm.
                </p>

                {reviewSuccess ? (<div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium">
                    ✓ Thank you! Your review has been submitted and published.
                  </div>) : (<form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Your Rating
                      </label>
                      <div className="flex space-x-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (<button type="button" key={star} onClick={() => setReviewRating(star)} className="p-1">
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-sage-soft'}`}/>
                          </button>))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Your Name
                      </label>
                      <input type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="e.g. Fatima Ali" className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Review Title
                      </label>
                      <input type="text" required value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} placeholder="e.g. Sensational texture & immediate hydration" className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Your Experience
                      </label>
                      <textarea required rows={3} value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Describe aroma, packaging, absorption, and results..." className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                    </div>

                    <button type="submit" disabled={submittingReview} className="w-full py-2.5 rounded-xl bg-sage-dark hover:bg-sage-primary text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50">
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>)}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (<div className="mb-20">
            <h2 className="font-serif text-2xl text-sage-dark mb-8">
              Complementary Botanical Rituals
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (<ProductCard3D key={p._id} product={p}/>))}
            </div>
          </div>)}

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (<div className="pt-12 border-t border-sage-soft/30">
            <h2 className="font-serif text-xl text-sage-dark mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((p) => (<ProductCard3D key={p._id} product={p}/>))}
            </div>
          </div>)}
      </div>
    </div>);
};
export default ProductDetailView;
