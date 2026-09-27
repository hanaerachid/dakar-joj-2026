import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table"
import { CheckIcon, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { type DataTableFeatures } from "@/utils/data-table-features"
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { getCategoryIcon, getPricingPlanInfo } from "@/utils/helpers";
import type { BusinessListing } from "@/shared/contracts";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import {
  listBusinessListings,
  deleteBusinessListing,
} from "@/lib/api/submitBusinessListing";
import { type BreadcrumbConfig, Breadcrumbs } from "@/components/BreadCrumbs";
import { DataTable } from "@/components/DataTable";

const columnHelper = createColumnHelper<DataTableFeatures, BusinessListing>()

export function BusinessPage4Admin() {
  const { t } = useTranslation();
  // const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [businessListings, setBusinessListings] = useState<BusinessListing[]>([]);
  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<"updated" | "name">("updated");

  const breadcrumbConfig: BreadcrumbConfig = {
    "/admin": {
      label: t("business.admin", "Administration"),
    },
    "/admin/listings": {
      label: t("business.listings", "Business listings"),
    },
  }

  async function loadBusinessListings() {
    setLoading(true);
    try {
      let items: BusinessListing[] = [];

      items = (await listBusinessListings()) as BusinessListing[];

      // sort
      items.sort((a: BusinessListing, b: BusinessListing) => {
        // if (sort === "updated") {
        //   const at = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        //   const bt = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        //   if (bt !== at) return bt - at;
        // }
        return (a.name || "").localeCompare(b.name || "");
      });

      setBusinessListings(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBusinessListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeleteBusinessListing(item: BusinessListing) {
    if (!confirm("Delete this business listing? This cannot be undone.")) return;
    try {
      await deleteBusinessListing(item._id);
      await loadBusinessListings();
    } catch (error) {
      console.error("Failed to delete business listing:", error);
      toast.error("Failed to delete the business listing. Please try again.");
    }
  }

  const columns = columnHelper.columns([
    columnHelper.accessor("photos", {
      header: "Image",
      cell: ({ row }) => {
        const photos = row.original.photos;
        const firstPhoto = photos && photos.length > 0 ? photos[0] : null;
        return firstPhoto ? (
          <img
            src={firstPhoto}
            alt={row.original.name}
            className="h-12 aspect-square rounded object-cover"
          />
        ) : (
          <div className="h-12 aspect-square rounded bg-gray-200" />
        );
      }
    }),
    columnHelper.accessor("name", {
      header: "Name",
    }),
    columnHelper.accessor("cat", {
      header: "Category",
      cell: ({ row }) => {
        const Icon = getCategoryIcon(row.original.cat);

        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {getFriendlyCategoryName(row.original.cat, t)}
          </div>
        )
      },
    }),
    columnHelper.accessor("pack", {
      header: "Plan",
      cell: ({ row }) => {
        const { label, icon: Icon } = getPricingPlanInfo(row.original.pack);

        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {label}
          </div>
        )
      }
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const item: any = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            {item.verified ? (
              <div className="flex items-center justify-center">
                <CheckIcon className="w-4 h-4" />
                <span className="text-sm text-sm px-2 py-1 text-muted-foreground">{t("admin.verified_business", "Verified")}</span>
              </div>
            ) : (
              <Button
                variant="default"
                size="default"
                className="flex items-center justify-center"
                disabled inert
              // onClick={() => navigate(`/business/${item._id}`)}
              >
                <span >{t("admin.approve_listing", "Verify")}</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost" size="icon-sm"
                    aria-label={t("more_actions", "More actions")}
                    className="w-8 h-8 flex items-center justify-center"
                  >
                    <MoreVertical />
                    <span className="sr-only">Open actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDeleteBusinessListing(item)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ])

  return (
    <div className="mx-auto max-w-6xl pt-16 pb-8 space-y-6">
      <Breadcrumbs
        config={breadcrumbConfig}
      />
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
          {/* Title + subtitle */}
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg md:text-xl font-semibold tracking-tight text-foreground/90">
              <span className="truncate">{t("business.listings", "Business listings")}</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && (
          <div className="col-span-full grid gap-2 grid-cols-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="overflow-hidden rounded-md" >
                <Skeleton className="p-6" />
              </Skeleton>
            ))}
          </div>
        )}

        {!loading && businessListings.length === 0 && (
          <Empty className="col-span-full border border-foreground/30 p-8 text-foreground/50 shadow-sm">
            <EmptyHeader>
              <EmptyDescription className="text-center text-sm text-foreground/50">
                {t("business.not_found", "No business listings found")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
      {!loading && (
        <div className="container mx-auto">
          <DataTable
            columns={columns}
            data={businessListings}
            filterBy={"name"}
          />
        </div>
      )}
    </div>
  );
}
