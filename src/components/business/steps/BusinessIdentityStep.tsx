import { useNavigate } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/common/Field";
import { hasBusinessCapability } from "../business-plan";
import type { BusinessCreateValues } from "../business-create.schema";

export function BusinessIdentityStep(
  { title }: { title?: string },
) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { watch } = useFormContext<BusinessCreateValues>();
  const plan = watch("pack");

  return (
    <>
      {title &&
        <CardHeader>
          <CardTitle className="font-bold">
            {title}
          </CardTitle>
        </CardHeader>
      }
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField
              name="name"
              label={t(
                "businessCreate.fields.name",
                "Business name",
              )}
              placeholder="e.g. Teranga Plaza"
            />
          </div>

          <div className="relative">
            <TextField
              type="tel"
              name="tel"
              label={t(
                "businessCreate.fields.tel",
                "Phone",
              )}
              disabled={!hasBusinessCapability(plan, "phone")}
              className={cn(!hasBusinessCapability(plan, "phone") && "opacity-50")}
              placeholder="+221..."
            />
            {!hasBusinessCapability(plan, "phone") && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade your plan to add a phone number
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <TextField
              type="tel"
              name="wa"
              disabled={!hasBusinessCapability(plan, "whatsapp")}
              className={cn(!hasBusinessCapability(plan, "whatsapp") && "opacity-50")}
              label={t(
                "businessCreate.fields.wa",
                "WhatsApp",
              )}
              placeholder="221..."
            />
            {!hasBusinessCapability(plan, "whatsapp") && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade your plan to add WhatsApp
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <TextField
              type="email"
              name="email"
              disabled={!hasBusinessCapability(plan, "email")}
              className={cn(!hasBusinessCapability(plan, "email") && "opacity-50")}
              label={t("businessCreate.fields.email", "Email")}
              placeholder="contact@example.com"
            />

            {!hasBusinessCapability(plan, "email") && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade your plan to add an email address
                </Button>
              </div>
            )}
          </div>

          <div className="relative">
            <TextField
              type="url"
              name="website"
              disabled={!hasBusinessCapability(plan, "website")}
              className={cn(!hasBusinessCapability(plan, "website") && "opacity-50")}
              label={t(
                "businessCreate.fields.website",
                "Website",
              )}
              placeholder="https://..."
            />
            {!hasBusinessCapability(plan, "website") && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/pricing")}
                >
                  Upgrade your plan to add a website
                </Button>
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="relative">
              <TextField
                type="text"
                name="social"
                disabled={!hasBusinessCapability(plan, "SNS")}
                className={cn(!hasBusinessCapability(plan, "SNS") && "opacity-50")}
                label={t(
                  "businessCreate.fields.social",
                  "Instagram / social media",
                )}
                placeholder="@business"
              />
              {!hasBusinessCapability(plan, "SNS") && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/60">
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => navigate("/pricing")}
                  >
                    Upgrade your plan to add social media
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}