import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchPlacesInput } from "./search/SearchPlacesInput";
import { SearchPlacesModal } from "./search/SearchPlacesModal";
import { PlacesListContent } from "./place-list/PlacesList";
import { useStateContext } from "./state-provider";
import { PlaceDetails } from "./place-card/place";
import { BusinessDetails } from "./listing-card/listing";

export const ExplorerContent = ({
  setPanelOpen,
}: {
  setPanelOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  // const hasSearchQuery = query.trim().length > 0;
  const { isSearchOpen, selectedPlace } = useStateContext();
  return (
    <div className="space-y-2">
      {selectedPlace ? (
        selectedPlace.type === "business" ? (
          <BusinessDetails listing={selectedPlace.listing} />
        ) : (
          <PlaceDetails id={selectedPlace.id} />
        )
      ) : (
      <>
      <SearchPlacesInput
        query={query}
        onQueryChange={setQuery}
        placeholder={t("search.placeholder", "Search Places")}
        tipText={
          isSearchOpen ? t("search.tip", "Search places, landmarks, or addresses then select a place to show on the map."): (null)
        }
      />
      {isSearchOpen ? (
        <SearchPlacesModal
          query={query}
        // setQuery={setQuery}
        />
      ) : (
        <PlacesListContent setPanelOpen={setPanelOpen} />
      )}
      </>
    )}
    </div>
  );
};