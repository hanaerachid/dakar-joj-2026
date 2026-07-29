import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  const overlayRef = useRef<HTMLDivElement | null>(null);

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

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 grid place-items-center p-2 sm:p-6
                 bg-background/40 backdrop-blur-[3px] animate-[fadeIn_.18s_ease]"
    >
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "relative w-full",
          SIZE_MAP[size],
          "rounded-2xl bg-background/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/10",
          "animate-[popIn_.18s_ease]",
          panelClassName,
        ].join(" ")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between gap-3 px-5 py-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground/90">
              {title}
            </h2>
            {showClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="rounded-full active:scale-95 transition"
                aria-label="Close"
                title="Close"
              >
                <X />
              </Button>
            )}
          </div>
        )}
        {(title || showClose) && <div className="h-px bg-background/5" />}

        <div
          className={[
            "px-3 py-2 max-h-[70vh] sm:max-h-[75vh] overflow-y-auto",
            contentClassName,
          ].join(" ")}
        >
          {children}
        </div>

        {footer && (
          <>
            <div className="h-px bg-background/50" />
            <div className="px-5 py-2">{footer}</div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { 0% { transform: translateY(6px) scale(.985); opacity: 0 }
                           100% { transform: translateY(0) scale(1); opacity: 1 } }
      `}</style>
    </div>,
    document.body,
  );
}
