import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  icon: string;
  label: string;
  aria: string;
};

const languages: Language[] =
  [
    {
      code: "fr",
      icon: "emojione:flag-for-france",
      label: "FR",
      aria: "Switch to French",
    },
    {
      code: "en",
      icon: "circle-flags:uk",
      label: "EN",
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
    <ToggleGroup
      value={[activeLang]}
      onValueChange={(values) => {
        const lang = values[0];
        if (lang) {
          handleSelect(lang as Lang);
        }
      }}
      className="rounded-full p-0.5"
    >
      {languages.map((lang) => (
        <ToggleGroupItem
          key={lang.code}
          value={lang.code}
          aria-label={lang.aria}
          className="flex items-center gap-2 rounded-full px-3 py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
        >
          <Icon icon={lang.icon} className="h-4 w-4" />
          <span className="text-xs uppercase">
            {lang.label}
          </span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
