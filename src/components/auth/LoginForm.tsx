// auth/LoginForm.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signIn } from "../../auth/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircleIcon } from "lucide-react";

export function LoginForm({
  onRegister,
  onForgot,
  onDone,
}: {
  onRegister: () => void;
  onForgot: () => void;
  onDone: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, pw);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
      <FieldGroup className="flex-1 overflow-y-auto">
        <Field>
          <FieldLabel
            className="text-sm font-medium"
            htmlFor="email"
          >
            {t("auth.common.emailLabel")}
          </FieldLabel>
          <Input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
            id="email"
            type="email"
            required
            autoComplete="on"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder={t("auth.common.emailPlaceholder")}
          />
        </Field>
        <Field>
          <FieldLabel
            className="text-sm font-medium flex justify-between items-center"
            htmlFor="password"
          >
            <span>{t("auth.common.passwordLabel")}</span>
            <Button
              type="button"
              variant="link"
              onClick={onForgot}
              className="text-xs"
            >
              {t("auth.login.forgotPassword")}
            </Button>

          </FieldLabel>
          <Input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
            id="password"
            type="password"
            required
            autoComplete="on"
            value={pw}
            onChange={(e) => setPw(e.currentTarget.value)}
            placeholder={t("auth.common.passwordPlaceholder")}
          />
        </Field>
      </FieldGroup>

      <div className="mt-4">
        <ButtonGroup orientation="vertical" className="w-full">
          <Button
            type="submit"
            variant="default"
            disabled={loading}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {loading ? t("auth.login.submitting") : t("auth.login.submit")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onRegister}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {t("auth.login.createAccount")}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  );
}
