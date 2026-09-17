import {
  Controller,
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";

type FileFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  accept?: string;
  multiple?: boolean;
  value?: File | null;
  disabled?: boolean;
};

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: SelectOption[];
};

type TextAreaFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  rows?: number;
};

type TextFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: string;
  suffix?: string;
};

type MultiSelectFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
};

export function SelectField<T extends FieldValues>({
  name,
  label,
  placeholder = "Select an option",
  options,
}: SelectFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={name}
              aria-invalid={!!fieldState.error}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {fieldState.error && (
            <FieldError className="text-sm">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}

export function TextAreaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 4,
}: TextAreaFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            value={field.value ?? ""}
            aria-invalid={!!fieldState.error}
          />

          {fieldState.error && (
            <FieldError className="text-sm">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}

export function TextField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  suffix,
}: TextFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              value={field.value ?? ""}
              aria-invalid={!!fieldState.error}
            />
            <InputGroupAddon align="inline-end" >
              {suffix}
            </InputGroupAddon>
          </InputGroup>

          {fieldState.error && (
            <FieldError className="text-sm">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}

export function MultiSelectField<T extends FieldValues>({
  name,
  label,
  options,
}: MultiSelectFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected: string[] = field.value ?? [];

        return (
          <Field className="sm:col-span-2">
            <FieldLabel>{label}</FieldLabel>

            <div className="flex flex-wrap gap-4">
              {options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...selected, option.value]
                        : selected.filter(
                          (value) => value !== option.value,
                        );

                      field.onChange(next);
                    }}
                  />

                  {option.label}
                </label>
              ))}
            </div>

            {fieldState.error && (
              <FieldError className="text-sm">
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        );
      }}
    />
  );
}

export function FileField<T extends FieldValues>({
  name,
  label,
  accept,
  multiple = false,
}: FileFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          <Input
            id={name}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(event) => {
              const files = event.target.files;

              field.onChange(
                multiple
                  ? Array.from(files ?? [])
                  : files?.[0] ?? null,
              );

              // Allow selecting the same file again.
              event.target.value = "";
            }}
            aria-invalid={!!fieldState.error}
          />

          {!multiple && field.value && (
            <FieldDescription className="text-sm text-muted-foreground">
              {field.value.name}
            </FieldDescription>
          )}

          {fieldState.error && (
            <FieldError className="text-sm">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}