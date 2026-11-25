'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles } from 'lucide-react';
export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (name && message) {
            setSubmitted(true);
        }
    };
    return (<div className="bg-sage-ivory min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5"/>
            <span>Client Concierge</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-normal">
            Connect with Our Atelier Concierge
          </h1>
          <p className="text-xs sm:text-sm text-sage-muted mt-2 font-light leading-relaxed">
            For Swiss timepiece horology inquiries, garment sizing consultations, order tracking, or Cash on Delivery assistance across Pakistan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-8 border border-sage-soft/40 shadow-soft space-y-6">
              <h3 className="font-serif text-xl text-sage-dark font-medium">
                VOGUE ATELIER Flagship
              </h3>

              <div className="space-y-4 text-xs text-sage-dark/80">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-sage-primary shrink-0 mt-0.5"/>
                  <div>
                    <span className="font-semibold block text-sage-dark">Flagship Location</span>
                    <span>Suite 501, Vogue Atrium, Gulberg III, Lahore, Punjab, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-sage-primary shrink-0 mt-0.5"/>
                  <div>
                    <span className="font-semibold block text-sage-dark">Telephone & WhatsApp</span>
                    <span>+92 300 8472910</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-sage-primary shrink-0 mt-0.5"/>
                  <div>
                    <span className="font-semibold block text-sage-dark">Electronic Correspondence</span>
                    <span>concierge@vogueatelier.com</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sage-soft/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sage-muted block mb-1">
                  Concierge Operating Hours
                </span>
                <p className="text-xs text-sage-dark/80">
                  Monday – Saturday: 10:00 AM – 8:00 PM PKT
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  Cash on Delivery orders dispatched nationwide within 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage-soft/40 shadow-soft">
              <h3 className="font-serif text-xl text-sage-dark font-medium mb-1">
                Send an Atelier Inquiry
              </h3>
              <p className="text-xs text-sage-muted mb-6 font-light">
                Our client relations team will respond within 4 to 12 business hours.
              </p>

              {submitted ? (<div className="p-6 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-medium space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto"/>
                  <p className="text-sm font-semibold">Thank you for your message, {name}!</p>
                  <p>Our concierge has received your note and will be in touch shortly.</p>
                </div>) : (<form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Your Full Name *
                      </label>
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zainab Ali" className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                        Email Address *
                      </label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. zainab@example.com" className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                      Phone Number (Optional)
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0321 1234567" className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-sage-dark mb-1">
                      Inquiry Details *
                    </label>
                    <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How may our apothecary concierge assist you today?" className="w-full px-4 py-2.5 text-xs rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-1 focus:ring-sage-primary"/>
                  </div>

                  <button type="submit" className="w-full py-3.5 bg-sage-dark hover:bg-sage-primary text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-soft flex items-center justify-center space-x-2">
                    <span>Dispatch Message</span>
                    <Send className="w-3.5 h-3.5"/>
                  </button>
                </form>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
