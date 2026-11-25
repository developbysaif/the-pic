'use client';
import React, { createContext, useContext, useState } from 'react';
const ModalContext = createContext(undefined);
export const ModalProvider = ({ children }) => {
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const openQuickView = (product) => setQuickViewProduct(product);
    const closeQuickView = () => setQuickViewProduct(null);
    const openHotspot = (hotspot, productTitle, productImage) => {
        setActiveHotspot({ hotspot, productTitle, productImage });
    };
    const closeHotspot = () => setActiveHotspot(null);
    return (<ModalContext.Provider value={{
            quickViewProduct,
            openQuickView,
            closeQuickView,
            activeHotspot,
            openHotspot,
            closeHotspot,
        }}>
      {children}
    </ModalContext.Provider>);
};
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
