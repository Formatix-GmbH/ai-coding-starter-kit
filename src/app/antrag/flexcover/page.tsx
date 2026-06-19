import { createClient } from "@/lib/supabase/server";
import { getDraftRow } from "@/lib/drafts/store";
import { isDraftExpired } from "@/lib/drafts/expiry";
import { flexcoverDefinition } from "@/lib/forms/flexcover/definition";
import { FlexCoverAntrag } from "@/components/flexcover/FlexCoverAntrag";
import type { DraftRow } from "@/lib/drafts/types";

// Anonym zugänglich. Für eingeloggte Nutzer wird ein vorhandener (nicht
// abgelaufener) Server-Entwurf serverseitig vorgeladen; anonyme Entwürfe liest
// die Client-Komponente aus dem localStorage.
export default async function FlexCoverAntragPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let serverDraft: DraftRow | null = null;
  if (user) {
    const draft = await getDraftRow(supabase, flexcoverDefinition.id);
    serverDraft = draft && !isDraftExpired(draft.updated_at) ? draft : null;
  }

  return <FlexCoverAntrag isAuthenticated={Boolean(user)} serverDraft={serverDraft} />;
}
