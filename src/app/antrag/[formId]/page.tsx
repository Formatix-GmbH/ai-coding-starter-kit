import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDraftRow } from "@/lib/drafts/store";
import { isDraftExpired } from "@/lib/drafts/expiry";
import { getForm } from "@/lib/forms/registry";
import { isFormActive } from "@/lib/forms/active";
import { FormRunner } from "@/components/form-runner/FormRunner";
import type { DraftRow } from "@/lib/drafts/types";

// PROJ-18: Generische Antragsseite für registrierte, im Deployment aktive
// Formulare. FlexCover wird hier NICHT bedient (eigene statische Route).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ formId: string }>;
}): Promise<Metadata> {
  const { formId } = await params;
  const form = getForm(formId);
  return { title: form?.title ?? "Antrag" };
}

export default async function GenericAntragPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = getForm(formId);
  if (!form || !isFormActive(formId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let serverDraft: DraftRow | null = null;
  if (user) {
    const draft = await getDraftRow(supabase, formId);
    serverDraft = draft && !isDraftExpired(draft.updated_at) ? draft : null;
  }

  return (
    <FormRunner
      formId={formId}
      definition={form.definition}
      basePath={`/antrag/${formId}`}
      intro={form.intro}
      isAuthenticated={Boolean(user)}
      userId={user?.id ?? null}
      serverDraft={serverDraft}
    />
  );
}
