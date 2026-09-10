import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";

type Props = {
  CATEGORIES: any[];
  MAIN_CATEGORIES: readonly any[];
  openMainCategoryId: string | null;
  setOpenMainCategoryId: (value: string | null) => void;
  mainCategoryChecked: Record<string, boolean>;
  handleMainCategoryCheck: (checked: boolean, mainCategoryId: string) => void;
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

export function PlacesCategoryList(props: Props) {
  const {
    CATEGORIES,
    MAIN_CATEGORIES,
    openMainCategoryId,
    setOpenMainCategoryId,
    mainCategoryChecked,
    handleMainCategoryCheck,
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
  } = props;

  return (
    <Accordion multiple className="space-y-1.5">
      {MAIN_CATEGORIES.map((main) => {
        const children = CATEGORIES.filter((category) => main.categories.includes(category.id));
        const mainOpen = openMainCategoryId === main.id;
        const mainEnabled = !!mainCategoryChecked[main.id];
        return (
          <motion.div
            key={main.id}
            layout
          >
            <AccordionItem
              value={main.id}
              disabled={!children.length}
              className="rounded-2xl bg-background/90 backdrop-blur-sm"
            >
              {/* Header */}
              <AccordionTrigger
                className="w-full flex items-center justify-between gap-3 px-3.5 py-3.5 cursor-pointer select-none"
                onClick={() => {
                  const nextOpen = !mainOpen;
                  setOpenMainCategoryId(nextOpen ? main.id : null);
                  if (nextOpen && children.length) setOpenCatId(children[0].id);
                }}
              >
                <h2
                  className="flex-1 flex items-center gap-2.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <main.icon className="h-5 w-5" />
                  <span
                    className="font-medium text-foreground"
                  >
                    {main.label}
                  </span>
                  <Badge
                    variant="secondary"
                  >
                    {children.length}
                  </Badge>
                </h2>

                {/* Checkbox + label */}
                <Switch
                  className="ms-auto"
                  checked={mainEnabled}
                  disabled={!children.length}
                  onCheckedChange={(checked) =>
                    handleMainCategoryCheck(checked, main.id)
                  }
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={`Toggle ${main.label}`}
                  id={`main-${main.id}`}
                />

              </AccordionTrigger>

              {/* Body */}
              <AnimatePresence initial={false}>
                {mainOpen && (
                  <motion.div
                    variants={collapseVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="overflow-hidden"
                  >
                    <AccordionContent className="space-y-2">
                      {children.map((category) => {
                        const categoryOpen = openCatId === category.id;
                        const active = category.id === activeCategory.id;
                        return (
                          <motion.li
                            key={category.id}
                            layout
                            className="list-none rounded-lg border border-border bg-card"
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              aria-expanded={categoryOpen}
                              className="w-full flex items-center gap-3 px-3 py-2 text-start cursor-pointer"
                              onClick={() => {
                                setOpenCatId(categoryOpen ? null : category.id);
                                if (!categoryOpen) setOpenMainCategoryId(main.id);
                              }}
                            >
                              <Checkbox
                                checked={!!checkedCats[category.id]}
                                disabled={!mainEnabled}
                                onCheckedChange={(checked) => handleCategoryCheck(checked === true, category.id)}
                                onClick={(event) => event.stopPropagation()}
                                onPointerDown={(event) => event.stopPropagation()}
                                aria-label={`Toggle ${category.label}`}
                                id={category.id}
                              />
                              <Label
                                onClick={(event) => event.stopPropagation()}
                                htmlFor={category.id}
                              >
                                {category.label}
                              </Label>
                              {active && (
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {venues.length}
                                </span>
                              )}
                              <Chevron open={categoryOpen} />
                            </div>
                            <AnimatePresence initial={false}>
                              {categoryOpen && <motion.div variants={collapseVariants} initial="closed" animate="open" exit="closed" className="overflow-hidden"><div className="px-3 pb-3">
                                {loading && <div className="py-4 flex items-center gap-2 text-muted-foreground"><Spinner /><span className="text-sm">Loading...</span></div>}
                                {loadError && <Alert variant="destructive" className="py-3 text-sm"><AlertCircleIcon /><AlertDescription>{loadError}</AlertDescription></Alert>}
                                {!loading && !loadError && !venues.length && <Empty className="py-3 text-sm"><EmptyContent><EmptyDescription>{category.hint ?? "No items yet."}</EmptyDescription></EmptyContent></Empty>}
                                {!loading && !loadError && !!venues.length && <ul className="space-y-2">{Object.entries(grouped).map(([zone, list]) => {
                                  const zoneOpen = !!openZones[zone];
                                  return (
                                    <motion.li
                                      key={zone}
                                      layout
                                      className="rounded-lg border border-border bg-card"
                                    >
                                      <button
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-start"
                                        onClick={() => setOpenZones((previous) => ({ ...previous, [zone]: !zoneOpen }))}
                                      >
                                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                        <span className="font-medium">
                                          {zone}
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          {list.length}
                                        </span>
                                        <Chevron open={zoneOpen} />
                                      </button>
                                      <AnimatePresence initial={false}>
                                        {zoneOpen &&
                                          <motion.div
                                            variants={collapseVariants}
                                            initial="closed"
                                            animate="open"
                                            exit="closed">
                                            <ul className="px-2.5 pb-2 space-y-1.5">
                                              {[...list]
                                                .sort((a: any, b: any) => {
                                                  const titleA = a?.properties?.Name || a?.properties?.title || a?.properties?.name || "Untitled";
                                                  const titleB = b?.properties?.Name || b?.properties?.title || b?.properties?.name || "Untitled";

                                                  return titleA.localeCompare(titleB);
                                                })
                                                .map((feature: any, index) => {
                                                const title = feature?.properties?.Name || feature?.properties?.title || feature?.properties?.name || "Untitled";
                                                return (
                                                  <li key={`${zone}-${index}`}>
                                                    <button
                                                      onClick={() => {
                                                        const [lng, lat] = feature.geometry.coordinates as [number, number];
                                                        const id = feature.properties?.id ?? feature.id ?? feature.properties?.docId ?? feature.properties?.placeId;
                                                        handleClick(lng, lat, title, id);
                                                      }}
                                                      className={`w-full rounded-md px-2.5 py-2 text-start text-sm ${selectedTitle === title ? "bg-primary/70 font-semibold" : "bg-card/90"}`}
                                                    >
                                                      {title}
                                                    </button>
                                                  </li>
                                                );
                                              })}
                                            </ul>
                                          </motion.div>}
                                      </AnimatePresence>
                                    </motion.li>
                                  );
                                })}
                                </ul>
                                }
                              </div>
                              </motion.div>}
                            </AnimatePresence>
                          </motion.li>
                        );
                      })}
                    </AccordionContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </AccordionItem>
          </motion.div>
        );
      })}
    </Accordion>
  );
}
