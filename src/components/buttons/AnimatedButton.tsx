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
import { cn } from "@/utils/utils";

const MotionButton = motion(Button)

type IconType = string | LucideIcon;

interface AnimatedButtonProps {
  isOpen?: boolean;
  onClick: () => void;
  icon?: IconType;
  title?: string;
  className?: string;
  iconClassName?: string;
  tooltip?: string; // NEW: hover tooltip label
}

export function AnimatedButton({
  isOpen,
  onClick,
  icon,
  title,
  className = "",
  iconClassName,
  tooltip,
}: Readonly<AnimatedButtonProps>) {
  const ResolvedIcon = icon || "";
  const resolvedTitle = title || "";
  const tip = tooltip || resolvedTitle;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <MotionButton
            variant={isOpen ? "default" : "secondary"}
            size="icon-lg"
            whileTap={{ scale: 0.9, rotate: -6 }}
            whileHover={{ y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18, mass: 0.9 }}
            className={cn(`
          shadow-lg shadow-black/10
          outline-none
          ring-1 ring-black/5
          focus-visible:ring-2 focus-visible:ring-primary/40
        `,
              className)}
            onClick={onClick}
            title={resolvedTitle}
            aria-label={resolvedTitle}
            type="button"
          >
            {typeof ResolvedIcon === "string" ? (
              <Icon icon={ResolvedIcon} className={iconClassName || "block h-5 w-5 md:h-5.5 md:w-5.5"} />
            ) : (
              <ResolvedIcon className={iconClassName} />
            )}
          </MotionButton>
        }
      >
      </TooltipTrigger>
      {/* Tooltip (desktop only) */}
      <TooltipContent
        className="hidden md:block z-50 pointer-events-none text-xs font-medium shadow-lg backdrop-blur"
        side="right"
        sideOffset={12}
        align="center"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
