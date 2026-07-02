import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDraftRow } from "@/lib/drafts/store";
import { isDraftExpired } from "@/lib/drafts/expiry";
import { branding } from "@/lib/branding";
import { DraftListItem } from "@/components/flexcover/DraftListItem";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Übersicht" };

export default async function DashboardPage() {
  // Routenschutz erfolgt in der Middleware (proxy.ts); hier den Namen laden.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let fullName: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    fullName = profile?.full_name ?? null;
  }
  const greeting = fullName ? `Willkommen zurück, ${fullName}` : "Willkommen zurück";

  // Laufenden Entwurf des primären Formulars laden (nicht abgelaufen).
  // Welches Formular das ist, bestimmt das Branding-Profil (PROJ-18).
  const draftRow = await getDraftRow(supabase, branding.form.id);
  const activeDraft = draftRow && !isDraftExpired(draftRow.updated_at) ? draftRow : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">{greeting}</h1>
        <p className="text-sm text-muted-foreground">Deine Anträge im Überblick</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Neuen Antrag starten</CardTitle>
          <CardDescription>{branding.form.startDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={branding.form.href}>Neuen Antrag starten</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Anträge</CardTitle>
          <CardDescription>
            Gespeicherte Entwürfe und eingereichte Anträge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDraft ? (
            <DraftListItem
              formId={branding.form.id}
              title={branding.form.title}
              href={branding.form.href}
              updatedAt={activeDraft.updated_at}
            />
          ) : (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Noch keine gespeicherten Entwürfe. Sobald Sie einen Antrag beginnen,
              erscheint er hier.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
