import Link from 'next/link';
import { ArrowLeft, Compass, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-sage-ivory">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-sage-soft/30 flex items-center justify-center text-sage-primary">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-semibold tracking-widest text-sage-primary">
            404 — Formulation Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-sage-dark font-medium">
            Lost in the Botanical Garden
          </h1>
          <p className="text-sm text-sage-dark/70">
            The botanical elixir or page you are seeking might have been retired, renamed, or is temporarily out of season.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-sage-dark text-sage-ivory hover:bg-sage-primary text-xs uppercase tracking-wider font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full border border-sage-dark/20 text-sage-dark hover:bg-sage-dark/5 text-xs uppercase tracking-wider font-medium transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
