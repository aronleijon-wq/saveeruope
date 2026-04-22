import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Plus, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartSync } from "@/hooks/useCartSync";
import { useCartStore } from "@/stores/cartStore";
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import euFlag from "@/assets/eu-flag.webp";

type ProductNode = ShopifyProduct["node"];

const Product = () => {
  useCartSync();
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ProductNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!handle) return;
    (async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
        const p = data?.data?.product;
        setProduct(p || null);
        if (p?.options) {
          const initial: Record<string, string> = {};
          p.options.forEach((o: { name: string; values: string[] }) => {
            initial[o.name] = o.values[0];
          });
          setSelected(initial);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  const variant = useMemo(() => {
    if (!product) return null;
    const variants = product.variants.edges.map((e) => e.node);
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value)
      ) || variants[0]
    );
  }, [product, selected]);

  const isPending = useCartStore((s) => s.isPending(variant?.id || ""));

  const images = product?.images.edges.map((e) => e.node) || [];

  const handleAdd = async () => {
    if (!variant || !product) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success("Added to cart", { position: "top-center" });
    await addItem({
      product: { node: product } as ShopifyProduct,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-[0.2em] uppercase">
            <img src={euFlag} alt="MEGA" className="h-7 w-auto rounded-sm shadow-sm" />
            Mega
          </Link>
          <CartDrawer />
        </div>
      </header>

      <main className="container py-10 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to collection
        </Link>

        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !product ? (
          <div className="max-w-xl mx-auto text-center py-20 border border-border">
            <h1 className="font-display text-2xl font-semibold mb-2">Product not found</h1>
            <p className="text-sm text-muted-foreground">It may have been removed or renamed.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery */}
            <div className="space-y-4 animate-fade-in">
              <div className="relative aspect-square bg-secondary overflow-hidden rounded-xl group">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage].url}
                    alt={images[activeImage].altText || product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur text-[10px] font-semibold uppercase tracking-[0.2em]">
                  <Sparkles className="w-3 h-3" /> Limited
                </div>
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square overflow-hidden rounded-md border-2 transition-all ${
                        i === activeImage ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-7 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground">MEGA Collection</p>
                <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">{product.title}</h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {variant?.price.currencyCode} {parseFloat(variant?.price.amount || "0").toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">incl. VAT</span>
                </div>
              </div>

              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description || "A statement piece for those who stand tall. Crafted in the EU with care."}
              </p>

              {/* Options */}
              {product.options
                .filter((o) => !(o.values.length === 1 && o.values[0] === "Default Title"))
                .map((option) => (
                  <div key={option.name} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold tracking-wide uppercase text-foreground">
                        {option.name}
                      </span>
                      <span className="text-sm text-muted-foreground">{selected[option.name]}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => {
                        const isActive = selected[option.name] === value;
                        return (
                          <button
                            key={value}
                            onClick={() => setSelected((s) => ({ ...s, [option.name]: value }))}
                            className={`px-4 py-2 text-sm font-medium border rounded-md transition-all ${
                              isActive
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-card hover:border-foreground/40"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

              <Button
                onClick={handleAdd}
                disabled={!variant?.availableForSale || isPending}
                size="lg"
                className="w-full bg-primary hover:bg-primary-glow active:scale-[0.98] transition-all min-h-[52px] text-base"
              >
                {justAdded ? (
                  <span className="flex items-center animate-scale-in">
                    <Check className="w-5 h-5 mr-2" />
                    Added to cart
                  </span>
                ) : isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : !variant?.availableForSale ? (
                  "Sold out"
                ) : (
                  <span className="flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add to cart
                  </span>
                )}
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="flex items-start gap-3 text-sm">
                  <Truck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">Ships from EU</div>
                    <div className="text-muted-foreground text-xs">2–5 business days</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">Crafted in Europe</div>
                    <div className="text-muted-foreground text-xs">Quality you can feel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Product;
