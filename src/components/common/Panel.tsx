import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type ModalSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg", //w-[90vw] sm:w-72 max-h-[50dvh] 
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showHeader?: boolean;
  showFooter?: boolean;
};

export function Panel({
  isOpen,
  title,
  description,
  children,
  footer,
  size = "sm",
  showHeader = false,
  showFooter = false,
}: ModalProps) {
  // ✅ use state, not ref — this triggers a re-render after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⛔️ previously: if (!mountedRef.current || !isOpen) return null;
  if (!mounted || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Drawer
          open={isOpen}
          modal={false} disablePointerDismissal
          swipeDirection="left"
        >
          <DrawerContent
            className={cn(`
            z-150 my-18 bg-background/80 backdrop-blur-md shadow-lg
            `, SIZE_MAP[size],
            )}
          >
            <div className="flex-1 overflow-y-auto p-4 sm:p-2">
              {(showHeader) && (
                <DrawerHeader>
                  {title && (
                    <DrawerTitle>{title}</DrawerTitle>
                  )}
                  {description && (
                    <DrawerDescription>
                      {description}
                    </DrawerDescription>
                  )}
                </DrawerHeader>
              )}
              {children}
            </div>
            {(showFooter) && (
              <DrawerFooter>
                {footer || "No footer content"}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </AnimatePresence>
  );
}
