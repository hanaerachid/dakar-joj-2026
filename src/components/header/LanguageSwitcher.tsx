import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lang = "fr" | "en";

type Props = {
  value?: Lang;
  onChange?: (lang: Lang) => void;
};

const normalizeLang = (lang?: string): Lang => {
  if (lang?.startsWith("fr")) return "fr";
  return "en";
};

type Language = {
  code: Lang;
  label: string;
  aria: string;
};

const languages: Language[] =
  [
    {
      code: "fr",
      label: "Français",
      aria: "Switch to French",
    },
    {
      code: "en",
      label: "English",
      aria: "Switch to English",
    },
  ];

export function LanguageSwitcher({ value, onChange }: Props) {
  const { i18n } = useTranslation();
  const activeLang =
    value ?? normalizeLang(i18n.resolvedLanguage ?? i18n.language);

  const handleSelect = (lang: Lang) => {
    if (normalizeLang(i18n.language) !== lang) {
      void i18n.changeLanguage(lang);
    }
    onChange?.(lang);
  };

  return (
    <Select
      value={activeLang}
      onValueChange={(value) => handleSelect(value as Lang)}
    >
      <SelectTrigger
        aria-label="Select language"
      >
        <Globe className="h-5 w-5" />
        <SelectValue className="sr-only" />
      </SelectTrigger>

      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
