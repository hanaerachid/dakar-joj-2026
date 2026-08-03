"use client";

import { createContext, useContext, useState} from "react";
import { Panel } from "@/components/common/Panel";

type PanelProviderProps = {
  children: React.ReactNode
}

type PanelProviderState = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setPanelContent: (content: any) => void
}

const initialState: PanelProviderState = {
  isOpen: false,
  setIsOpen: () => null,
  setPanelContent: () => null
};

// Create a context for the panel
export const PanelContext = createContext<PanelProviderState>(initialState);

// PanelProvider component to wrap your app with
export function PanelProvider({
  children,
  ...props
}: PanelProviderProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [panelContent, setPanelContent] = useState({
    title: "Confirm",
    children: null,
    footer: null,
  });

  const value = {
    isOpen,
    setIsOpen,
    setPanelContent,
  };

  return (
    <PanelContext.Provider value={value}>
      <Panel
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        {...panelContent}
        {...props}
      />
      {children}
    </PanelContext.Provider>
  );
}

export const usePanelContext = () => {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error("usePanelContext must be used within a PanelProvider");
  }
  return context;
};