import type { TFunction } from "i18next";

export const getFriendlyCategoryName = (
  category: string,
  t: TFunction
) => {
  const categoryMap: Record<string, string> = {
    hotel: t("listing_types.hotel", "Hotel"),
    appart: t("listing_types.appart", "Appartment"),
    resto: t("listing_types.resto", "Restaurant"),
    concess: t("listing_types.concess", "Concession"),
    boutique: t("listing_types.boutique", "Store"),
    galerie: t("listing_types.gallerie", "Gallery"),
  };

  return categoryMap[category] || category;
};