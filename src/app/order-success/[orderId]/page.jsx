import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb/mongoose';
import Order from '@/models/Order';
import { CheckCircle2, Truck, Banknote, Package } from 'lucide-react';
export const dynamic = 'force-dynamic';
export default async function OrderSuccessPage({ params }) {
    await connectDB();
    const { orderId } = await params;
    let orderDoc = null;
    try {
        orderDoc = await Order.findById(orderId).lean();
    }
    catch (e) {
        orderDoc = await Order.findOne({ orderNumber: orderId }).lean();
    }
    if (!orderDoc) {
        notFound();
    }
    const order = JSON.parse(JSON.stringify(orderDoc));
    const estDate = order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        })
        : '2-4 business days';
    return (<div className="bg-sage-ivory min-h-screen py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sage-soft/50 shadow-float text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10"/>
          </div>

          <span className="text-xs font-semibold text-sage-primary uppercase tracking-widest block mb-1">
            Order Confirmed & Queued for Packing
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal">
            Thank You for Your Order!
          </h1>

          <p className="text-sm text-sage-muted mt-2 max-w-md mx-auto font-light leading-relaxed">
            Your Cash on Delivery parcel is currently being carefully hand-packaged in our botanical atelier.
          </p>

          {/* Key Reference Information */}
          <div className="mt-8 p-6 rounded-2xl bg-sage-bg/30 border border-sage-soft/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-sage-muted tracking-wider block">
                Order Number
              </span>
              <span className="font-mono text-sm font-bold text-sage-dark">
                {order.orderNumber}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-sage-muted tracking-wider block">
                Payment Method
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center space-x-1 mt-0.5">
                <Banknote className="w-3.5 h-3.5"/>
                <span>Cash on Delivery</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-sage-muted tracking-wider block">
                Estimated Delivery
              </span>
              <span className="text-xs font-semibold text-sage-dark flex items-center space-x-1 mt-0.5">
                <Truck className="w-3.5 h-3.5 text-sage-primary"/>
                <span>{estDate}</span>
              </span>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="mt-8 text-left border-t border-sage-soft/30 pt-6 space-y-4">
            <h3 className="font-serif text-base text-sage-dark font-semibold">
              Delivery Destination
            </h3>
            <div className="text-xs text-sage-dark/80 bg-sage-soft/20 p-4 rounded-xl space-y-1">
              <p className="font-semibold text-sage-dark">{order.customerDetails.name} ({order.customerDetails.phone})</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              {order.shippingAddress.notes && (<p className="text-sage-muted italic pt-1">Note: {order.shippingAddress.notes}</p>)}
            </div>
          </div>

          {/* Items Purchased */}
          <div className="mt-8 text-left border-t border-sage-soft/30 pt-6">
            <h3 className="font-serif text-base text-sage-dark font-semibold mb-4">
              Items in Parcel ({order.items.length})
            </h3>
            <div className="divide-y divide-sage-soft/30">
              {order.items.map((item, idx) => (<div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sage-soft/20 shrink-0">
                      <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover"/>
                    </div>
                    <div>
                      <h4 className="font-medium text-sage-dark">{item.title}</h4>
                      <p className="text-[11px] text-sage-muted">{item.variantName} × {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sage-dark">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>))}
            </div>

            <div className="pt-4 border-t border-sage-soft/30 space-y-1.5 text-xs">
              <div className="flex justify-between text-sage-muted">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (<div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount</span>
                  <span>- Rs. {order.discount.toLocaleString()}</span>
                </div>)}
              <div className="flex justify-between text-sage-muted">
                <span>Courier Charges</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-sage-dark pt-2 border-t border-sage-soft/40">
                <span>Payable Cash upon Arrival</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Next steps buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/account?tab=orders" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-soft flex items-center justify-center space-x-2">
              <Package className="w-4 h-4"/>
              <span>Track Order Progress</span>
            </Link>

            <Link href="/shop" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white border border-sage-soft hover:bg-sage-soft/30 text-sage-dark font-semibold text-xs uppercase tracking-wider transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
