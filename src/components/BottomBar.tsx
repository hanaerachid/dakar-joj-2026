import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

export interface BottomNavigationItem {
  key: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  activeKey: string;
  isMobile: boolean;
  t: (key: string, defaultValue: string) => string;
}

export function BottomNavigation({
  items,
  activeKey,
  isMobile,
  t,
}: BottomNavigationProps) {
  if (!isMobile) return null;

  return (
    <nav
      aria-label={t("navigation.label", "Main navigation")}
      className={cn(
        "fixed bottom-2 inset-x-2 z-175",
        "rounded-full border border-border bg-background/80 backdrop-blur-md shadow-md",
        "px-2 py-2",
      )}
    >
      <ul className="grid grid-flow-col auto-cols-fr">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <Button
              key={item.key}
              role="button"
              onClick={item.action}
              type="button"
              variant={isActive ? "secondary" : "ghost"}
              size="lg"
              className={cn(
                "text-xs transition-colors",
                isActive && "text-primary bg-primary/10",
              )}
            >
              <Icon
                aria-hidden="true"
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                className={cn(
                  "max-w-full",
                  "sr-only",
                  !isActive ? "font-normal text-foreground/70" : "font-bold text-primary",
                  "text-[10px]/5 truncate tracking-tight text-center",
                )}
              >
                {t(`navigation.${item.key}`, item.label)}
              </span>
            </Button>
          );
        })}
      </ul>
    </nav>
  );
}