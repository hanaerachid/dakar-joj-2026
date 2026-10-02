import React, { useEffect, useState } from "react";
import { cn } from "cn";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
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

type PanelProps = {
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
  onClose,
  title,
  description,
  children,
  footer,
  size = "sm",
  showHeader = false,
  showFooter = false,
}: PanelProps) {
  // ✅ use state, not ref — this triggers a re-render after mount
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setMounted(false);
    } else {
      setMounted(true);
    }
  }, []);

  // ⛔️ previously: if (!mountedRef.current || !isOpen) return null;
  if (!mounted || !isOpen) return null;

  const showSwipeHandle = isMobile ? true : false;
  const swipeDirection = isMobile ? "down" : "left";

  return (
    <AnimatePresence>
      {isOpen && (
        <Drawer
          open={isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
          modal={false}
          disablePointerDismissal
          showSwipeHandle={showSwipeHandle}
          swipeDirection={swipeDirection}
          snapPoints={isMobile ? [0.5, 0.7, 1] : undefined}
        >
          <DrawerContent
            className={cn(`
            z-150 mt-18 mb-8 bg-background/80 backdrop-blur-md shadow-lg
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

            {showFooter && (
              <DrawerFooter>
                {footer && footer}
                {isMobile && onClose && (
                  <DrawerClose
                    render={
                      <Button
                        size="default"
                        variant="destructive"
                        onClick={() => onClose}
                      />
                    }
                  >
                    <span>{t("close", "Close")}</span>
                  </DrawerClose>
                )}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </AnimatePresence>
  );
}
