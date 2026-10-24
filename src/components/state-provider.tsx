"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initAuth } from "../auth/nitAuth";
import { getBusinessListing } from "../lib/api/listings";
import { getPlace } from "../lib/api/places";
import {
  PLACE_SELECTED_EVENT,
  type PlaceSelection,
} from "./place-selection";

type ProviderProps = {
  children: React.ReactNode
}

type ProviderState = {
  activeTab: string
  setActiveTab: (tab: string) => void

  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>;

  torchVisible: boolean
  setTorchVisible: (visible: boolean) => void

  openMainCategoryIds: string[]
  setOpenMainCategoryIds: React.Dispatch<React.SetStateAction<string[]>>
  openCatIds: Record<string, string[]>
  setOpenCatIds: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  activeMainCategoryId: string
  setActiveMainCategoryId: (id: string) => void
  activeCatId: string
  setActiveCatId: (id: string) => void

  selectedPlace: Record<string, unknown> | null
  setSelectedPlace: (place: Record<string, unknown> | null) => void

  eventCategory: string
  setEventCategory: (event: string) => void
}

const initialState: ProviderState = {
  activeTab: "explorer",
  setActiveTab: () => null,

  isSearchOpen: false,
  setIsSearchOpen: () => null,
  searchInputRef: { current: null },

  torchVisible: false,
  setTorchVisible: () => null,

  openMainCategoryIds: ["sports", "businesses"],
  setOpenMainCategoryIds: () => null,
  openCatIds: { sports: ["competition"], businesses: ["business"] },
  setOpenCatIds: () => null,
  activeMainCategoryId: "businesses",
  setActiveMainCategoryId: () => null,
  activeCatId: "business",
  setActiveCatId: () => null,

  selectedPlace: null,
  setSelectedPlace: () => null,

  eventCategory: "public",
  setEventCategory: () => null,
};

export const StateContext = createContext<ProviderState>(initialState);

export function StateProvider({
  children,
}: ProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname.split("/")[1] || "home";

  const setActiveTab = (newTab: string) => {
    navigate(`/${newTab}`);
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [torchVisible, setTorchVisible] = useState(false);
  const [openMainCategoryIds, setOpenMainCategoryIds] = useState(["businesses"]);
  const [openCatIds, setOpenCatIds] = useState<Record<string, string[]>>({
    sports: ["competition"],
    businesses: ["business"],
  });
  const [activeMainCategoryId, setActiveMainCategoryId] = useState("businesses");
  const [activeCatId, setActiveCatId] = useState("businesses");
  const [selectedPlace, setSelectedPlaceState] = useState<Record<string, unknown> | null>(null);
  const setSelectedPlace = useCallback(
    (place: Record<string, unknown> | null) => {
      const pathname = location.pathname.replace(/\/$/, "");
      const isExplorerPath = pathname === "/explorer" || pathname.startsWith("/explorer/");

      if (place?.id != null) {
        navigate(`/explorer?place=${encodeURIComponent(String(place.id))}`);
      } else if (isExplorerPath) {
        navigate("/explorer", { replace: true });
      }

      setSelectedPlaceState(place);
    },
    [location.pathname, navigate],
  );
  const [role, setRole] = useState<string | undefined>(undefined);
  const [eventCategory, setEventCategory] = useState("public");

  useEffect(() => {
    initAuth((user, r) => {
      console.log("[initAuth] user:", user?.uid, "role:", r);
      console.log("[initAuth] role:", role);
      setRole(r);
    });
  }, []);

  useEffect(() => {
    const handlePlaceSelected = (event: Event) => {
      const place = (event as CustomEvent<PlaceSelection>).detail;
      if (!place?.id) return;

      setSelectedPlace(place);
    };

    window.addEventListener(PLACE_SELECTED_EVENT, handlePlaceSelected);

    return () => {
      window.removeEventListener(PLACE_SELECTED_EVENT, handlePlaceSelected);
    };
  }, [navigate, setSelectedPlace]);

  useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, "");
    const isExplorerPath = pathname === "/explorer" || pathname.startsWith("/explorer/");
    const pathPlaceId = pathname.startsWith("/explorer/")
      ? decodeURIComponent(pathname.slice("/explorer/".length))
      : null;
    const searchParams = new URLSearchParams(location.search);
    const placeId = searchParams.get("place")
      ?? searchParams.get("placeId")
      ?? (pathPlaceId?.startsWith("placeId=")
        ? pathPlaceId.slice("placeId=".length)
        : pathPlaceId);

    if (!isExplorerPath || !placeId) {
      setSelectedPlaceState(null);
      return;
    }

    const selectedId = placeId;

    let cancelled = false;

    async function loadSelection() {
      try {
        const listing = await getBusinessListing(selectedId);
        if (cancelled) return;

        const [lng, lat] = listing.location.coordinates;
        setSelectedPlaceState({
          id: selectedId,
          lng,
          lat,
          title: listing.name,
          type: "business",
          listing,
        });
        return;
      } catch {
        const place = await getPlace(selectedId);
        if (cancelled) return;

        setSelectedPlaceState({
          id: place.id,
          lng: place.location?.longitude,
          lat: place.location?.latitude,
          title: place.name,
          type: "place",
        });
      }
    }

    void loadSelection().catch(() => {
      if (!cancelled) setSelectedPlaceState(null);
    });

    return () => {
      cancelled = true;
    };
  }, [location.pathname, location.search]);

  const value = {
    activeTab,
    setActiveTab,

    isSearchOpen,
    setIsSearchOpen,
    searchInputRef,

    torchVisible,
    setTorchVisible,

    openMainCategoryIds,
    setOpenMainCategoryIds,
    openCatIds,
    setOpenCatIds,
    activeMainCategoryId,
    setActiveMainCategoryId,
    activeCatId,
    setActiveCatId,

    selectedPlace,
    setSelectedPlace,
    eventCategory,
    setEventCategory,
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};