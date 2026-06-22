// Markiert den Build-Ordner `.next` als von Dropbox ignoriert (Windows-ADS
// `com.dropbox.ignored`). Verhindert, dass Dropbox die häufig wechselnden
// Next-Build-Dateien synchronisiert (Ursache von EPERM/„device busy"-Fehlern).
// Läuft als pre-dev/pre-build-Hook; no-op außerhalb von Windows.

import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

if (process.platform !== "win32") process.exit(0);

const dir = resolve(process.cwd(), ".next");
try {
  mkdirSync(dir, { recursive: true });
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Set-Content -Path "${dir}" -Stream com.dropbox.ignored -Value 1`,
    ],
    { stdio: "ignore" },
  );
} catch {
  // Best effort: niemals den dev-/build-Lauf blockieren.
}
