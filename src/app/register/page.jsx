'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user);
                router.push('/account');
            }
            else {
                setError(data.error || 'Failed to create account');
            }
        }
        catch (err) {
            setError('Connection error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="bg-sage-ivory min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage-soft/50 shadow-float">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5"/>
              <span>Join The Circle</span>
            </div>
            <h1 className="font-serif text-3xl text-sage-dark font-normal">
              Create Your Account
            </h1>
            <p className="text-xs text-sage-muted mt-2 font-light">
              Enjoy order tracking, seamless Cash on Delivery, and exclusive botanical privileges.
            </p>
          </div>

          {error && (<div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0"/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sage-dark mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fatima Tariq" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-dark mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. fatima@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-dark mb-1">
                Mobile Number (For Delivery Confirmation)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0300 1234567" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sage-dark mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-soft flex items-center justify-center space-x-2 disabled:opacity-50 mt-6">
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4"/>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-sage-soft/30 text-center text-xs text-sage-dark/80">
            <span>Already have an account? </span>
            <Link href="/login" className="font-semibold text-sage-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
