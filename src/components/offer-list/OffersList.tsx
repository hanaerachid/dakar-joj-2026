import { useEffect, useState } from "react";
import { MessageCircle, MapPin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listOffers } from "@/lib/api/offers";
import type { Offer } from "@/shared/contracts";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

function whatsappUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/[^\d+]/g, "");
  return `https://wa.me/${digits.replace(/^\+/, "")}`;
}

export function OffersListContent() {
  const { t } = useTranslation()
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listOffers()
      .then((data) => {
        if (!cancelled) setOffers(data);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Unable to load offers");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="offers" className="space-y-2 pt-4">
      <div>
        <h2 className="font-heading text-base font-semibold">Discover Senegal</h2>
        <p className="text-xs text-muted-foreground">Excursions, experiences and local services</p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {offers.map((offer) => {
        const image = offer.images[0] ?? offer.locations[0]?.images[0];
        return (
          <Item
            key={offer.id}
            variant="muted"
            size="default"
          >
            <ItemMedia className="min-w-16 aspect-video rounded-xl" variant="image">
              <img src={image} className=" bg-muted bg-cover bg-center" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle className="font-heading text-sm font-semibold">{offer.title}</ItemTitle>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="secondary">{offer.category}</Badge>
                {offer.tags.map((tag) => <Badge key={tag} variant="outline"><Tag />{tag}</Badge>)}
              </div>
              <ItemDescription className="line-clamp-3 text-xs text-muted-foreground">{offer.description}</ItemDescription>
              {offer.services.length > 0 && (
                <p className="text-xs">{offer.services.join(" · ")}</p>
              )}
              {offer.locations.length > 0 && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />{offer.locations.length} location{offer.locations.length === 1 ? "" : "s"}
                </p>
              )}
            </ItemContent>
            <ItemActions className="flex-col items-center justify-between gap-2">
              <span className="text-xs font-bold text-[var(--accent-color-1)]">{offer.price ?? "Contact us"}</span>
              {offer.whatsapp && (
                <Button
                  variant="secondary"
                  size="sm"
                  nativeButton={false}
                  render={
                    <a
                      href={whatsappUrl(offer.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <MessageCircle className="size-3" /> {t("contact_us", "Contact us")}
                </Button>
              )}
            </ItemActions>
          </Item>
        );
      })}
      {!error && offers.length === 0 && (
        <p className="text-xs text-muted-foreground">No offers are available yet.</p>
      )}
    </section>
  );
}
