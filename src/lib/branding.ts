// PROJ-18: Konfigurierbares Branding pro Deployment.
//
// Eine Codebasis, mehrere Erscheinungsbilder. Das aktive Profil wird über die
// (Build-)Env `NEXT_PUBLIC_BRAND` gewählt. **Default = "flexcover"** → das
// bestehende FlexCover-Deployment bleibt optisch unverändert (Status quo).
//
// Dies ist Kern-/Konfigurations-Code: er kennt Formulare NICHT über die Registry,
// sondern trägt nur anzeige­relevante Werte je Profil (keine Import-Kopplung zur
// Portal-/Formular-Schicht → Zwei-Wege-Trennbarkeit bleibt gewahrt).

export interface BrandHome {
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  note?: string;
}

export interface BrandProfile {
  /** Angezeigter Portal-Name (Kopfzeile, Titel, Metadaten). */
  appName: string;
  /** Kurzbeschreibung für Metadaten. */
  description: string;
  /** Optionales Logo (Pfad unter /public). Ohne → nur Textmarke. */
  logoSrc?: string;
  home: BrandHome;
}

const flexcover: BrandProfile = {
  appName: "FlexCover Antragsportal",
  description:
    "Förderanträge online ausfüllen, speichern und als PDF erhalten",
  home: {
    title: "FlexCover-Förderantrag — online ausfüllen",
    subtitle:
      "Fülle den Antrag bequem im Browser aus und lade dein PDF herunter — ganz ohne Anmeldung. Ein Konto brauchst du nur, wenn du zwischenspeichern oder dir das PDF per E-Mail schicken lassen möchtest.",
    primaryHref: "/antrag/flexcover",
    primaryLabel: "Antrag starten",
    secondaryHref: "/registrieren",
    secondaryLabel: "Konto erstellen",
    note: "Kostenlos und ohne Anmeldung — Ihre Eingaben bleiben im Browser.",
  },
};

const eforms: BrandProfile = {
  appName: "eforms Portal",
  description:
    "Formulare online ausfüllen, speichern und als PDF erhalten — auf jedem Gerät, barrierefrei.",
  logoSrc: "/portal/Fav_FTX.png",
  home: {
    title: "Formulare online ausfüllen — auf jedem Gerät",
    subtitle:
      "Füllen Sie das Formular bequem im Browser aus und laden Sie Ihr PDF herunter — ganz ohne Anmeldung. Ein Konto brauchen Sie nur, wenn Sie eine verbindliche Einreichung mit Eingangsbestätigung und PDF-Zusendung per E-Mail benötigen. Außerdem können Sie mit einem Konto den Antrag zwischenspeichern und zu einem späteren Zeitpunkt fortsetzen.",
    primaryHref: "/antrag/musterantrag",
    primaryLabel: "Musterantrag starten",
    secondaryHref: "/registrieren",
    secondaryLabel: "Konto erstellen",
    note: "Kostenlos und ohne Anmeldung — Ihre Eingaben bleiben im Browser.",
  },
};

const PROFILES: Record<string, BrandProfile> = { flexcover, eforms };

/** Aktives Marken-Profil (Default „flexcover", damit Prod unverändert bleibt).
 *  `||` statt `??`: Docker-Build-Args liefern bei „nicht gesetzt" einen Leerstring. */
export const branding: BrandProfile =
  PROFILES[process.env.NEXT_PUBLIC_BRAND || "flexcover"] ?? flexcover;
