'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);
    const [flyingItem, setFlyingItem] = useState(null);
    // Load cart from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('sage_cart');
            if (saved) {
                setItems(JSON.parse(saved));
            }
        }
        catch (e) {
            console.error('Failed to load cart from localStorage', e);
        }
    }, []);
    // Save cart to localStorage and sync with server
    useEffect(() => {
        try {
            localStorage.setItem('sage_cart', JSON.stringify(items));
            // Sync to API in background if user is logged in
            fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            }).catch(() => { });
        }
        catch (e) {
            console.error('Failed to save cart', e);
        }
    }, [items]);
    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);
    const addItem = (item, sourceRect) => {
        if (!item) return;
        const normalizedItem = {
            ...item,
            productId: item.productId || item.id || 'item',
            variantId: item.variantId || item.id || 'default',
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
        };
        if (sourceRect && normalizedItem.image) {
            setFlyingItem({ image: normalizedItem.image, startRect: sourceRect });
        }
        setItems((prev) => {
            const existingIndex = prev.findIndex((i) => (i.productId || i.id) === normalizedItem.productId && (i.variantId || i.id) === normalizedItem.variantId);
            if (existingIndex > -1) {
                const next = [...prev];
                next[existingIndex] = {
                    ...next[existingIndex],
                    quantity: next[existingIndex].quantity + normalizedItem.quantity,
                };
                return next;
            }
            else {
                return [...prev, normalizedItem];
            }
        });
        // Trigger cart badge bounce
        setTimeout(() => {
            setCartBounce(true);
            setTimeout(() => setCartBounce(false), 800);
            setIsOpen(true);
        }, 400);
    };
    const removeItem = (productId, variantId) => {
        setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
    };
    const updateQuantity = (productId, variantId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId, variantId);
            return;
        }
        setItems((prev) => prev.map((i) => i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i));
    };
    const clearCart = () => {
        setItems([]);
    };
    const clearFlyingItem = () => {
        setFlyingItem(null);
    };
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return (<CartContext.Provider value={{
            items,
            isOpen,
            openCart,
            closeCart,
            addItem,
            addToCart: addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            subtotal,
            flyingItem,
            clearFlyingItem,
            cartBounce,
        }}>
      {children}
    </CartContext.Provider>);
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
