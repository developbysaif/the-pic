'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
export const FlyingCartAnimation = () => {
    const { flyingItem, clearFlyingItem } = useCart();
    const [targetRect, setTargetRect] = useState(null);
    useEffect(() => {
        if (flyingItem) {
            const cartEl = document.getElementById('header-cart-icon');
            if (cartEl) {
                setTargetRect(cartEl.getBoundingClientRect());
            }
        }
        else {
            setTargetRect(null);
        }
    }, [flyingItem]);
    if (!flyingItem || !targetRect)
        return null;
    const startX = flyingItem.startRect.left + flyingItem.startRect.width / 2 - 28;
    const startY = flyingItem.startRect.top + flyingItem.startRect.height / 2 - 28;
    const targetX = targetRect.left + targetRect.width / 2 - 28;
    const targetY = targetRect.top + targetRect.height / 2 - 28;
    return (<AnimatePresence>
      <motion.div initial={{
            position: 'fixed',
            left: startX,
            top: startY,
            width: 56,
            height: 56,
            opacity: 1,
            scale: 1,
            zIndex: 9999,
            pointerEvents: 'none',
        }} animate={{
            left: targetX,
            top: targetY,
            width: 24,
            height: 24,
            opacity: 0.8,
            scale: 0.4,
            rotate: 360,
        }} transition={{
            duration: 0.65,
            ease: [0.2, 0.8, 0.2, 1],
        }} onAnimationComplete={() => {
            clearFlyingItem();
        }} className="rounded-full overflow-hidden shadow-float border-2 border-sage-primary bg-white">
        <Image src={flyingItem.image} alt="Adding to cart" width={56} height={56} className="w-full h-full object-cover"/>
      </motion.div>
    </AnimatePresence>);
};
export default FlyingCartAnimation;
