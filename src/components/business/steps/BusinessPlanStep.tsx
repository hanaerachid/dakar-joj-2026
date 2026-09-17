
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_CATEGORIES, BUSINESS_PLANS } from "../business-create.config";

import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

export function BusinessPlanStep({
  title,
  onPlanChange,
}: {
  title?: string;
  onPlanChange: (
    plan: BusinessCreateValues["pack"],
  ) => void;
}) {
  const { watch } =
    useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const values = watch();
  const selectedPlan = values.pack;
  const category = BUSINESS_CATEGORIES[values.cat];
  const plan = BUSINESS_PLANS[selectedPlan || "discover"];

  const formatPrice = (price: number) =>
    price === 0
      ? t("businessCreate.plan.free", "Free")
      : `${price.toLocaleString()} FCFA`;

  return (
    <>
      {title &&
        <CardHeader>
          <CardTitle className="font-semibold">
            {title}
          </CardTitle>
        </CardHeader>
      }
      <CardContent className="space-y-6">

        <ItemGroup className="grid gap-3 sm:grid-cols-2">
          {Object.entries(BUSINESS_PLANS).map(
            ([key, item]) => {
              const selected = selectedPlan === key;

              return (
                <Item
                  key={key}
                  variant="outline"
                  className={`hover:bg-primary/10 flex-col items-start cursor-pointer ${selected
                    ? "bg-primary/20 border-primary ring-1 ring-primary"
                    : ""
                    }`}
                  onClick={() =>
                    onPlanChange(
                      key as BusinessCreateValues["pack"],
                    )
                  }
                >
                  <ItemContent className="space-y-2">

                    <ItemTitle className="text-xs font-semibold uppercase">
                      {t(
                        `businessCreate.plans.${key}`,
                        item.label,
                      )}
                    </ItemTitle>

                    <ItemDescription className="text-2xl font-bold text-foreground">
                      {formatPrice(item.price)}
                      {item.price > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {" "}
                          / {t("common.month", "month")}
                        </span>
                      )}
                    </ItemDescription>
                  </ItemContent>

                  <ItemContent>
                    <ItemDescription className="text-sm text-muted-foreground">
                      {t(
                        `businessCreate.plans.${key}Description`,
                        `${item.photos} photos${item.video ? " + video" : ""
                        }`,
                      )}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              );
            },
          )}
        </ItemGroup>

        <h3 className="font-semibold">
          {t(
            "businessCreate.summary.title",
            "Summary",
          )}
        </h3>

        <div className="grid grid-cols-2 gap-6 bg-muted/50 p-4 bg-primary/5 rounded-xl">
          <SummaryRow
            label={t(
              "businessCreate.summary.business",
              "Business",
            )}
            value={values.name || "—"}
          />

          <SummaryRow
            label={t(
              "businessCreate.summary.category",
              "Category",
            )}
            value={t(
              `businessCreate.categories.${values.cat}`,
              category.label,
            )}
          />

          <SummaryRow
            label={t(
              "businessCreate.summary.photos",
              "Photos",
            )}
            value={`${values.photos?.length}`}
          />

          <SummaryRow
            label={t(
              "businessCreate.summary.plan",
              "Plan",
            )}
            value={t(
              `businessCreate.plans.${selectedPlan}`,
              plan.label,
            )}
          />

          <SummaryRow
            label={t(
              "businessCreate.summary.monthlyCost",
              "Monthly cost",
            )}
            value={formatPrice(plan.price)}
          />
        </div>
      </CardContent>
    </>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>
      <span className="text-right font-medium">
        {value}
      </span>
    </div>
  );
}