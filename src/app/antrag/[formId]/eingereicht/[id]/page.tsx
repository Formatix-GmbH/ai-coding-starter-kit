import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionRow } from "@/lib/submissions/store";
import { isSubmissionExpired } from "@/lib/submissions/expiry";
import { submissionIdSchema } from "@/lib/validation/submission";
import { getForm } from "@/lib/forms/registry";
import { isFormActive } from "@/lib/forms/active";
import { GenericSubmissionActions } from "@/components/form-runner/GenericSubmissionActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// PROJ-18: Generische Bestätigungsseite einer Einreichung (owner-only per RLS).

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" });
}

export default async function GenericBestaetigungPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string; id: string }>;
  searchParams: Promise<{ mail?: string }>;
}) {
  const { formId, id } = await params;
  const { mail } = await searchParams;
  const form = getForm(formId);
  if (!form || !isFormActive(formId)) notFound();
  const basePath = `/antrag/${formId}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=${basePath}/eingereicht/${id}`);

  const parsedId = submissionIdSchema.safeParse(id);
  const submission = parsedId.success ? await getSubmissionRow(supabase, parsedId.data) : null;

  if (!submission || isSubmissionExpired(submission.submitted_at)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Einreichung nicht gefunden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Diese Einreichung existiert nicht (mehr). Eingereichte Anträge werden nach 30 Tagen automatisch gelöscht.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`${basePath}/eingereicht`}>Meine Einreichungen</Link>
              </Button>
              <Button asChild>
                <Link href={basePath}>Antrag ausfüllen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emailSent = mail !== "failed";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
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
            Bitte bewahren Sie Ihr PDF und die Referenznummer auf. Eine automatische Übermittlung an eine Förderstelle findet nicht statt.
          </p>

          <GenericSubmissionActions
            formId={formId}
            basePath={basePath}
            submissionId={submission.id}
            reference={submission.reference}
            data={submission.data}
            recipientEmail={user.email ?? null}
            emailSent={emailSent}
          />
        </CardContent>
      </Card>
    </div>
  );
}
