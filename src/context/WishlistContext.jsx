'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(undefined);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage, then merge/sync with DB if logged in
  useEffect(() => {
    let localItems = [];
    try {
      const saved = localStorage.getItem('sage_wishlist');
      if (saved) {
        localItems = JSON.parse(saved);
        setWishlist(localItems);
      }
    } catch (e) {
      console.error(e);
    }

    // Sync with DB
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.wishlist && data.wishlist.length > 0) {
          setWishlist(data.wishlist);
          try {
            localStorage.setItem('sage_wishlist', JSON.stringify(data.wishlist));
          } catch (e) {}
        } else if (localItems.length > 0) {
          // Sync local items to DB if user is authenticated
          fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ syncProducts: localItems.map((p) => p._id) }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      let updated;
      if (exists) {
        updated = prev.filter((p) => p._id !== product._id);
      } else {
        updated = [...prev, product];
      }
      try {
        localStorage.setItem('sage_wishlist', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Background sync to MongoDB API
    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product._id }),
    }).catch(() => {});
  };

  const isInWishlist = (productId) => {
    return wishlist.some((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
