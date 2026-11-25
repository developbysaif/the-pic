'use client';
import React from 'react';
import { Printer, X, ShieldCheck, Truck, Package } from 'lucide-react';

export default function PrintableInvoice({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : 'Current';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sage-dark/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-3xl w-full shadow-2xl my-8 border border-sage-soft/50 print:m-0 print:p-6 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Screen Action Bar (hidden in print) */}
        <div className="flex justify-between items-center pb-5 mb-6 border-b border-sage-soft/30 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-lg text-sage-dark font-medium">Official Dispatch Invoice</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sage-soft/50 text-sage-dark">
              COD Receipt
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sage-dark hover:bg-sage-primary text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-soft-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-sage-muted hover:text-sage-dark rounded-xl hover:bg-sage-ivory transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-sage-dark font-sans" id="printable-invoice-content">
          {/* Brand Header */}
          <div className="flex justify-between items-start pb-6 border-b border-sage-soft/40">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-2xl font-bold tracking-wider text-sage-dark uppercase">
                  SAGE & BOTANICA
                </span>
              </div>
              <p className="text-xs text-sage-muted mt-1 italic font-serif">
                Pure Botanical Alchemy • Cold-Pressed Formulations
              </p>
              <p className="text-[11px] text-sage-dark/70 mt-1">
                Lahore, Pakistan • concierge@sageandbotanica.com • +92 300 1234567
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-sage-muted font-bold block">
                Invoice & Consignment
              </span>
              <p className="font-mono text-base font-bold text-sage-dark mt-0.5">
                {order.orderNumber}
              </p>
              <p className="text-xs text-sage-muted mt-1">
                Date: {invoiceDate}
              </p>
              <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Verified Dispatch</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-sage-ivory/60 p-5 rounded-2xl border border-sage-soft/30 text-xs">
            <div>
              <span className="font-serif font-bold text-sage-dark uppercase text-[11px] tracking-wider block mb-2">
                Recipient Patron
              </span>
              <p className="font-semibold text-sage-dark text-sm">{order.customerDetails?.name}</p>
              <p className="text-sage-dark/80 mt-0.5">{order.customerDetails?.email}</p>
              <p className="text-sage-dark/80 mt-0.5">{order.customerDetails?.phone}</p>
            </div>

            <div>
              <span className="font-serif font-bold text-sage-dark uppercase text-[11px] tracking-wider block mb-2">
                Shipping Destination
              </span>
              <p className="text-sage-dark leading-relaxed">
                {order.shippingAddress?.street}
              </p>
              <p className="text-sage-dark font-medium">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
              </p>
              <p className="text-sage-dark/70">{order.shippingAddress?.country || 'Pakistan'}</p>
              {order.shippingAddress?.notes && (
                <p className="text-[11px] text-sage-muted mt-1 italic">
                  Note: {order.shippingAddress.notes}
                </p>
              )}
            </div>
          </div>

          {/* Logistics Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-sage-bg/30 border border-sage-soft/40 text-xs">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-sage-primary" />
              <span className="text-sage-muted">Courier:</span>
              <span className="font-semibold text-sage-dark">{order.courierCompany || 'TCS Express'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-sage-primary" />
              <span className="text-sage-muted">Tracking #:</span>
              <span className="font-mono font-semibold text-sage-dark">{order.trackingNumber || 'Assigned on Dispatch'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sage-muted">Payment:</span>
              <span className="font-bold text-sage-dark uppercase">Cash on Delivery ({order.paymentStatus || 'PENDING'})</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-sage-soft/40 text-sage-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-2">Formulation</th>
                  <th className="py-2.5 px-2">SKU</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-soft/20 text-sage-dark">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-2">
                      <div className="font-medium text-sage-dark">{item.title}</div>
                      <div className="text-[10px] text-sage-muted">{item.variantName}</div>
                    </td>
                    <td className="py-3 px-2 font-mono text-[11px] text-sage-muted">
                      {item.sku || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      Rs. {item.price?.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-end pt-4 border-t border-sage-soft/40">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-sage-dark/80">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal?.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promotional Discount</span>
                  <span>- Rs. {order.discount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sage-dark/80">
                <span>Shipping & Handling</span>
                <span>{order.shippingFee === 0 ? 'Complimentary' : `Rs. ${order.shippingFee?.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sage-soft/40 text-sm font-serif font-bold text-sage-dark">
                <span>Total Payable (COD)</span>
                <span>Rs. {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Botanical Assurance & Footer */}
          <div className="pt-6 border-t border-sage-soft/30 text-center text-[11px] text-sage-muted leading-relaxed">
            <p className="font-serif italic text-sage-dark">
              Thank you for trusting SAGE & BOTANICA with your daily self-care ritual.
            </p>
            <p className="mt-1">
              Please inspect the outer tamper-evident seal upon delivery. Pay exact COD cash of{' '}
              <strong className="text-sage-dark">Rs. {order.total?.toLocaleString()}</strong> to the courier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
