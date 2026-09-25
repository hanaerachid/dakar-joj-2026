"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect
} from "react";
import { initAuth } from "../auth/nitAuth";
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
}

const initialState: ProviderState = {
  activeTab: "explorer",
  setActiveTab: () => null,

  isSearchOpen: false,
  setIsSearchOpen: () => null,
  searchInputRef: { current: null },

  torchVisible: false,
  setTorchVisible: () => null,

  openMainCategoryIds: ["sports"],
  setOpenMainCategoryIds: () => null,
  openCatIds: { sports: ["competition"] },
  setOpenCatIds: () => null,
  activeMainCategoryId: "sports",
  setActiveMainCategoryId: () => null,
  activeCatId: "competition",
  setActiveCatId: () => null,

  selectedPlace: null,
  setSelectedPlace: () => null,
};

export const StateContext = createContext<ProviderState>(initialState);

export function StateProvider({
  children,
}: ProviderProps) {

  const [activeTab, setActiveTab] = useState("explorer");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [torchVisible, setTorchVisible] = useState(false);
  const [openMainCategoryIds, setOpenMainCategoryIds] = useState(["sports"]);
  const [openCatIds, setOpenCatIds] = useState<Record<string, string[]>>({
    sports: ["competition"],
  });
  const [activeMainCategoryId, setActiveMainCategoryId] = useState("sports");
  const [activeCatId, setActiveCatId] = useState("competition");
  const [selectedPlace, setSelectedPlace] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined);

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

      setActiveTab("explorer");
      setSelectedPlace(place);
    };

    window.addEventListener(PLACE_SELECTED_EVENT, handlePlaceSelected);
    return () =>
      window.removeEventListener(PLACE_SELECTED_EVENT, handlePlaceSelected);
  }, []);

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