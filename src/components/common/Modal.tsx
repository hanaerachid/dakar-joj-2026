import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ModalSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showClose?: boolean;
  panelClassName?: string; // extra classes for the panel
  contentClassName?: string; // extra classes for the scrollable content
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "sm",
  showClose = true,
  panelClassName = "",
  contentClassName = "",
}: ModalProps) {
  // ✅ use state, not ref — this triggers a re-render after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // ⛔️ previously: if (!mountedRef.current || !isOpen) return null;
  if (!mounted || !isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={showClose}
        role="dialog"
        aria-modal="true"
        className={[
          "w-full",
          SIZE_MAP[size],
          "rounded-2xl bg-background/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/10",
          "animate-[popIn_.18s_ease]",
          panelClassName,
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title) && (
          <div className="flex items-center justify-between gap-3">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg font-semibold text-foreground/90">
                {title}
              </DialogTitle>
            </DialogHeader>
          </div>
        )}

        <div
          className={[
            "max-h-[70vh] sm:max-h-[75vh] overflow-y-auto",
            contentClassName,
          ].join(" ")}
        >
          {children}
        </div>

        {footer && (
          <DialogFooter>{footer}</DialogFooter>
        )}
      </DialogContent>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { 0% { transform: translateY(6px) scale(.985); opacity: 0 }
                           100% { transform: translateY(0) scale(1); opacity: 1 } }
      `}</style>
    </Dialog>
    //, document.body,
  );
}
