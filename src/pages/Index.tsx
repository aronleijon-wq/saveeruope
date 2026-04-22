import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { useCartSync } from "@/hooks/useCartSync";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import heroCap from "@/assets/hero-cap.webp";
import { Loader2 } from "lucide-react";

const Index = () => {
  useCartSync();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 24, query: null });
        setProducts(data?.data?.products?.edges || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollToProducts = () => {
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="font-sans text-sm font-semibold tracking-[0.2em] uppercase">
            Mega
          </a>
          <nav className="hidden md:flex items-center gap-10 text-sm text-muted-foreground">
            <a href="#shop" className="hover:text-foreground transition-colors">Shop</a>
            <a href="#story" className="hover:text-foreground transition-colors">Story</a>
          </nav>
          <CartDrawer />
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-8">
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05]">
              Make Europe<br />Great Again.
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              A quiet statement for a stronger, united Europe. Crafted in the EU.
            </p>
            <div className="flex gap-3 pt-2">
              <Button onClick={scrollToProducts} size="lg" className="rounded-none font-medium">
                Shop
              </Button>
              <Button onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="ghost" className="rounded-none font-medium">
                Our story
              </Button>
            </div>
          </div>
          <div>
            <img
              src={heroCap}
              alt="MEGA navy cap — Make Europe Great Again"
              width={1600}
              height={1024}
              className="w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="container py-20 border-t border-border">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl font-bold">The Collection</h2>
          <span className="text-sm text-muted-foreground hidden md:block">Limited drops, made in Europe.</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16 px-6 border border-border">
            <h3 className="font-display text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground">
              Tell me what to add (e.g. "Add a navy MEGA cap for €39").
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Story */}
      <section id="story" className="container py-24 border-t border-border">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold">For a Europe that stands tall.</h2>
          <p className="text-muted-foreground leading-relaxed">
            MEGA is a tribute to shared history and shared values — the belief that Europe's best chapters aren't behind us. From Sweden to Spain, Germany to Greece: one continent, one spirit.
          </p>
          <p className="font-display text-lg italic text-foreground pt-2">"Make Europe Great Again."</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} MEGA</div>
          <div className="flex gap-6">
            <a href="#shop" className="hover:text-foreground transition-colors">Shop</a>
            <a href="#story" className="hover:text-foreground transition-colors">Story</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
