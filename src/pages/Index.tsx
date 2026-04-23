import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { useCartSync } from "@/hooks/useCartSync";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";
import heroCap from "@/assets/hero-cap.webp";
import euFlag from "@/assets/eu-flag.webp";
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
          <a href="/" className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-[0.2em] uppercase">
            <span className="eu-logo">
              <img
                src={euFlag}
                alt="MEGA — Make Europe Great Again"
                className="h-7 w-auto"
                loading="eager"
              />
            </span>
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
          <span className="text-sm text-muted-foreground hidden md:block">Limited drops</span>
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
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              I didn’t start MEGA because I wanted to sell hats. I started it because I was tired of looking around and not recognizing my own home. I was tired of being told by people who don’t live our lives—that our history is a problem and our pride is something we should hide.
            </p>
            <p>
              For years, we’ve watched the suits in distant offices try to blur the lines of who we are. They tell us that borders are just lines on a map and that our traditions don't matter anymore. But they’re wrong.
            </p>
            <p>
              You feel it, don't you? That gut instinct that tells you your country is worth fighting for. That your culture isn't a museum piece it’s your lifeblood.
            </p>
            <p>
              MEGA is for the ones who still give a damn. When you put on that cap, you aren’t just "wearing a brand." You’re sending a message. You’re telling the world that you haven't forgotten where you came from. You’re finding the others, the people who still believe in their flag, their community, and their right to stand tall without asking for permission.
            </p>
            <p>
              We aren't a "market." We’re a movement of people who are finally waking up. From the small towns to the big cities, we’re reclaiming what’s ours. No more apologies. No more backing down.
            </p>
          </div>
          <p className="font-display text-lg italic text-foreground pt-2">"Make Europe Great Again."</p>
        </div>
      </section>

      {/* Flag Showcase — animated marquee */}
      <section className="relative py-20 border-t border-border overflow-hidden bg-gradient-to-b from-background via-accent/20 to-background">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-glow-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative text-center mb-12 space-y-3">
          <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground animate-fade-in">United we stand</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold animate-fade-in">One movement. Many flags.</h2>
        </div>

        <div className="relative flex overflow-hidden mask-fade">
          <div className="flex shrink-0 animate-marquee gap-10 pr-10">
            {[...Array(2)].flatMap((_, dup) =>
              ["🇪🇺","🇸🇪","🇫🇷","🇩🇪","🇮🇹","🇨🇭","🇦🇹","🇳🇱","🇩🇰","🇧🇪","🇬🇧","🇪🇸","🇵🇱"].map((flag, i) => (
                <div
                  key={`r1-${dup}-${i}`}
                  className="group relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 shrink-0"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  <span
                    className="relative text-6xl md:text-7xl animate-float-slow drop-shadow-2xl transition-transform duration-500 group-hover:scale-125 group-hover:animate-flag-wave"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    {flag}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative flex overflow-hidden mask-fade mt-6">
          <div className="flex shrink-0 animate-marquee-reverse gap-10 pr-10">
            {[...Array(2)].flatMap((_, dup) =>
              ["🇵🇱","🇪🇸","🇬🇧","🇧🇪","🇩🇰","🇳🇱","🇦🇹","🇨🇭","🇮🇹","🇩🇪","🇫🇷","🇸🇪","🇪🇺"].map((flag, i) => (
                <div
                  key={`r2-${dup}-${i}`}
                  className="group relative flex items-center justify-center w-24 h-24 md:w-32 md:h-32 shrink-0 opacity-80"
                >
                  <span
                    className="relative text-5xl md:text-6xl animate-float-slow transition-transform duration-500 group-hover:scale-125"
                    style={{ animationDelay: `${i * 150 + 100}ms` }}
                  >
                    {flag}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="relative text-center mt-12">
          <p className="font-display text-lg md:text-xl italic text-foreground/80">
            Wear yours. <span className="text-foreground font-semibold not-italic">Stand tall.</span>
          </p>
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
