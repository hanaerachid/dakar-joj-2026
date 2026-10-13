import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { cn } from "cn";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { InputGroup, InputGroupButton, InputGroupInput } from "./ui/input-group";

type PhoneInputProps = Omit<
  React.ComponentProps<typeof RPNInput.default>,
  "onChange"
> & {
  onChange?: (value?: RPNInput.Value) => void;
};

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, ...props }, ref) => {
  return (
    <InputGroup>
      <RPNInput.default
        ref={ref}
        defaultCountry="SN"
        className={cn(
          "flex w-full items-center",
          className,
        )}
        countrySelectComponent={CountrySelect}
        inputComponent={PhoneNumberInput}
        onChange={(value) => onChange?.(value || undefined)}
        {...props}
      />
    </InputGroup>
  );
});

PhoneInput.displayName = "PhoneInput";

const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <InputGroupInput
    {...props}
    ref={ref}
    type="tel"
    autoComplete="tel"
    className={cn(
      "flex-1",
      className,
    )}
  />
));

PhoneNumberInput.displayName = "PhoneNumberInput";

type CountryOption = {
  label: string;
  value?: RPNInput.Country;
};

type CountrySelectProps = {
  disabled?: boolean;
  value?: RPNInput.Country;
  onChange: (value?: RPNInput.Country) => void;
  options: CountryOption[];
};

function CountrySelect({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);

  const callingCode = value
    ? RPNInput.getCountryCallingCode(value)
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <InputGroupButton
            type="button"
            variant="ghost"
            disabled={disabled}
            aria-label="Select country calling code"
            className={cn(
              " shrink-0 gap-2",
            )}
          >
            {value && (
              <>
                <Flag country={value} />
                <span className="text-sm">+{callingCode}</span>
              </>
            )}
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </InputGroupButton>
        }
      />

      <PopoverContent
        align="start"
        className="w-xs p-0"
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) => option.value)
                .map((option) => {
                  const country = option.value!;
                  const code =
                    RPNInput.getCountryCallingCode(country);

                  return (
                    <CommandItem
                      key={country}
                      value={`${option.label} ${country} +${code}`}
                      onSelect={() => {
                        onChange(country);
                        setOpen(false);
                      }}
                      className="gap-2"
                    >
                      <Flag country={country} />
                      <span className="flex-1">
                        {option.label}
                      </span>
                      <span className="text-muted-foreground">
                        +{code}
                      </span>
                      <Check
                        className={cn(
                          "size-4",
                          country === value
                            ? "inline-block"
                            : "hidden",
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function Flag({ country }: { country: RPNInput.Country }) {
  const FlagComponent = flags[country];

  return (
    <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-sm">
      {FlagComponent ? (
        <FlagComponent title={country} />
      ) : (
        <span className="text-xs">{country}</span>
      )}
    </span>
  );
}

export { PhoneInput };