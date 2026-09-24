import { cn } from "cn";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

export function ColorInput({
  value,
  onChange,
  id,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  return (
    <InputGroup className={cn(
      "h-10 w-full",
      "disabled:opacity-60 disabled:cursor-not-allowed",
    )}>
      <InputGroupAddon align="inline-start">
        <div className="flex items-center justify-center size-7 overflow-hidden rounded-full m-1" >
          <input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-7 cursor-pointer scale-150"
            aria-label="Pick color"
            {...props}
          />
        </div>
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputGroup>
  );
}
