import type { Metadata } from "next";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Übersicht" };

export default function DashboardPage() {
  // Hinweis: Routenschutz + Begrüßungsname aus dem Profil werden in /backend
  // ergänzt (Middleware + Server-Client). Hier zunächst die UI-Struktur.
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Willkommen zurück</h1>
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
          <Button disabled>Neuen Antrag starten</Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Verfügbar, sobald das Antragsformular (PROJ-3) gebaut ist.
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
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Noch keine gespeicherten Anträge. Das Speichern von Entwürfen kommt
            mit PROJ-4.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
