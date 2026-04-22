import { Button } from "@/components/ui/button";
import { Loader2, Plus, Check, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((s) => s.addItem);
  const isPending = useCartStore((s) => s.isPending(product.node.variants.edges[0]?.node?.id || ""));
  const [justAdded, setJustAdded] = useState(false);
  const variant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    toast.success("Added to cart", { position: "top-center" });
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <Link
      to={`/product/${product.node.handle}`}
      className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-elegant hover:-translate-y-1 transition-all duration-500 block"
    >
      <div className="aspect-square bg-secondary overflow-hidden relative">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.node.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[11px] font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
          View <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
            {product.node.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.node.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xl font-bold text-primary">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          <Button
            onClick={handleAdd}
            disabled={!variant?.availableForSale}
            className="bg-primary hover:bg-primary-glow active:scale-95 transition-transform overflow-hidden relative min-w-[90px]"
          >
            {justAdded ? (
              <span className="flex items-center animate-scale-in">
                <Check className="w-4 h-4 mr-1" />
                Added
              </span>
            ) : isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </span>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
};
