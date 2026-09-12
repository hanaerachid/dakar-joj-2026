"use client";

import {
  createContext,
  useContext,
  useState,
  useRef
} from "react";

type ProviderProps = {
  children: React.ReactNode
}

type ProviderState = {
  activeTab: string
  setActiveTab: (tab: string) => void

  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

const initialState: ProviderState = {
  activeTab: "explorer",
  setActiveTab: () => null,

  isSearchOpen: false,
  setIsSearchOpen: () => null,
  searchInputRef: { current: null },
};

export const StateContext = createContext<ProviderState>(initialState);

export function StateProvider({
  children,
}: ProviderProps) {

  const [activeTab, setActiveTab] = useState("explorer");

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const value = {
    activeTab,
    setActiveTab,

    isSearchOpen,
    setIsSearchOpen,
    searchInputRef,
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