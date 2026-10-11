import { useEffect, useState } from "react";
import { AlertCircleIcon, Flame } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Skeleton } from "../ui/skeleton";
import { useTranslation } from "react-i18next";
// import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "cn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { MapManager } from "@/core/MapManager";
import { useStateContext } from "../state-provider";

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
const ALL_ZONES = "__all__";

export function PlacesCategoryList(props: Props) {
  const {
    CATEGORIES,
    MAIN_CATEGORIES,
    openMainCategoryIds,
    setOpenMainCategoryIds,
    mainCategoryChecked,
    handleMainCategoryCheck,
    handleCategoryOpen,
    venues,
    loading,
    loadError,
    grouped,
    handleClick,
    selectedTitle,
  } = props;

  const { t } = useTranslation();
  const [api, setApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const [selectedZones, setSelectedZones] = useState<Record<string, string>>({});
  const { torchVisible, setTorchVisible } = useStateContext();
  const mapManager = MapManager.getInstance();

  const handleToggleTorch = async () => {
    try {
      setTorchVisible(await mapManager.toggleTorch());
    } catch {
      setTorchVisible(false);
    }
  };

  useEffect(() => {
    setSelectedZones((current) => {
      const next = { ...current };
      for (const main of MAIN_CATEGORIES) {
        if (!(main.id in next)) next[main.id] = ALL_ZONES;
      }
      return next;
    });
  }, [MAIN_CATEGORIES, mainCategoryChecked]);

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }

    update()

    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  const handleMainCategoriesChange = (value: string[]) => {
    setOpenMainCategoryIds(value);
    const openedMainCategoryId = value.find((id) => !openMainCategoryIds.includes(id));
    if (!openedMainCategoryId) return;

    const mainCategory = MAIN_CATEGORIES.find((main) => main.id === openedMainCategoryId);
    const firstCategoryId = mainCategory?.categories.find((categoryId: string) =>
      CATEGORIES.some((category) => category.id === categoryId),
    );
    if (firstCategoryId) handleCategoryOpen(openedMainCategoryId, firstCategoryId);
  };

  return (<div className="space-y-2">
    <Item variant="outline" size="xs" className={cn(
      "w-full cursor-default select-none",
      "bg-[#FFA500]/10"
    )}>
      <ItemMedia
        variant="icon"
        className="w-6 h-6"
      >
        <Flame className={"h-6 w-6 text-[#FFA500]"} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {t("home.torch", "Torch")}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Switch
          className="ms-auto cursor-pointer"
          checked={torchVisible}
          onCheckedChange={handleToggleTorch}
        />
      </ItemActions>
    </Item>
    <Accordion
      multiple
      value={openMainCategoryIds}
      onValueChange={handleMainCategoriesChange}
    >
      {[...MAIN_CATEGORIES]
        .sort((a, b) => {
          const aHasChildren = CATEGORIES.some((category) =>
            a.categories.includes(category.id)
          );
          const bHasChildren = CATEGORIES.some((category) =>
            b.categories.includes(category.id)
          );

          return Number(bHasChildren) - Number(aHasChildren);
        })
        .map((main) => {
          const children = CATEGORIES.filter((category) => main.categories.includes(category.id));
          const childCategoryIds = new Set(children.map((category) =>
            category.id
          ));

          const mainVenues = venues.filter((venue: any) =>
            childCategoryIds.has(venue.properties?.categoryId)
          );
          const mainGrouped = Object.fromEntries(
            Object.entries(grouped).map(([zone, list]) => [
              zone,
              list.filter((venue: any) => childCategoryIds.has(venue.properties?.categoryId)),
            ]).filter(([, list]) => (list as any[]).length > 0)
          ) as Record<string, any[]>;
          const mainEnabled = !!mainCategoryChecked[main.id];
          const selectedZone = selectedZones[main.id] ?? ALL_ZONES;
          const setSelectedZone = (zone: string) => setSelectedZones((current) => ({ ...current, [main.id]: zone }));

          return (
            <AccordionItem
              key={main.id}
              value={main.id}
              disabled={!children.length}
            >
              {/* Header */}
              <AccordionTrigger className={cn(
                "w-full flex items-center justify-between gap-3",
                "px-3.5 py-3.5 cursor-pointer select-none",
                "[&_[data-slot=accordion-trigger-icon]]:order-first",
              )} >
                <h2 className="flex-1 flex items-center gap-2.5" >
                  <main.icon
                    className="h-5 w-5"
                    style={{ color: main.color }}
                  />
                  <span className="font-medium text-foreground" >
                    {main.label}
                  </span>
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
                {!loading && !loadError && !mainVenues.length && (
                  <Empty>
                    <EmptyContent>
                      <EmptyDescription>
                        {t("items_appear_here", "Items appear here.")}
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

                {loading && (
                  <div className="flex-col items-center space-y-1">
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} className="min-h-10">
                      </Skeleton>
                    ))}
                  </div>
                )}

                {!loading && !loadError && !!mainVenues.length && (
                  <div className="flex flex-col gap-2">
                    {/* Zone filters */}
                    <Carousel
                      setApi={setApi}
                      className="w-full whitespace-nowrap"
                      orientation="horizontal"
                      opts={{
                        align: "start",
                        // dragFree: true,
                      }}
                    >
                      <div
                        className={cn(
                          "relative",
                          canScrollPrev && canScrollNext &&
                          "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%-48px),transparent)]",
                          !canScrollPrev && canScrollNext &&
                          "[mask-image:linear-gradient(to_right,#000,#000_calc(100%-48px),transparent)]",
                          canScrollPrev && !canScrollNext &&
                          "[mask-image:linear-gradient(to_right,transparent,#000_48px,#000)]",
                        )}
                      >

                      <CarouselContent className={cn(
                        "-ml-1 mr-1",
                        canScrollNext && "md:pe-6",
                        canScrollPrev && "md:ps-6"
                      )}>
                        <CarouselItem className="basis-auto shrink-0 pl-1">
                          <Button
                            variant={selectedZone === ALL_ZONES ? "default" : "outline"}
                            size="default"
                            onClick={() => setSelectedZone(ALL_ZONES)}
                            className="whitespace-nowrap"
                          >
                              {t("all", "All")}
                            <Badge variant="ghost">
                              {mainVenues.length}
                            </Badge>
                          </Button>
                        </CarouselItem>

                        {Object.entries(mainGrouped).map(([zone, list]) => (
                          <CarouselItem
                            key={zone}
                            className="basis-auto shrink-0 pl-1"
                          >
                            <Button
                              variant={selectedZone === zone ? "default" : "outline"}
                              size="default"
                              onClick={() => setSelectedZone(zone)}
                              className="whitespace-nowrap"
                            >
                              {zone}
                              <Badge variant="ghost">
                                {list.length}
                              </Badge>
                            </Button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      </div>

                      <CarouselPrevious
                        size="icon-sm"
                        variant="ghost"
                        className={cn(
                          "left-0",
                          !canScrollPrev && "hidden"
                        )}
                      />
                      <CarouselNext
                        size="icon-sm"
                        variant="ghost"
                        className={cn(
                          "right-0",
                          !canScrollNext && "hidden"
                        )}
                      />
                    </Carousel>

                    {children.map((category) => {
                      const categoryVenues = Object.entries(mainGrouped)
                        .filter(([zone]) => selectedZone === ALL_ZONES || selectedZone === zone)
                        .flatMap(([, list]) => list)
                        .filter((venue: any) =>
                          venue.properties?.categoryId === category.id
                        )
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

                      return (
                        <div key={category.id} className="space-y-3">
                          <h3 className="pt-3.5 text-xs/4 uppercase text-muted-foreground">{category.label}</h3>
                          {!categoryVenues.length && (
                            <Empty>
                              <EmptyContent>
                                <EmptyDescription>{category.hint ?? t("items_appear_here", "Items appear here.")}</EmptyDescription>
                              </EmptyContent>
                            </Empty>
                          )}
                          <ItemGroup>

                            {categoryVenues
                              .map((feature: any, index) => {
                                const title =
                                  feature?.properties?.Name ||
                                  feature?.properties?.title ||
                                  feature?.properties?.name ||
                                  "Untitled";

                                return (
                                  <Item
                                    key={`${category.id}-${feature.properties?.id ?? feature.id ?? index}`}
                                    variant="muted"
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
                                      "w-full cursor-pointer transition",
                                      (selectedTitle === title) ? "bg-primary/70" : "hover:bg-primary/10"
                                    )}
                                  >
                                    <ItemContent>
                                      <ItemTitle
                                        className={cn(
                                          "text-sm font-medium",
                                          (selectedTitle === title) && "font-semibold"
                                        )}
                                      >
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
                            }
                          </ItemGroup>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
    </Accordion>
  </div>);
}
