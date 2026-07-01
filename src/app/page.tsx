import Link from "next/link";
import { Button } from "@/components/ui/button";
import { branding } from "@/lib/branding";

export default function Home() {
  const { home } = branding;
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold sm:text-4xl">{home.title}</h1>
      <p className="text-muted-foreground">{home.subtitle}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={home.primaryHref}>{home.primaryLabel}</Link>
        </Button>
        {home.secondaryHref && home.secondaryLabel && (
          <Button asChild size="lg" variant="outline">
            <Link href={home.secondaryHref}>{home.secondaryLabel}</Link>
          </Button>
        )}
      </div>
      {home.note && <p className="text-xs text-muted-foreground">{home.note}</p>}
    </div>
  );
}
