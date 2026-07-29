// src/auth/ResetPasswordForm.tsx
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { resetPassword } from "../../auth/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircleIcon } from "lucide-react";

export function ResetPasswordForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {!sent ? (
          <FieldSet>
            <FieldLegend variant="label" className="text-sm">
              {t("auth.reset.intro")}
            </FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel
                  className="text-sm font-medium"
                  htmlFor="emailReset"
                >
                  {t("auth.common.emailLabel")}
                </FieldLabel>
                <Input
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
                  id="emailReset"
                  type="email"
                  required
                  autoComplete="on"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  placeholder={t("auth.common.emailPlaceholder")}
                />
              </Field>
            </FieldGroup>

            {error && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </FieldSet>
        ) : (
          <Alert
            variant="default"
            className="p-3 text-sm"
          >
            <AlertDescription>
              <Trans
                i18nKey="auth.reset.sentDescription"
                values={{ email }}
                components={{ strong: <b /> }}
              />
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="mt-4">
        <ButtonGroup orientation="vertical" className="w-full">
          {!sent && (
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
            >
              {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={onLogin}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {t("auth.reset.backToLogin")}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  );
}
