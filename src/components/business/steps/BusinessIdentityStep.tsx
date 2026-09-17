
import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/common/Field";

export function BusinessIdentityStep(
  { title }: { title?: string },
) {
  const { t } = useTranslation();

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

          <TextField
            type="tel"
            name="tel"
            label={t(
              "businessCreate.fields.tel",
              "Phone",
            )}
            placeholder="+221..."
          />

          <TextField
            name="wa"
            label={t(
              "businessCreate.fields.wa",
              "WhatsApp",
            )}
            placeholder="221..."
          />

          <TextField
            type="email"
            name="email"
            label={t(
              "businessCreate.fields.email",
              "Email",
            )}
            placeholder="contact@example.com"
          />

          <TextField
            type="url"
            name="website"
            label={t(
              "businessCreate.fields.website",
              "Website",
            )}
            placeholder="https://..."
          />

          <div className="sm:col-span-2">
            <TextField
              name="social"
              label={t(
                "businessCreate.fields.social",
                "Instagram / social media",
              )}
              placeholder="@business"
            />
          </div>
        </div>
        <Alert variant="default">
          <AlertCircle />
          <AlertDescription>
            {t(
              "businessCreate.identity.contactHint",
              "Provide at least a phone number or an email address so visitors can contact you.",
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </>
  );
}