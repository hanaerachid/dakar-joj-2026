import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription } from "../ui/empty";

type Props = {
  CATEGORIES: any[];
  openCatId: string | null;
  activeCategory: any;
  setOpenCatId: (v: string | null) => void;

  checkedCats: Record<string, boolean>;
  handleCategoryCheck: (
    checked: boolean,
    catId: string,
  ) => void;

  venues: any[];
  Chevron: React.FC<{ open: boolean }>;
  collapseVariants: any;

  loading: boolean;
  loadError: string | null;

  grouped: Record<string, any[]>;
  openZones: Record<string, boolean>;
  setOpenZones: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;

  handleClick: (
    lng: number,
    lat: number,
    title: string,
    id: string | undefined,
  ) => void;
  selectedTitle: string | null;
};

export function PlacesCategoryList({
  CATEGORIES,
  openCatId,
  activeCategory,
  setOpenCatId,
  checkedCats,
  handleCategoryCheck,
  venues,
  Chevron,
  collapseVariants,
  loading,
  loadError,
  grouped,
  openZones,
  setOpenZones,
  handleClick,
  selectedTitle,
}: Props) {
  return (
    <ul className="space-y-2">
      {CATEGORIES.map((cat) => {
        const isOpen = openCatId === cat.id;
        const isActive = cat.id === activeCategory.id;

        return (
          <motion.li
            key={cat.id}
            layout
            className="rounded-xl border border-border bg-background/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-start rounded-xl cursor-pointer select-none"
              onClick={() => setOpenCatId(isOpen ? null : cat.id)}
              onKeyDown={(e) => {
                const t = e.target as HTMLElement;
                if (
                  t.tagName === "INPUT" ||
                  t.tagName === "TEXTAREA" ||
                  t.isContentEditable
                )
                  return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenCatId(isOpen ? null : cat.id);
                }
              }}
            >
              {/* Checkbox + label */}
              <Checkbox
                checked={!!checkedCats[cat.id]}
                onCheckedChange={(checked) => {
                  handleCategoryCheck(checked === true, cat.id);
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDownCapture={(e) => e.stopPropagation()}
                aria-label={`Toggle ${cat.label}`}
                id={cat.id}
              />
              <Label
                className="flex items-center gap-2.5"
                onClick={(e) => e.stopPropagation()}
                htmlFor={cat.id}
              ><span className="font-medium text-foreground">{cat.label}</span></Label>

              {/* Count pill when active */}
              {isActive && (
                <span className="ml-auto inline-flex items-center rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {venues.length}
                </span>
              )}

              {/* Chevron */}
              <div className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-card text-muted-foreground">
                <Chevron open={isOpen} />
              </div>
            </div>

            {/* Body */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  variants={collapseVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5">
                    {/* Loading */}
                    {loading && (
                      <div className="py-4 flex items-center gap-2 text-muted-foreground">
                        <Spinner />
                        <span className="text-sm">Loading…</span>
                      </div>
                    )}

                    {/* Error */}
                    {loadError && (
                      <Alert variant="destructive" className="py-3 text-sm max-w-md">
                        <AlertCircleIcon />
                        <AlertDescription>
                          {loadError}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Empty */}
                    {!loading && !loadError && venues.length === 0 && (
                      <Empty className="py-3 text-sm text-muted-foreground">
                        <EmptyContent>
                          <EmptyDescription>
                            {cat.hint ?? "No items yet."}
                          </EmptyDescription>
                        </EmptyContent>
                      </Empty>
                    )}

                    {/* Zones + Places */}
                    {!loading && !loadError && venues.length > 0 && (
                      <ul className="space-y-2">
                        {Object.entries(grouped).map(([zone, list]) => {
                          const color =
                            (list[0] as any)?.zoneColor ?? "#3b82f6";
                          const zoneOpen = !!openZones[zone];

                          return (
                            <motion.li
                              key={zone}
                              layout
                              className="rounded-lg border border-border bg-card"
                            >
                              {/* Zone header */}
                              <button
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-start hover:bg-card/20 rounded-lg transition-colors"
                                onClick={() =>
                                  setOpenZones((prev) => ({
                                    ...prev,
                                    [zone]: !zoneOpen,
                                  }))
                                }
                              >
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                                    style={{ backgroundColor: color }}
                                  />
                                </div>
                                <span className="font-medium text-foreground">
                                  {zone}
                                </span>
                                <span className="ml-auto inline-flex items-center rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                  {list.length}
                                </span>
                                <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-card text-muted-foreground">
                                  <Chevron open={zoneOpen} />
                                </div>
                              </button>

                              {/* Places */}
                              <AnimatePresence initial={false}>
                                {zoneOpen && (
                                  <motion.div
                                    variants={collapseVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    className="overflow-hidden"
                                  >
                                    <ul className="px-2.5 pb-2 space-y-1.5">
                                      {list.map((feature: any, idx: number) => {
                                        const title =
                                          (feature?.properties
                                            ?.Name as string) ||
                                          (feature?.properties
                                            ?.title as string) ||
                                          (feature?.properties
                                            ?.name as string) ||
                                          "Untitled";

                                        return (
                                          <li key={`${zone}-${idx}`}>
                                            <button
                                              onClick={() => {
                                                const [lng, lat] = feature
                                                  .geometry.coordinates as [
                                                    number,
                                                    number,
                                                  ];
                                                const id =
                                                  (feature.properties
                                                    ?.id as string) ??
                                                  (feature.id as string) ??
                                                  (feature.properties
                                                    ?.docId as string) ??
                                                  (feature.properties
                                                    ?.placeId as string) ??
                                                  undefined;

                                                handleClick(
                                                  lng,
                                                  lat,
                                                  title,
                                                  id,
                                                );
                                              }}
                                              className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors hover:bg-primary/20 ${selectedTitle === title
                                                  ? "bg-primary/70 font-semibold"
                                                  : "bg-card/90"
                                                }`}
                                            >
                                              <span className="truncate text-foreground">
                                                {title}
                                              </span>
                                            </button>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ul>
  );
}
