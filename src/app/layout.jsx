import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ModalProvider } from '@/context/ModalContext';
import { ToastProvider } from '@/context/ToastContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MiniCartDrawer from '@/components/cart/MiniCartDrawer';
import FlyingCartAnimation from '@/components/cart/FlyingCartAnimation';
import QuickViewModal from '@/components/products/QuickViewModal';
import HotspotPopupModal from '@/components/products/HotspotPopupModal';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VOGUE ATELIER | Luxury Clothes & Watches',
    template: '%s | VOGUE ATELIER',
  },
  description:
    'Quiet luxury fashion archive featuring precision Swiss-inspired horology and heavyweight 480 GSM streetwear hoodies. Cash on Delivery across Pakistan.',
  keywords: [
    'luxury clothes',
    'swiss watches pakistan',
    'streetwear hoodie',
    'Cash on Delivery Pakistan',
    'vogue atelier',
    'mens luxury fashion',
  ],
  authors: [{ name: 'VOGUE ATELIER' }],
  creator: 'VOGUE ATELIER',
  publisher: 'VOGUE ATELIER',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VOGUE ATELIER | Luxury Clothes, Watches, Shirts & Slides',
    description:
      'Precision timepieces, heavyweight streetwear, Italian shirting, and architectural cloud slides. Cash on Delivery nationwide across Pakistan.',
    url: siteUrl,
    siteName: 'VOGUE ATELIER',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'VOGUE ATELIER Modern Luxury Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOGUE ATELIER | Modern Luxury Archive',
    description:
      'Precision timepieces, heavyweight streetwear, artisanal shirting, and cloud slides. Cash on Delivery across Pakistan.',
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VOGUE ATELIER',
  url: siteUrl,
  logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  description:
    'Contemporary luxury archive specialising in horology, heavyweight apparel, bespoke shirting, and sculpted footwear.',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+92 300 8472910',
    contactType: 'customer service',
    areaServed: 'PK',
    availableLanguage: ['English', 'Urdu'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-sage-ivory text-sage-dark antialiased selection:bg-sage-primary selection:text-sage-ivory"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ModalProvider>
                <ToastProvider>
                  <AnnouncementBar />
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />

                  {/* Global Overlays & Modals */}
                  <MiniCartDrawer />
                  <FlyingCartAnimation />
                  <QuickViewModal />
                  <HotspotPopupModal />
                </ToastProvider>
              </ModalProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
