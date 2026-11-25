'use client';

import React from 'react';
import DestinationHeroSlider from './DestinationHeroSlider';

export const HeroSection = ({ featuredProduct, products = [] }) => {
  return <DestinationHeroSlider products={products} />;
};

export default HeroSection;
