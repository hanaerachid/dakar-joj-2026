"use client";

import { createContext, useContext, useState} from "react";

type ProviderProps = {
  children: React.ReactNode
}

type ProviderState = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const initialState: ProviderState = {
  activeTab: "explorer",
  setActiveTab: () => null,
};

export const StateContext = createContext<ProviderState>(initialState);

export function StateProvider({
  children,
}: ProviderProps) {

  const [activeTab, setActiveTab] = useState("explorer");

  const value = {
    activeTab,
    setActiveTab,
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