import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { listMapProducts } from "@/lib/api/maps";
import type { MapProduct } from "@/shared/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "./ui/separator";
import { getMediaUrl } from "@/lib/fileConvert";

function whatsappUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/[^\d+]/g, "");
  return `https://wa.me/${digits.replace(/^\+/, "")}`;
}

export function MapsContent() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<MapProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listMapProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : t("maps.load_error", "Unable to load maps."));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <h2 className="text-xl text-foreground font-bold uppercase">
          {t("maps.title", "Maps to order")}
        </h2>

        <p className="text-xs text-[#f2b705] uppercase">
          {t("maps.description", "Keep a beautiful paper guide close while you explore Senegal.")}
        </p>
      </div>

      {error && <p className="px-1 text-sm text-destructive">{error}</p>}

      <div className="grid gap-3">
        {products.map((product) => (
          <Card
            key={product.id}
            className="relative pt-0 overflow-hidden"
            size="sm"
          >
            <CardHeader className="relative p-0 gap-0">
              {/* image */}
              {product.images.length > 0 ? (
                <>
                  <div className="absolute w-full h-1/4 aspect-video object-cover" />
                  <img
                    src={getMediaUrl(product.images[0])}
                    alt={product.title}
                    className="w-full aspect-video object-cover"
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="flex items-center z-10 aspect-video w-full justify-center bg-background/50 text-foreground/30">
                  {t("no_image", "No image")}
                </div>
              )}
              {product.images.length > 1 && (
                <Badge className="absolute bottom-2 right-2 bg-background/85 text-foreground backdrop-blur">
                  {product.images.length} {t("maps.images", "images")}
                </Badge>
              )}
              <Separator />
            </CardHeader>
            <CardContent>

              {product.images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <img
                      key={image}
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="size-12 shrink-0 rounded-md object-cover ring-1 ring-border"
                    />
                  ))}
                </div>
              )}
            </CardContent>

            <CardContent>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="font-heading text-base">{product.title}</CardTitle>
                {product.price && <span className="shrink-0 text-sm font-semibold text-primary">{product.price}</span>}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{product.format}</p>
            </CardContent>

            <CardContent>
              <p className="text-sm leading-5 text-muted-foreground">{product.description}</p>
            </CardContent>

            {product.contact && (
              <CardFooter>
                <Button
                  variant="secondary"
                  className="w-full"
                  nativeButton={false}
                  render={
                    <a
                      href={whatsappUrl(product.contact)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  {t("maps.order", "Order this map")}
                  <ExternalLink className="ml-auto size-3.5" aria-hidden="true" />
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {!error && products.length === 0 && (
        <p className="px-1 text-sm text-muted-foreground">{t("maps.empty", "Maps will appear here soon.")}</p>
      )}
    </div>
  );
}
