import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createColumnHelper } from "@tanstack/react-table"
import { CheckIcon, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { type DataTableFeatures } from "@/utils/data-table-features"
import { getFriendlyCategoryName } from "@/utils/key-translations";
import { getMediaUrl } from "@/lib/fileConvert";
import { getCategoryIcon, getPricingPlanInfo } from "@/utils/helpers";
import type { BusinessListing } from "@/shared/contracts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  setListingVerified,
} from "@/lib/api/listings";
import { type BreadcrumbConfig, Breadcrumbs } from "@/components/BreadCrumbs";
import { DataTable } from "@/components/DataTable";
import { useModalContext } from "@/components/modal-provider";

type BusinessListingWithOwner = BusinessListing & {
  _id?: string;
  verified?: boolean;
  ownerId?: string;
  owner?: {
    name?: string;
    imageUrl?: string;
  } | null;
};

const columnHelper = createColumnHelper<DataTableFeatures, BusinessListingWithOwner>()

export function BusinessPage4Admin() {
  const { t } = useTranslation();
  // const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [businessListings, setBusinessListings] = useState<BusinessListingWithOwner[]>([]);
  const { setIsOpen, setModalContent } = useModalContext();

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

  async function handleDelete(item: BusinessListing) {
    setModalContent({
      title: t("delete_confirmation_title", "Delete this business listing?"),
      size: "md",
      children: (
        <p>{t("delete_confirmation_message", "This cannot be undone.")}</p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: ((
        <>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={async () => {
              const previousListings = businessListings;
              setBusinessListings((listings) =>
                listings.filter((listing) => listing._id !== item._id)
              );
              setIsOpen(false);
              try {
                await deleteBusinessListing(item._id);
                await loadBusinessListings();
              } catch (error) {
                console.error("Failed to delete business listing:", error);
                setBusinessListings(previousListings);
                toast.error(
                  t("listing_deletion_failure", "Failed to delete the business listing. Please try again.")
                );
              }
            }}
          >
            {t("confirm", "Confirm")}
          </Button>
        </>
      )),
    });

    setIsOpen(true);
  }

  const handleVerify = async (
    id: any,
    verified: boolean,
  ) => {

    setModalContent({
      title: t("approve_confirmation_title", "Approve this business listing?"),
      size: "md",
      children: (
        <p>{t("approve_confirmation_message", "Are you sure?")}</p>
      ),
      onClose: () => {
        setIsOpen(false);
      },
      footer: ((
        <>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {t("cancel", "Cancel")}
          </Button>

          <Button
            variant="default"
            onClick={async () => {
              setIsOpen(false);
              try {
                await setListingVerified(id, verified);
                await loadBusinessListings();
              } catch (error) {
                console.error("Failed to approve business listing:", error);
                toast.error(
                  t("listing_approbation_failure", "Failed to approve the business listing. Please try again.")
                );
              }
            }}
          >
            {t("confirm", "Confirm")}
          </Button>
        </>
      )),
    });

    setIsOpen(true);
  };

  const columns = columnHelper.columns([
    columnHelper.accessor("photos", {
      header: "Image",
      cell: ({ row }) => {
        const photos = row.original.photos;
        const firstPhoto = photos && photos.length > 0 ? photos[0] : null;
        return firstPhoto ? (
          <img
            src={getMediaUrl(firstPhoto)}
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
    columnHelper.accessor("ownerId", {
      header: "Owner",
      cell: ({ row }) => {
        const ownerName = row.original.owner?.name;
        const ownerPhoto = row.original.owner?.imageUrl;
        return (
          <div className="flex items-center justify-start gap-1">
            <Avatar size="sm">
              <AvatarImage
                src={ownerPhoto || undefined}
                alt={ownerName || "Owner"}
              />

              <AvatarFallback
                className="text-xs"
              >
                {ownerName ? ownerName[0].toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground text-sm">
              {ownerName ? ownerName : t("admin.unknown_owner", "Unknown")}
            </span>
          </div>
        )
      }
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
        const item = row.original

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
                onClick={() => handleVerify(item._id, true)}
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
                  onClick={() => handleDelete(item)}
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
    <main className="mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 pt-16 pb-8 space-y-6">
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
    </main>
  );
}
