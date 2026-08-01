import { Separator } from "@/components/ui/separator";

export function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-10 px-2">
      <header className="space-y-2 mb-4">
        <h3 className="text-base font-semibold text-foreground/90">{title}</h3>
        {desc ? <p className="text-sm text-foreground/70">{desc}</p> : null}
      </header>
      <div className="space-y-4">{children}</div>
      <Separator />
    </section>
  );
}
