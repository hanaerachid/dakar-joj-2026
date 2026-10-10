import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

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

  // const showSwipeHandle = isMobile ? true : false;
  const swipeDirection = isMobile ? "down" : "left";

  return (
    <>
      {isOpen && (
        <Drawer
          open={isOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
          modal={false}
          disablePointerDismissal
          // showSwipeHandle={showSwipeHandle}
          swipeDirection={swipeDirection}
          snapPoints={isMobile ? [0.4, 0.7, 1] : undefined}
        >
          <DrawerContent
            className={cn(
              "z-150 mt-18 mb-8 bg-background/80 backdrop-blur-md shadow-lg",
              SIZE_MAP[size],
            )}
          >
            {isMobile && (
              <DrawerHeader className="relative my-2">
                  {title && (
                  <DrawerTitle>
                    {title}
                  </DrawerTitle>
                  )}

                  {description && (
                    <DrawerDescription>
                      {description}
                    </DrawerDescription>
                  )}

                <DrawerClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={cn(
                        "absolute right-2 top-0 z-50",
                      )}
                      aria-label="Close drawer"
                    >
                      <X />
                      <span className="sr-only">
                        {t("close", "Close")}
                      </span>
                    </Button>
                  }
                />
              </DrawerHeader>
            )}

            <ScrollArea
              className={cn(
                "h-full",
                "px-2 py-2"
              )}
            >
              {children}
            </ScrollArea>

            {showFooter && footer && (
              <DrawerFooter>
                {footer}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
