'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Banknote, ShieldCheck, Truck, ArrowRight, Tag, CheckCircle2, AlertCircle, ShoppingBag, } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('Lahore');
    const [state, setState] = useState('Punjab');
    const [postalCode, setPostalCode] = useState('54000');
    const [notes, setNotes] = useState('');
    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    // Submission state
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    // Populate from logged-in user if available
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            if (user.addresses && user.addresses.length > 0) {
                const defAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
                setStreet(defAddr.street || '');
                setCity(defAddr.city || 'Lahore');
                setState(defAddr.state || 'Punjab');
                setPostalCode(defAddr.postalCode || '54000');
                if (defAddr.phone)
                    setPhone(defAddr.phone);
            }
        }
    }, [user]);
    const FREE_SHIPPING_THRESHOLD = 3500;
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 250;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim())
            return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode, subtotal }),
            });
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon({
                    code: data.code,
                    discountAmount: data.discountAmount,
                    message: data.message,
                });
                setCouponError('');
            }
            else {
                setAppliedCoupon(null);
                setCouponError(data.error || 'Invalid coupon code');
            }
        }
        catch (e) {
            setCouponError('Failed to validate coupon code');
        }
        finally {
            setValidatingCoupon(false);
        }
    };
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            setErrorMessage('Your bag is empty.');
            return;
        }
        if (!name || !phone || !street || !city) {
            setErrorMessage('Please fill in your name, phone number, and delivery street address.');
            return;
        }
        setLoading(true);
        setErrorMessage('');
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerDetails: {
                        name,
                        email: email || `${phone.replace(/[^0-9]/g, '')}@guest.sage`,
                        phone,
                    },
                    shippingAddress: {
                        street,
                        city,
                        state,
                        postalCode,
                        country: 'Pakistan',
                        notes,
                    },
                    items,
                    couponCode: appliedCoupon?.code || undefined,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                clearCart();
                router.push(`/order-success/${data.orderId}`);
            }
            else {
                setErrorMessage(data.error || 'Failed to place order. Please review your details.');
            }
        }
        catch (err) {
            setErrorMessage('Network error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    if (items.length === 0) {
        return (<div className="bg-sage-ivory min-h-screen py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-sage-soft/30 flex items-center justify-center text-sage-muted mx-auto mb-4">
            <ShoppingBag className="w-8 h-8"/>
          </div>
          <h2 className="font-serif text-2xl text-sage-dark">Your Bag is Empty</h2>
          <p className="text-xs text-sage-muted mt-2 leading-relaxed">
            Please add at least one botanical formulation to your bag before proceeding to Cash on Delivery checkout.
          </p>
          <Link href="/shop" className="mt-6 inline-block px-8 py-3 rounded-2xl bg-sage-primary text-white text-xs font-semibold uppercase tracking-wider">
            Explore Catalog
          </Link>
        </div>
      </div>);
    }
    return (<div className="bg-sage-ivory min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-3.5 h-3.5"/>
            <span>Secure Cash on Delivery Checkout</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal">
            Finalize Your Botanical Order
          </h1>
          <p className="text-xs text-sage-muted mt-1">
            Zero online payment required. Inspect your parcel upon arrival and pay cash.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Customer Info & Shipping Address Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {errorMessage && (<div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0"/>
                  <span>{errorMessage}</span>
                </div>)}

              {/* Step 1: Customer Details */}
              <div className="bg-white/80 rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-sage-soft/30">
                  <span className="w-7 h-7 rounded-full bg-sage-dark text-sage-ivory flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-serif text-lg text-sage-dark font-semibold">
                    Recipient Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">
                      Full Name *
                    </label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Amina Khan" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">
                      Mobile Phone Number *
                    </label>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0321 4567890" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                    <span className="text-[10px] text-sage-muted mt-0.5 block">
                      Rider will call this number prior to arrival.
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-sage-dark mb-1">
                      Email Address (Optional for invoice)
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. amina@example.com" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div className="bg-white/80 rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-sage-soft/30">
                  <span className="w-7 h-7 rounded-full bg-sage-dark text-sage-ivory flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-serif text-lg text-sage-dark font-semibold">
                    Delivery Address
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">
                      House / Flat / Street Address *
                    </label>
                    <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. House 14-B, Street 7, Phase 5, DHA" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">
                        City *
                      </label>
                      <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lahore" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">
                        Province / State
                      </label>
                      <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Punjab" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sage-dark mb-1">
                        Postal Code
                      </label>
                      <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 54000" className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sage-dark mb-1">
                      Special Delivery Instructions (Optional)
                    </label>
                    <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Please ring bell twice or leave with security reception..." className="w-full px-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method (Cash on Delivery Only) */}
              <div className="bg-white/80 rounded-3xl p-6 sm:p-8 border border-sage-soft/40 shadow-soft space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-sage-soft/30">
                  <span className="w-7 h-7 rounded-full bg-sage-dark text-sage-ivory flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <h3 className="font-serif text-lg text-sage-dark font-semibold">
                    Payment Method
                  </h3>
                </div>

                <div className="p-4 rounded-2xl border-2 border-sage-primary bg-sage-bg/30 flex items-start space-x-3">
                  <input type="radio" id="cod" name="payment" checked readOnly className="mt-1 text-sage-primary focus:ring-sage-primary"/>
                  <div>
                    <label htmlFor="cod" className="font-bold text-xs text-sage-dark flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-sage-primary"/>
                      <span>Cash on Delivery (COD)</span>
                    </label>
                    <p className="text-xs text-sage-dark/80 mt-1 leading-relaxed">
                      You will pay the total payable amount in exact cash directly to the TCS / Leopards courier rider when your parcel is delivered.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="w-full py-4 px-6 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white font-semibold text-sm uppercase tracking-widest transition-all shadow-float flex items-center justify-center space-x-2 disabled:opacity-50">
                <span>{loading ? 'Confirming Order...' : 'Confirm Cash on Delivery Order'}</span>
                <ArrowRight className="w-4 h-4"/>
              </button>
            </form>
          </div>

          {/* Right: Order Summary & Coupon */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-sage-soft/50 shadow-soft space-y-6 sticky top-24">
              <h3 className="font-serif text-xl text-sage-dark pb-3 border-b border-sage-soft/30">
                Order Summary ({items.length} items)
              </h3>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-sage-soft/20 pr-1">
                {items.map((item) => (<div key={`${item.productId}-${item.variantId}`} className="py-3 flex space-x-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-sage-soft/30">
                      <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover"/>
                    </div>
                    <div className="flex-1 text-xs">
                      <h4 className="font-medium text-sage-dark line-clamp-1">{item.title}</h4>
                      <p className="text-sage-muted text-[11px]">{item.variantName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sage-muted">Qty: {item.quantity}</span>
                        <span className="font-semibold text-sage-dark">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>))}
              </div>

              {/* Promo Coupon Form */}
              <div className="pt-4 border-t border-sage-soft/30">
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-sage-muted absolute left-3 top-1/2 -translate-y-1/2"/>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon: WELCOME10 or SAGE500" className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary uppercase"/>
                  </div>
                  <button type="submit" disabled={validatingCoupon} className="px-4 py-2 bg-sage-dark text-white rounded-xl text-xs font-semibold hover:bg-sage-primary transition-colors disabled:opacity-50">
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </form>

                {appliedCoupon && (<div className="mt-2 text-xs text-emerald-700 flex items-center space-x-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5"/>
                    <span>{appliedCoupon.message}</span>
                  </div>)}
                {couponError && (<p className="mt-1 text-xs text-red-600 font-medium">{couponError}</p>)}
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-2 pt-4 border-t border-sage-soft/30 text-xs">
                <div className="flex justify-between text-sage-dark/80">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (<div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- Rs. {discountAmount.toLocaleString()}</span>
                  </div>)}

                <div className="flex justify-between text-sage-dark/80">
                  <span>Express Courier Fee</span>
                  <span>
                    {shippingFee === 0 ? (<span className="text-emerald-700 font-semibold">FREE</span>) : ('Rs. 250')}
                  </span>
                </div>

                <div className="flex justify-between text-base font-serif font-bold text-sage-dark pt-3 border-t border-sage-soft/40">
                  <span>Total Payable at Doorstep</span>
                  <span>Rs. {finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Assurance perks */}
              <div className="p-3 rounded-2xl bg-sage-soft/20 text-[11px] text-sage-dark/80 space-y-1">
                <p className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-primary"/>
                  <span>Inspect outer package condition before accepting</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-sage-primary"/>
                  <span>Courier SMS dispatched with live tracking number</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
