import { connectDB } from '@/lib/mongodb/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Review from '@/models/Review';
import HeroSection from '@/components/home/HeroSection';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import ProductGridSection from '@/components/home/ProductGridSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CustomerReviewsSection from '@/components/home/CustomerReviewsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import InstagramGallery from '@/components/home/InstagramGallery';

// Force dynamic so data is always fresh from MongoDB
export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    await connectDB();
    const categoriesDocs = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    const activeCatIds = categoriesDocs.map((c) => c._id);

    const [productsDocs, reviewsDocs] = await Promise.all([
      Product.find({ status: 'published', category: { $in: activeCatIds } })
        .populate('category', 'name slug')
        .lean(),
      Review.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    // Convert ObjectIds to strings for React serialization
    const categories = JSON.parse(JSON.stringify(categoriesDocs || []));
    const products = JSON.parse(JSON.stringify(productsDocs || []));
    const reviews = JSON.parse(JSON.stringify(reviewsDocs || []));

    const featuredProduct = products.find((p) => p.featured) || products[0] || null;
    const trendingProducts = products.filter((p) => p.trending);
    const bestSellers = products.filter((p) => p.bestSeller);
    const specialOffers = products.filter((p) => p.salePrice && p.salePrice < p.price);

    return {
      categories,
      products,
      featuredProduct,
      trendingProducts: trendingProducts.length > 0 ? trendingProducts : products.slice(0, 4),
      bestSellers: bestSellers.length > 0 ? bestSellers : products.slice(1, 5),
      specialOffers: specialOffers.length > 0 ? specialOffers : products.slice(0, 4),
      reviews,
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      categories: [],
      products: [],
      featuredProduct: null,
      trendingProducts: [],
      bestSellers: [],
      specialOffers: [],
      reviews: [],
    };
  }
}

export default async function HomePage() {
  const {
    categories,
    products,
    featuredProduct,
    trendingProducts,
    bestSellers,
    specialOffers,
    reviews,
  } = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen bg-sage-ivory text-sage-dark">
      {/* 1. Destination Hero Slider with 100% active image, floating preview cards, 3s zoom animation, centered brand name */}
      <HeroSection featuredProduct={featuredProduct} products={products} />

      {/* 2. Featured Pillar Categories: Clothes & Watches */}
      <CategoryShowcase categories={categories} />

      {/* 3. Trending Drops with 3D Tilt Cards and Category Filter Tabs */}
      <ProductGridSection
        title="Trending Archival Drops"
        subtitle="Curated 3-piece embroidered lawn collections and Swiss-inspired luxury chronographs."
        badgeText="Most Coveted"
        products={trendingProducts}
        viewAllLink="/shop?sort=popularity"
        bgClass="bg-sage-ivory"
        showTabs={true}
      />

      {/* 4. Why Choose Us (Atelier Commitments in Sage & Ivory) */}
      <WhyChooseUs />

      {/* 5. Best Sellers */}
      <ProductGridSection
        title="Archival Best Sellers"
        subtitle="Time-tested craftsmanship revered by connoisseurs and collectors nationwide."
        badgeText="Client Favorites"
        products={bestSellers}
        viewAllLink="/shop"
        bgClass="bg-white/70"
      />

      {/* 6. Special Offers / Limited Editions */}
      {specialOffers.length > 0 && (
        <ProductGridSection
          title="Curated Seasonal Offerings"
          subtitle="Strictly limited drops and seasonal pricing on selected luxury essentials."
          badgeText="Limited Editions"
          products={specialOffers}
          viewAllLink="/shop"
          bgClass="bg-sage-ivory"
        />
      )}

      {/* 7. Verified Customer Reviews */}
      <CustomerReviewsSection reviews={reviews} />

      {/* 8. Functional VIP Newsletter Subscription */}
      <NewsletterSection />

      {/* 9. Editorial Lookbook Gallery */}
      <InstagramGallery />
    </div>
  );
}
