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
        "fixed inset-x-2 z-175",
        "bottom-2",
        "rounded-4xl border border-border bg-background/80 backdrop-blur-md shadow-md",
        "py-1",
      )}
    >
      <ul className="grid grid-flow-col auto-cols-fr">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey === item.key;

          return (
            <li
              key={item.key}
              role="button"
              onClick={item.action}
              className={cn(
                "min-w-0",
                "flex flex-col items-center justify-center gap-0.25",
              )}
            >
              <Button
                type="button"
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "px-4",
                  "text-xs transition-colors",
                )}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={isActive ? 2 : 1}
                />
              </Button>

              <span
                className={cn(
                  "max-w-full truncate",
                  !isActive ? "font-normal text-foreground/70" : "font-bold text-primary",
                  "text-[10px]/5 tracking-tight text-center uppercase",
                )}
              >
                {t(`navigation.${item.key}`, item.label)}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}