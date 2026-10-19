// src/components/buttons/AnimatedButton.tsx
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "cn";

const MotionButton = motion(Button)

type IconType = string | LucideIcon;

interface AnimatedButtonProps {
  isOpen?: boolean;
  onClick: () => void;
  icon?: IconType;
  title?: string;
  className?: string;
  iconClassName?: string;
  tooltip?: string;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  children?: React.ReactNode;
}

export function AnimatedButton({
  isOpen,
  onClick,
  icon,
  title,
  className = "",
  iconClassName,
  tooltip,
  tooltipSide = "right",
  children,
}: Readonly<AnimatedButtonProps>) {
  const resolvedTitle = title || "";
  const tip = tooltip || resolvedTitle;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <MotionButton
            variant={isOpen ? "default" : "secondary"}
            size={children ? "lg" : "icon-lg"}
            whileTap={{ scale: 0.9, rotate: -6 }}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18, mass: 0.9 }}
            className={cn("shadow-lg", className)}
            onClick={onClick}
            title={resolvedTitle}
            aria-label={resolvedTitle}
            type="button"
          >
            {icon &&
              (typeof icon === "string" ? (
                <Icon icon={icon} className={iconClassName || "block h-5 w-5 md:h-5.5 md:w-5.5"} />
              ) : (
                (() => {
                  const LucideIconComponent = icon;
                  return (
                    <LucideIconComponent
                      className={
                        iconClassName ||
                        "block h-5 w-5 md:h-5.5 md:w-5.5"
                      }
                    />
                  );
                })()
              ))}
            {children && <span>{children}</span>}
          </MotionButton>
        }
      >
      </TooltipTrigger>
      {/* Tooltip (desktop only) */}
      <TooltipContent
        className="hidden md:block z-50 pointer-events-none text-xs font-medium shadow-lg backdrop-blur"
        side={tooltipSide || "right"}
        sideOffset={12}
        align="center"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
