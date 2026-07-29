// auth/RegisterForm.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signUp } from "../../auth/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircleIcon } from "lucide-react";

export function RegisterForm({
  onLogin,
  onDone,
}: {
  onLogin: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agree) return;

    setLoading(true);
    try {
      await signUp(email, pw);
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
            htmlFor="name"
            className="text-sm font-medium"
          >
            {t("auth.common.nameLabel")}
          </FieldLabel>
          <Input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
            id="name"
            type="text"
            required
            value={name}
            autoComplete="on"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder={t("auth.common.namePlaceholder")}
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="emailRegister"
            className="text-sm font-medium"
          >
            {t("auth.common.emailLabel")}
          </FieldLabel>
          <Input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
            id="emailRegister"
            type="email"
            value={email}
            required
            autoComplete="on"
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder={t("auth.common.emailPlaceholder")}
          />
        </Field>

        <Field>
          <FieldLabel
            htmlFor="newPassword"
            className="text-sm font-medium"
          >
            {t("auth.common.passwordLabel")}
          </FieldLabel>
          <FieldDescription>
            {t("auth.register.passwordPlaceholder")}
          </FieldDescription>
          <Input
            className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/10"
            id="newPassword"
            type="password"
            required
            autoComplete="on"
            value={pw}
            onChange={(e) => setPw(e.currentTarget.value)}
            placeholder="********"
          />
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={(checked) => setAgree(!!checked)}
          />
          <FieldLabel
            htmlFor="agree"
            className="flex items-center gap-2 text-sm"
          >
            {t("auth.common.terms")}
          </FieldLabel>
        </Field>
      </FieldGroup>

      <div className="mt-4">
        <ButtonGroup orientation="vertical" className="w-full">
          <Button
            type="submit"
            variant="default"
            disabled={!agree || loading}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {loading ? t("auth.register.submitting") : t("auth.register.submit")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onLogin}
            className="w-full rounded-lg py-2.5 active:scale-[.99] transition"
          >
            {t("auth.common.backToSignIn")}
          </Button>
        </ButtonGroup>
      </div>
    </form>
  );
}
