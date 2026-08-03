"use client";

import { createContext, useContext, useState} from "react";
import { Modal } from "@/components/common/Modal";

type ModalProviderProps = {
  children: React.ReactNode
}

type ModalProviderState = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  setModalContent: (content: any) => void
}

const initialState: ModalProviderState = {
  isOpen: false,
  setIsOpen: () => null,
  setModalContent: () => null
};

// Create a context for the modal
export const ModalContext = createContext<ModalProviderState>(initialState);

// ModalProvider component to wrap your app with
export function ModalProvider({
  children,
  ...props
}: ModalProviderProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState({
    title: "Confirm",
    onConfirm: () => {},
    onCancel: () => setIsOpen(false),
    children: null,
    footer: null,
  });

  const value = {
    isOpen,
    setIsOpen,
    setModalContent,
  };

  return (
    <ModalContext.Provider value={value}>
      <Modal
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        {...modalContent}
        {...props}
      />
      {children}
    </ModalContext.Provider>
  );
}

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }
  return context;
};