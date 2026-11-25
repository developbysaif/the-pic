'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Welcome to the VIP Atelier Archive.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Could not subscribe at this time.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <section className="py-24 bg-sage-bg/50 text-sage-dark border-b border-sage-soft/30 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-white/80 border border-sage-soft/60 shadow-soft-sm mb-3">
          <Sparkles className="w-3.5 h-3.5 text-sage-primary" />
          <span>VIP Drop Access</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-sage-dark">
          Receive 10% Off Your First Luxury Order
        </h2>

        <p className="text-sm text-sage-dark/80 mt-3 max-w-lg mx-auto font-light leading-relaxed">
          Subscribe to receive early invitations to strictly limited timepieces, heavyweight streetwear drops, and private collector promotional access.
        </p>

        {status === 'success' ? (
          <div className="mt-8 p-4 rounded-2xl bg-white border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-center space-x-2 max-w-md mx-auto shadow-soft">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              {message} (Use code <strong>VOGUE10</strong> at checkout)
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-5 h-5 text-sage-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-sm text-sage-dark placeholder-sage-muted shadow-soft-sm"
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 rounded-2xl bg-sage-dark hover:bg-sage-primary text-sage-ivory font-semibold text-xs uppercase tracking-wider transition-colors shadow-soft flex items-center justify-center space-x-1.5 shrink-0 disabled:opacity-50"
            >
              <span>{status === 'loading' ? 'Joining...' : 'Claim 10% Off'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-xs text-red-600 font-medium">{message}</p>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
