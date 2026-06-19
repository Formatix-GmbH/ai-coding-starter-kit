"use client";

import { clearAllLocalDrafts } from "@/lib/drafts/client";
import { Button } from "@/components/ui/button";

/** Abmelde-Button: leert vor dem Abmelden alle lokal gespeicherten Entwürfe
 *  (Datenminimierung auf gemeinsam genutzten Geräten), dann läuft die
 *  Logout-Server-Action des umschließenden <form> regulär weiter. */
export function LogoutButton() {
  return (
    <Button type="submit" variant="outline" onClick={() => clearAllLocalDrafts()}>
      Abmelden
    </Button>
  );
}
