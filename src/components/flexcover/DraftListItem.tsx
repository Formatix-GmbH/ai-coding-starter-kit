"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteServerDraft } from "@/lib/drafts/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DraftListItem({
  formId,
  title,
  href,
  updatedAt,
}: {
  formId: string;
  title: string;
  href: string;
  updatedAt: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDiscard() {
    setBusy(true);
    const ok = await deleteServerDraft(formId);
    setBusy(false);
    if (ok) {
      toast.success("Entwurf verworfen.");
      router.refresh();
    } else {
      toast.error("Entwurf konnte nicht gelöscht werden.");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">
          Zuletzt gespeichert:{" "}
          {new Date(updatedAt).toLocaleString("de-DE", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild size="sm">
          <Link href={href}>Weiter bearbeiten</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" disabled={busy}>
              Verwerfen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Entwurf verwerfen?</AlertDialogTitle>
              <AlertDialogDescription>
                Der gespeicherte Entwurf wird gelöscht. Dieser Schritt kann nicht
                rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => void handleDiscard()}>
                Verwerfen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
