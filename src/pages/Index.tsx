import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { useCartSync } from "@/hooks/useCartSync";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import heroCap from "@/assets/hero-cap.jpg";
import { Loader2, Star, Truck, Shield } from "lucide-react";

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
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="font-display text-xl font-black tracking-tight">
            MEGA<span className="text-accent">.</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#shop" className="hover:text-accent transition-colors">Shop</a>
            <a href="#story" className="hover:text-accent transition-colors">Story</a>
            <a href="#values" className="hover:text-accent transition-colors">Europe</a>
          </nav>
          <CartDrawer />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(45_85%_55%/0.25),transparent_50%)]" />
        <div className="container relative grid md:grid-cols-2 gap-10 items-center py-20 md:py-28">
          <div className="text-primary-foreground space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-semibold tracking-widest uppercase">
              <Star className="w-3 h-3 fill-accent" /> United by Pride
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05]">
              Make Europe
              <br />
              <span className="text-accent">Great Again.</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-lg">
              Wear the cap. Wear the continent. A bold statement for a stronger, prouder, united Europe — from Stockholm to Seville.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button onClick={scrollToProducts} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold font-semibold">
                Shop the Collection
              </Button>
              <Button onClick={() => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" })} size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                Our Story
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-accent/20 blur-3xl rounded-full" />
            <img
              src={heroCap}
              alt="MEGA navy and gold embroidered cap — Make Europe Great Again"
              width={1600}
              height={1024}
              className="relative rounded-2xl shadow-elegant w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values bar */}
      <section id="values" className="border-y border-border bg-secondary/40">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          {[
            { icon: Shield, t: "Made in Europe", d: "Ethically produced across the EU" },
            { icon: Truck, t: "Fast EU shipping", d: "Free over €75 within Europe" },
            { icon: Star, t: "Premium quality", d: "Heavyweight cotton, gold embroidery" },
          ].map((v) => (
            <div key={v.t} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                <v.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <div className="font-semibold">{v.t}</div>
                <div className="text-sm text-muted-foreground">{v.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="container py-20">
        <div className="text-center mb-12 space-y-3">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">The Collection</span>
          <h2 className="font-display text-4xl md:text-5xl font-black">Caps with a continent behind them</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Limited drops. Crafted for those who believe in a stronger, united Europe.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-secondary/30">
            <h3 className="font-display text-2xl font-bold mb-2">No products yet</h3>
            <p className="text-muted-foreground">
              Hey, we noticed you don't have any products yet. Create one by telling me what the product is and the price
              (e.g. "Add a navy MEGA cap for €39").
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Story */}
      <section id="story" className="bg-primary text-primary-foreground py-20">
        <div className="container max-w-3xl text-center space-y-6">
          <span className="text-accent text-xs font-bold tracking-widest uppercase">Our Story</span>
          <h2 className="font-display text-4xl md:text-5xl font-black">For a Europe that stands tall.</h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">
            MEGA is a tribute to everything that makes Europe, Europe — shared history, shared values, and the belief
            that our best chapters aren't behind us. From Sweden to Spain, Germany to Greece, France to Ireland: one continent, one spirit.
          </p>
          <p className="text-accent font-display text-2xl italic">"Make Europe Great Again."</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} MEGA — Make Europe Great Again.</div>
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
