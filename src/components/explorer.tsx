import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchPlacesInput } from "./search/SearchPlacesInput";
import { SearchPlacesModal } from "./search/SearchPlacesModal";
import { PlacesListContent } from "./place-list/PlacesList";
import { useStateContext } from "./state-provider";

export const ExplorerContent = ({
  setPanelOpen,
}: any) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  // const hasSearchQuery = query.trim().length > 0;
  const { isSearchOpen } = useStateContext();
  return (
    <div className="flex h-full flex-col">
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
    </div>
  );
};