import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getDraftRow } from "@/lib/drafts/store";
import { isDraftExpired } from "@/lib/drafts/expiry";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
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

  // Laufenden Entwurf laden (nicht abgelaufen).
  const draftRow = await getDraftRow(supabase, flexcoverDefinition.id);
  const activeDraft = draftRow && !isDraftExpired(draftRow.updated_at) ? draftRow : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{greeting}</h1>
          <p className="text-sm text-muted-foreground">Deine Anträge im Überblick</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Abmelden
          </Button>
        </form>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Neuen Antrag starten</CardTitle>
          <CardDescription>
            Beginne einen neuen FlexCover-Förderantrag.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/antrag/flexcover">Neuen Antrag starten</Link>
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Das Speichern von Entwürfen folgt mit PROJ-4.
          </p>
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
              formId={flexcoverDefinition.id}
              title={flexcoverDefinition.title}
              href="/antrag/flexcover"
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
    </main>
  );
}
