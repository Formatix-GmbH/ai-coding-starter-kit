import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionRow } from "@/lib/submissions/store";
import { isSubmissionExpired } from "@/lib/submissions/expiry";
import { submissionIdSchema } from "@/lib/validation/submission";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
import { SubmissionConfirmationActions } from "@/components/flexcover/SubmissionConfirmationActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// PROJ-6: Bestätigungsseite einer Einreichung. Server-Component, liest owner-only
// per RLS. Einreichen erfordert Anmeldung → nicht angemeldet wird zum Login geleitet.

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" });
}

export default async function EinreichungBestaetigungPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mail?: string }>;
}) {
  const { id } = await params;
  const { mail } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?returnTo=/antrag/flexcover/eingereicht/${id}`);
  }

  const parsedId = submissionIdSchema.safeParse(id);
  const submission = parsedId.success ? await getSubmissionRow(supabase, parsedId.data) : null;

  // Nicht gefunden / abgelaufen → freundlicher Hinweis statt Fehlerseite.
  if (!submission || isSubmissionExpired(submission.submitted_at)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Einreichung nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Diese Einreichung existiert nicht (mehr). Eingereichte Anträge werden
              nach 30 Tagen automatisch gelöscht.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/antrag/flexcover/eingereicht">Meine Einreichungen</Link>
              </Button>
              <Button asChild>
                <Link href="/antrag/flexcover">Antrag ausfüllen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // E-Mail-Status: aus der Query beim Einreichen (mail=failed → nicht zugestellt).
  // Beim späteren Aufruf ohne Query gehen wir von erfolgter Zustellung aus.
  const emailSent = mail !== "failed";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Ihr Antrag wurde eingereicht</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Referenznummer</dt>
            <dd className="font-medium">{submission.reference}</dd>
            <dt className="text-muted-foreground">Eingereicht am</dt>
            <dd>{formatDateTime(submission.submitted_at)}</dd>
          </dl>

          <p className="text-sm text-muted-foreground">
            Bitte bewahren Sie Ihr PDF und die Referenznummer auf. Eine automatische
            Übermittlung an eine Förderstelle findet nicht statt.
          </p>

          <SubmissionConfirmationActions
            formId={flexcoverDefinition.id}
            submissionId={submission.id}
            reference={submission.reference}
            data={submission.data}
            recipientEmail={user.email ?? null}
            emailSent={emailSent}
          />
        </CardContent>
      </Card>
    </main>
  );
}
