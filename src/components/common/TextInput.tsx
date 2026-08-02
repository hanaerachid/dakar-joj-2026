import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-10 w-full rounded-2xl border border-border bg-input px-3 text-sm shadow-sm outline-none transition",
        "focus:border-blue-300 focus:ring-4 focus:ring-blue-100",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        props.className || "",
      )}
    />
  );
}
