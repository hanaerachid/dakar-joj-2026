import { useEffect } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Field, FieldDescription } from "@/components/ui/field";
import { SearchIcon, X } from "lucide-react";
import { useStateContext } from "@/components/state-provider";

export const SearchPlacesInput = ({
  query,
  onQueryChange,
  placeholder,
  tipText,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  placeholder?: string;
  tipText?: string | null;
}) => {
  const { isSearchOpen, setIsSearchOpen, searchInputRef } = useStateContext();

  useEffect(() => {
    if (!isSearchOpen) return;

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isSearchOpen, searchInputRef]);

  useEffect(() => {
    if (!query.trim()) {
      setIsSearchOpen(false);
    } else {
      setIsSearchOpen(true);
    }
  }, [query, setIsSearchOpen]);

  return (
    <Field className="py-2">
      <InputGroup className="flex items-center gap-2">
        <InputGroupAddon>
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          ref={searchInputRef}
          value={query}
          onChange={(e) => onQueryChange(e.currentTarget.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => setIsSearchOpen(false)}
        />
        {!!query && (
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={() => onQueryChange("")}
            aria-label="Clear"
          >
            <X />
          </InputGroupButton>
        )}
      </InputGroup>
      {!query && (
        <FieldDescription>
          {tipText}
        </FieldDescription>
      )}
    </Field>
  )
}
