import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listSubmissionRows } from "@/lib/submissions/store";
import { isSubmissionExpired } from "@/lib/submissions/expiry";
import { getForm } from "@/lib/forms/registry";
import { isFormActive } from "@/lib/forms/active";
import { GenericSubmissionPdfButton } from "@/components/form-runner/GenericSubmissionPdfButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// PROJ-18: Generische Liste der eigenen Einreichungen (owner-only per RLS).

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

export default async function GenericEinreichungenListePage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = getForm(formId);
  if (!form || !isFormActive(formId)) notFound();
  const basePath = `/antrag/${formId}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?returnTo=${basePath}/eingereicht`);

  const all = await listSubmissionRows(supabase, formId);
  const submissions = all.filter((s) => !isSubmissionExpired(s.submitted_at));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Meine Einreichungen</h1>
          <p className="mt-1 text-sm text-muted-foreground">Eingereichte Anträge werden 30 Tage aufbewahrt.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={basePath}>Neuen Antrag stellen</Link>
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-10">
            <p className="text-sm text-muted-foreground">Sie haben noch keinen Antrag eingereicht.</p>
            <Button asChild>
              <Link href={basePath}>Antrag ausfüllen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li key={s.id}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Referenz {s.reference}</CardTitle>
                  <p className="text-sm text-muted-foreground">Eingereicht am {formatDateTime(s.submitted_at)}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`${basePath}/eingereicht/${s.id}`}>Ansehen</Link>
                  </Button>
                  <GenericSubmissionPdfButton formId={formId} data={s.data} reference={s.reference} size="sm" />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
