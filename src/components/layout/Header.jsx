'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const { openCart, totalItems, cartBounce } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Collections',
      href: '/shop',
      children: [
        { name: 'All Luxury Drops', href: '/shop' },
        { name: 'Designer Clothes', href: '/category/clothes' },
        { name: 'Swiss Watches', href: '/category/watches' },
      ],
    },
    { name: 'About', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-sage-ivory/98 backdrop-blur-xl shadow-soft-sm py-3'
            : 'bg-sage-bg/98 backdrop-blur-md py-3.5 border-b border-sage-soft/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Flexible Bar: Left Nav | Center Logo | Right Icons (No Overlap) */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">

            {/* LEFT: Mobile hamburger + Compact Desktop Nav links */}
            <div className="flex items-center min-w-0">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sage-dark hover:text-sage-primary transition-colors focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Desktop Nav: Clean Luxury 4-Item Bar */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 whitespace-nowrap">
                {navLinks.map((link) =>
                  link.children ? (
                    <div key={link.name} className="relative group">
                      <button className="flex items-center space-x-1 text-[11px] xl:text-xs uppercase tracking-widest font-semibold text-sage-dark/80 hover:text-sage-primary transition-colors py-2 px-1">
                        <span>{link.name}</span>
                        <ChevronDown className="w-3 h-3 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                      <div className="absolute top-full left-0 w-60 pt-2 hidden group-hover:block z-50">
                        <div className="bg-sage-ivory shadow-float rounded-2xl p-2.5 border border-sage-soft/50 backdrop-blur-xl">
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="block px-3 py-2 text-[11px] tracking-wider uppercase text-sage-dark/80 hover:text-sage-primary hover:bg-sage-soft/30 rounded-xl transition-colors"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-[11px] xl:text-xs uppercase tracking-widest font-semibold transition-colors hover:text-sage-primary relative group py-2 px-1 ${
                        pathname === link.href ? 'text-sage-primary font-bold' : 'text-sage-dark/75'
                      }`}
                    >
                      {link.name}
                      <span className={`absolute bottom-0 left-1 right-1 h-[1.5px] bg-sage-primary transition-all duration-300 ${pathname === link.href ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </Link>
                  )
                )}
              </nav>
            </div>

            {/* CENTER: Brand Logo — shrink-0 with breathing room */}
            <div className="shrink-0 px-2 sm:px-4 text-center">
              <Link href="/" className="inline-block group text-center whitespace-nowrap">
                <span className="block font-serif text-lg sm:text-2xl md:text-[1.55rem] tracking-[0.16em] sm:tracking-[0.22em] font-normal text-sage-dark group-hover:text-sage-primary transition-colors leading-none">
                  VOGUE ATELIER
                </span>
                <span className="block text-[7px] sm:text-[7.5px] tracking-[0.24em] sm:tracking-[0.32em] text-sage-muted uppercase mt-0.5 font-medium">
                  CLOTHES • WATCHES
                </span>
              </Link>
            </div>

            {/* RIGHT: Actions (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center justify-end space-x-1 sm:space-x-2 shrink-0">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-sage-dark/80 hover:text-sage-primary transition-colors focus:outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/account?tab=wishlist"
                className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-sage-dark/80 hover:text-sage-primary transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sage-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalWishlist}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Icon with animated bounce */}
              <button
                id="header-cart-icon"
                onClick={openCart}
                className={`p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-sage-dark hover:text-sage-primary transition-all relative ${
                  cartBounce ? 'scale-125 text-sage-primary' : 'scale-100'
                }`}
                aria-label={`Shopping Cart with ${totalItems} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-sage-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Account / User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="p-1.5 flex items-center space-x-2 text-sage-dark/80 hover:text-sage-dark rounded-full hover:bg-sage-soft/30 transition-colors"
                      aria-label="Account menu"
                    >
                      <div className="w-7 h-7 rounded-full bg-sage-dark text-sage-ivory flex items-center justify-center text-xs font-bold uppercase">
                        {user.name ? user.name[0] : 'U'}
                      </div>
                    </button>

                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-2xl shadow-float border border-sage-soft/40 p-2 z-50 text-sage-dark"
                        >
                          <div className="px-3 py-2 border-b border-sage-soft/30 mb-1">
                            <p className="text-xs font-semibold text-sage-dark truncate">{user.name}</p>
                            <p className="text-[11px] text-sage-muted truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/account"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-sage-dark/80 hover:text-sage-dark hover:bg-sage-soft/30 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4 text-sage-primary" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            href="/account?tab=orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-sage-dark/80 hover:text-sage-dark hover:bg-sage-soft/30 rounded-xl transition-colors"
                          >
                            <Package className="w-4 h-4 text-sage-primary" />
                            <span>Orders & Tracking</span>
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-sage-primary hover:bg-sage-soft/30 rounded-xl transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Admin Portal</span>
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              logout();
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="p-2 text-sage-dark/80 hover:text-sage-primary transition-colors inline-flex items-center space-x-1"
                    aria-label="Sign In"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-xs font-medium uppercase tracking-wider">
                      Sign In
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Overlay Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-sage-soft/30 bg-sage-ivory/95 px-4 py-4 overflow-hidden"
            >
              <div className="max-w-3xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="relative flex items-center"
                >
                  <Search className="w-5 h-5 absolute left-4 text-sage-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search luxury clothes, Swiss watches..."
                    className="w-full bg-white pl-12 pr-28 py-3 rounded-2xl border border-sage-soft focus:outline-none focus:ring-2 focus:ring-sage-primary text-sm text-sage-dark placeholder-sage-muted shadow-soft-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-4 py-2 bg-sage-primary text-white text-xs font-semibold uppercase rounded-xl hover:bg-sage-dark transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-sage-dark/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-sage-ivory p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-r border-sage-soft/40 text-sage-dark"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-sage-soft/40">
                  <div className="flex flex-col">
                    <span className="font-serif text-xl tracking-[0.16em] text-sage-dark">
                      VOGUE ATELIER
                    </span>
                    <span className="text-[9px] text-sage-muted tracking-widest uppercase">
                      CLOTHES • WATCHES
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full text-sage-dark hover:bg-sage-soft/30 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="py-6 space-y-4">
                  <Link
                    href="/"
                    className="block text-base font-medium text-sage-dark hover:text-sage-primary py-1"
                  >
                    Home
                  </Link>
                  <Link
                    href="/category/clothes"
                    className="block text-base font-medium text-sage-dark hover:text-sage-primary py-1"
                  >
                    Clothes (Hoodies & Outerwear)
                  </Link>
                  <Link
                    href="/category/watches"
                    className="block text-base font-medium text-sage-dark hover:text-sage-primary py-1"
                  >
                    Watches (Swiss Chronographs)
                  </Link>
                  <Link
                    href="/shop"
                    className="block text-base font-semibold text-sage-primary py-1"
                  >
                    Shop All Archive
                  </Link>
                  <Link
                    href="/about"
                    className="block text-base font-medium text-sage-dark/70 hover:text-sage-dark py-1"
                  >
                    About Atelier
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-base font-medium text-sage-dark/70 hover:text-sage-dark py-1"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-sage-soft/40 space-y-3">
                <div className="flex items-center space-x-2 text-xs text-sage-dark/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>100% Cash on Delivery Nationwide</span>
                </div>
                <div className="text-[11px] text-sage-muted">
                  © 2026 VOGUE ATELIER. All rights reserved.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
