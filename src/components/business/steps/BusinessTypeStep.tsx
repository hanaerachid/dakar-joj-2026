
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessCreateValues } from "../business-create.schema";
import { BUSINESS_CATEGORIES } from "../business-create.config";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { cn } from "cn";

export function BusinessTypeStep() {
  const { watch, setValue } =
    useFormContext<BusinessCreateValues>();
  const { t } = useTranslation();

  const selected = watch("cat");

  return (
    <>
      <CardHeader>
        <CardTitle>
          {t(
            "businessCreate.type.title",
            "What type of business do you want to list?",
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ItemGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(BUSINESS_CATEGORIES).map(
            ([key, category]) => (
              <Item
                key={key}
                variant="outline"
                className={cn(
                  "flex-col align-center h-auto min-h-20 user-select-none cursor-pointer",
                  selected === key ? "bg-primary/20 border-primary ring-1 ring-primary cursor-arrow" : "hover:bg-primary/10 cursor-pointer",
                )}
                onClick={() => {
                  setValue(
                    "cat",
                    key as BusinessCreateValues["cat"],
                    { shouldValidate: true },
                  );

                  // Reset category-specific fields
                  // to avoid carrying stale values.
                  setValue("spec", {});
                }}
              >
                <ItemMedia>
                  <category.icon className={selected === key ? "text-primary" : ""} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className={selected === key ? "text-primary font-bold" : ""}>

                    {t(
                      `businessCreate.categories.${key}`,
                      category.label,
                    )}
                  </ItemTitle>
                </ItemContent>
              </Item>
            ),
          )}
        </ItemGroup>
      </CardContent>
    </>
  );
}