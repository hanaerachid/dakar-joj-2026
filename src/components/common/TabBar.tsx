import { cn } from "@/lib/utils";

export function TabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="w-full">
      <div className="inline-flex gap-1 rounded-xl bg-background/5 p-1">
        {tabs.map((t) => {
          const active = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm transition",
                active
                  ? "bg-primary shadow ring-1 ring-border/5"
                  : "text-muted-foreground hover:bg-background/10",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
