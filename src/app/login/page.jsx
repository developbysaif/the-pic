'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const { items } = useCart();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    guestCartItems: items,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.user);
                if (data.user.role === 'admin') {
                    router.push('/admin');
                }
                else {
                    router.push('/account');
                }
            }
            else {
                setError(data.error || 'Invalid credentials');
            }
        }
        catch (err) {
            setError('Connection error. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDemoFill = (role) => {
        if (role === 'admin') {
            setEmail('admin@sageandbotanica.com');
            setPassword('admin12345');
        }
        else {
            setEmail('customer@sageandbotanica.com');
            setPassword('customer12345');
        }
    };
    return (<div className="bg-sage-ivory min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sage-soft/50 shadow-float">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 text-sage-primary text-xs font-semibold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5"/>
              <span>Apothecary Portal</span>
            </div>
            <h1 className="font-serif text-3xl text-sage-dark font-normal">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-sage-muted mt-2 font-light">
              Access your order timeline, address book, and private botanical benefits.
            </p>
          </div>

          {error && (<div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0"/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-sage-dark mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. amina@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-sage-dark">Password</label>
                <Link href="/forgot-password" className="text-[11px] text-sage-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-sage-muted absolute left-3.5 top-1/2 -translate-y-1/2"/>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl bg-sage-ivory/50 border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-xs text-sage-dark"/>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-sage-primary hover:bg-sage-accent text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-soft flex items-center justify-center space-x-2 disabled:opacity-50 mt-6">
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4"/>
            </button>
          </form>

          {/* Quick Demo Logins for instant testing */}
          <div className="mt-8 pt-6 border-t border-sage-soft/30 text-center">
            <span className="text-[10px] uppercase font-bold text-sage-muted tracking-wider block mb-2">
              Quick Test Credentials:
            </span>
            <div className="flex justify-center space-x-2">
              <button type="button" onClick={() => handleDemoFill('admin')} className="px-3 py-1.5 rounded-xl bg-sage-dark text-sage-ivory text-[10px] font-semibold hover:bg-sage-primary transition-colors flex items-center space-x-1">
                <Shield className="w-3 h-3 text-sage-bg"/>
                <span>Admin Login</span>
              </button>
              <button type="button" onClick={() => handleDemoFill('customer')} className="px-3 py-1.5 rounded-xl bg-sage-soft/40 text-sage-dark text-[10px] font-semibold hover:bg-sage-soft transition-colors">
                Customer Login
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-sage-dark/80">
            <span>Don&apos;t have an account yet? </span>
            <Link href="/register" className="font-semibold text-sage-primary hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
