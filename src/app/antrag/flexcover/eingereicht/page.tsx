import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSubmissionRows } from "@/lib/submissions/store";
import { isSubmissionExpired } from "@/lib/submissions/expiry";
import { DownloadSubmissionPdfButton } from "@/components/flexcover/DownloadSubmissionPdfButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// PROJ-6: Schlichte Liste der eigenen Einreichungen (owner-only per RLS),
// neueste zuerst. Einreichen/Auflisten erfordert Anmeldung.

const FORM_ID = "flexcover";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

export default async function EinreichungenListePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?returnTo=/antrag/flexcover/eingereicht");
  }

  const all = await listSubmissionRows(supabase, FORM_ID);
  // Lazy-Guard: abgelaufene (>30 Tage) nicht anzeigen, falls der Job noch nicht lief.
  const submissions = all.filter((s) => !isSubmissionExpired(s.submitted_at));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Meine Einreichungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Eingereichte Anträge werden 30 Tage aufbewahrt.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/antrag/flexcover">Neuen Antrag stellen</Link>
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-10">
            <p className="text-sm text-muted-foreground">
              Sie haben noch keinen Antrag eingereicht.
            </p>
            <Button asChild>
              <Link href="/antrag/flexcover">Antrag ausfüllen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    Referenz {s.reference}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Eingereicht am {formatDateTime(s.submitted_at)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/antrag/flexcover/eingereicht/${s.id}`}>Ansehen</Link>
                  </Button>
                  <DownloadSubmissionPdfButton
                    data={s.data}
                    reference={s.reference}
                    size="sm"
                  />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
