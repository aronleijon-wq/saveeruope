import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { ShopifyProduct } from "@/lib/shopify";
import { toast } from "sonner";

interface Props {
  product: ShopifyProduct;
}

export const ProductCard = ({ product }: Props) => {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const variant = product.node.variants.edges[0]?.node;
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { position: "top-center" });
  };

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-elegant transition-[var(--transition-smooth)]">
      <div className="aspect-square bg-secondary overflow-hidden">
        {image ? (
          <img
            src={image.url}
            alt={image.altText || product.node.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground leading-tight">{product.node.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.node.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          <span className="text-xl font-bold text-primary">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          <Button onClick={handleAdd} disabled={isLoading || !variant?.availableForSale} className="bg-primary hover:bg-primary-glow">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Add</>}
          </Button>
        </div>
      </div>
    </div>
  );
};
