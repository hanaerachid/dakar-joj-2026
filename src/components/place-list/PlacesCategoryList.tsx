import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Skeleton } from "../ui/skeleton";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "../ui/item";
import { cn } from "@/utils/utils";

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
    handleClick,
    selectedTitle,
  } = props;

  const { t } = useTranslation();
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  useEffect(() => {
    setSelectedZones(new Set(Object.keys(grouped)));
  }, [grouped]);

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
                              {categoryOpen && (
                                <motion.div
                                  variants={collapseVariants}
                                  initial="closed"
                                  animate="open"
                                  exit="closed"
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3">

                                    {!loading && !loadError && !venues.length && (
                                      <Empty>
                                        <EmptyContent>
                                          <EmptyDescription>
                                            {category.hint ?? t("items_appear_here", "Items appear here.")}
                                          </EmptyDescription>
                                        </EmptyContent>
                                      </Empty>
                                    )}

                                    {loadError && (
                                      <Alert variant="destructive">
                                        <AlertCircleIcon />
                                        <AlertDescription>{loadError}</AlertDescription>
                                      </Alert>
                                    )}

                                    <div className="flex-col items-center space-y-1">
                                      {loading &&
                                        [...Array(3)].map((_, index) => (
                                          <Skeleton key={index} className="min-h-10">
                                          </Skeleton>
                                        ))
                                      }
                                    </div>

                                    {!loading && !loadError && !!venues.length && (
                                      <div className="flex flex-col gap-2">

                                        {/* Zone filters */}
                                        <ToggleGroup multiple
                                          value={[...selectedZones]}
                                          onValueChange={(values) => {
                                            setSelectedZones(new Set(values));
                                          }}
                                          className="flex flex-wrap justify-start gap-2"
                                        >
                                          {Object.entries(grouped).map(([zone, list]) => (
                                            <ToggleGroupItem
                                              key={zone}
                                              value={zone}
                                              variant="outline"
                                              size="sm"
                                              className={cn(
                                                "inline-flex items-center gap-1",
                                                selectedZones.has(zone) && "font-semibold"
                                              )}
                                            >
                                              <span>{zone}</span>
                                              <Badge variant="ghost">
                                                {list.length}
                                              </Badge>
                                            </ToggleGroupItem>
                                          ))}
                                        </ToggleGroup>

                                        {/* Filtered venues */}
                                        <ItemGroup className="flex-col gap-2">
                                          {Object.entries(grouped)
                                            .filter(([zone]) => selectedZones.has(zone))
                                            .flatMap(([zone, list]) =>
                                              [...list]
                                                .sort((a: any, b: any) => {
                                                  const titleA =
                                                    a?.properties?.Name ||
                                                    a?.properties?.title ||
                                                    a?.properties?.name ||
                                                    "Untitled";

                                                  const titleB =
                                                    b?.properties?.Name ||
                                                    b?.properties?.title ||
                                                    b?.properties?.name ||
                                                    "Untitled";

                                                  return titleA.localeCompare(titleB);
                                                })
                                                .map((feature: any, index) => {
                                                  const title =
                                                    feature?.properties?.Name ||
                                                    feature?.properties?.title ||
                                                    feature?.properties?.name ||
                                                    "Untitled";

                                                  return (
                                                    <Item
                                                      key={`${zone}-${index}`}
                                                      variant="default"
                                                      size="xs"
                                                      onClick={() => {
                                                        const [lng, lat] =
                                                          feature.geometry.coordinates as [number, number];

                                                        const id =
                                                          feature.properties?.id ??
                                                          feature.id ??
                                                          feature.properties?.docId ??
                                                          feature.properties?.placeId;

                                                        handleClick(lng, lat, title, id);
                                                      }}
                                                      className={cn(
                                                        "w-full cursor-pointer transition text-sm font-medium",
                                                        (selectedTitle === title) ? "bg-primary/70 font-semibold" : "hover:bg-primary/10"
                                                      )}
                                                    >
                                                      <ItemContent>
                                                        <ItemTitle>
                                                          {title}
                                                        </ItemTitle>
                                                      </ItemContent>
                                                      {feature.properties?.imageUrl && (
                                                        <ItemMedia variant="image">
                                                          <img
                                                            src={
                                                              (feature.properties?.imageUrl as string) ||
                                                              undefined
                                                            }
                                                            alt={title}
                                                          />
                                                        </ItemMedia>
                                                      )}
                                                    </Item>
                                                  );
                                                })
                                            )}
                                        </ItemGroup>

                                        {/* Nothing selected */}
                                        {selectedZones.size === 0 && (
                                          <Empty>
                                            <EmptyContent>
                                              <EmptyDescription>
                                                {t("select_zone", "Select a zone to show its items.")}
                                              </EmptyDescription>
                                            </EmptyContent>
                                          </Empty>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
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
