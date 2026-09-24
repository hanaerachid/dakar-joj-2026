import { useEffect, useState } from "react";
import { AlertCircleIcon } from "lucide-react";
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
import { cn } from "cn";

type Props = {
  CATEGORIES: any[];
  MAIN_CATEGORIES: readonly any[];
  openMainCategoryIds: string[];
  setOpenMainCategoryIds: (value: string[]) => void;
  mainCategoryChecked: Record<string, boolean>;
  handleMainCategoryCheck: (checked: boolean, mainCategoryId: string) => void;
  openCatIds: Record<string, string[]>;
  setOpenCatIds: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleCategoryOpen: (mainCategoryId: string, categoryId: string) => void;
  activeCategory: any;

  checkedCats: Record<string, boolean>;
  handleCategoryCheck: (
    checked: boolean,
    catId: string,
  ) => void;

  venues: any[];

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
    openMainCategoryIds,
    setOpenMainCategoryIds,
    mainCategoryChecked,
    handleMainCategoryCheck,
    openCatIds,
    setOpenCatIds,
    handleCategoryOpen,
    activeCategory,
    checkedCats,
    handleCategoryCheck,
    venues,
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
    <Accordion
      multiple
      value={openMainCategoryIds}
      onValueChange={setOpenMainCategoryIds}
    >
      {MAIN_CATEGORIES.map((main) => {
        const children = CATEGORIES.filter((category) => main.categories.includes(category.id));
        const mainEnabled = !!mainCategoryChecked[main.id];
        return (
          <AccordionItem
            key={main.id}
            value={main.id}
            disabled={!children.length}
          >
            {/* Header */}
            <AccordionTrigger className="w-full flex items-center justify-between gap-3 px-3.5 py-3.5 cursor-pointer select-none" >
              <h2 className="flex-1 flex items-center gap-2.5" >
                <main.icon
                  className="h-5 w-5"
                  style={{ color: main.color }}
                />
                <span className="font-medium text-foreground" >
                  {main.label}
                </span>
                <Badge variant="secondary" >
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
            <AccordionContent>
              <Accordion
                multiple
                value={openCatIds[main.id] ?? []}
                onValueChange={(value) => {
                  setOpenCatIds((current) => ({
                    ...current,
                    [main.id]: value,
                  }));
                  const previousValue = openCatIds[main.id] ?? [];
                  const openedCategoryId = value.find((id) => !previousValue.includes(id));
                  if (openedCategoryId) handleCategoryOpen(main.id, openedCategoryId);
                }}
              >
                {children.map((category) => {
                  const active = category.id === activeCategory.id;
                  return (
                    <AccordionItem
                      key={category.id}
                      value={category.id}
                    >
                      <AccordionTrigger
                        tabIndex={0}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-3.5 cursor-pointer select-none"
                      >
                        <Checkbox
                          checked={!!checkedCats[category.id]}
                          onCheckedChange={(checked) => handleCategoryCheck(checked === true, category.id)}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) => event.stopPropagation()}
                          aria-label={`Toggle ${category.label}`}
                          id={category.id}
                        />
                        <h3 className="flex-1 flex items-center gap-2.5" >
                          <span className="font-medium text-foreground">
                            {category.label}
                          </span>

                          {active && (
                            <Badge variant="secondary">
                              {venues.length}
                            </Badge>
                          )}
                        </h3>
                      </AccordionTrigger>

                      <AccordionContent>
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
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
