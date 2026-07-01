// PROJ-18: Neutrales PDF-Layout für den Muster-Förderantrag.
// Herstellerneutral — Kopf mit gezeichneter „FX"-Marke (keine Bilddatei nötig).
// Font „Arimo" wird umgebungsspezifisch registriert (Browser: src/lib/pdf/client,
// Node: src/lib/pdf/server); dieses Layout nutzt nur die Familie.

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { FormValues } from "@/lib/form-engine/types";
import { getByPath } from "@/lib/form-engine/paths";

const RED = "#d0021b";
const DARK = "#1f2937";
const LINE = "#9aa3ad";

const styles = StyleSheet.create({
  page: { fontFamily: "Arimo", fontSize: 9.5, color: "#111111", paddingTop: 28, paddingBottom: 46 },
  header: { flexDirection: "row", alignItems: "center", marginHorizontal: 40, marginBottom: 14 },
  logoBox: { width: 34, height: 34, backgroundColor: RED, borderRadius: 4, alignItems: "center", justifyContent: "center", marginRight: 10 },
  logoText: { color: "#ffffff", fontFamily: "Arimo", fontWeight: "bold", fontSize: 16 },
  brand: { fontFamily: "Arimo", fontWeight: "bold", fontSize: 13, color: DARK },
  brandSub: { fontSize: 9, color: "#6b7280" },
  headerRule: { marginHorizontal: 40, borderBottomWidth: 2, borderBottomColor: RED, marginBottom: 12 },
  runningBar: { position: "absolute", top: 14, left: 40, right: 40, height: 3, backgroundColor: RED },
  body: { paddingHorizontal: 40 },
  title: { fontSize: 15, fontFamily: "Arimo", fontWeight: "bold", color: DARK, marginBottom: 4 },
  intro: { fontSize: 8.5, color: "#333333", lineHeight: 1.4, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontFamily: "Arimo", fontWeight: "bold", color: DARK, marginTop: 14, marginBottom: 6, paddingBottom: 2, borderBottomWidth: 1, borderBottomColor: DARK },
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 7 },
  label: { width: 200, fontSize: 9, color: "#333333", paddingRight: 8 },
  valueWrap: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: LINE, paddingBottom: 2, minHeight: 13 },
  value: { fontSize: 10 },
  choiceRow: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  choiceLabel: { flex: 1, fontSize: 9, color: "#333333", paddingRight: 8 },
  choiceOpt: { flexDirection: "row", alignItems: "center", marginLeft: 14 },
  radio: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: "#555555", marginRight: 4 },
  radioOn: { backgroundColor: RED, borderColor: RED },
  choiceOptText: { fontSize: 9 },
  group: { borderWidth: 1, borderColor: "#d4d8dd", borderRadius: 2, padding: 8, marginBottom: 8 },
  groupTitle: { fontSize: 9, fontFamily: "Arimo", fontWeight: "bold", color: "#555555", marginBottom: 6 },
  table: { marginBottom: 8 },
  tHead: { flexDirection: "row", backgroundColor: "#f1f2f4", borderWidth: 0.5, borderColor: LINE },
  tHeadCell: { flex: 1, padding: 4, fontSize: 8.5, fontFamily: "Arimo", fontWeight: "bold" },
  tRow: { flexDirection: "row", borderWidth: 0.5, borderTopWidth: 0, borderColor: LINE },
  tCell: { flex: 1, padding: 4, fontSize: 9 },
  footer: { position: "absolute", bottom: 22, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: LINE, paddingTop: 4, fontSize: 7.5, color: "#777777" },
  footerSquare: { width: 7, height: 7, backgroundColor: RED, marginLeft: 6 },
});

type Getter = (path: string) => unknown;

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Ja" : "Nein";
  return String(v);
}
function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        <Text style={styles.value}>{str(value)}</Text>
      </View>
    </View>
  );
}

const JA_NEIN = [
  { value: "Ja", label: "ja" },
  { value: "Nein", label: "nein" },
];

function Choice({ label, value }: { label: string; value: unknown }) {
  const v = str(value).toLowerCase();
  return (
    <View style={styles.choiceRow} wrap={false}>
      <Text style={styles.choiceLabel}>{label}</Text>
      {JA_NEIN.map((o) => (
        <View key={o.value} style={styles.choiceOpt}>
          <View style={[styles.radio, v === o.value.toLowerCase() ? styles.radioOn : {}]} />
          <Text style={styles.choiceOptText}>{o.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function MusterantragDocument({
  values,
  reference,
}: {
  values: FormValues;
  reference?: string;
}) {
  const get: Getter = (path) => getByPath(values, path);
  const has = (path: string) => get(path) !== undefined;
  const partner = (get("vorhaben.partner") as FormValues[] | undefined) ?? [];
  const meilensteine = (get("vorhaben.meilensteine") as FormValues[] | undefined) ?? [];
  const gesamt = (num(get("vorhaben.kosten.personal")) ?? 0) + (num(get("vorhaben.kosten.sachmittel")) ?? 0);
  const mvRows = [
    { key: "personal", label: "Personal" },
    { key: "sachmittel", label: "Sachmittel" },
  ];

  return (
    <Document title="Muster-Förderantrag" author="eforms Portal">
      <Page size="A4" style={styles.page}>
        {/* Laufender roter Balken ab Seite 2 */}
        <View fixed style={styles.runningBar} render={({ pageNumber }) => (pageNumber > 1 ? <View /> : null)} />

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>FX</Text>
          </View>
          <View>
            <Text style={styles.brand}>eforms Portal</Text>
            <Text style={styles.brandSub}>Online-Antragsportal</Text>
          </View>
        </View>
        <View style={styles.headerRule} />

        <View style={styles.body}>
          <Text style={styles.title}>Muster-Förderantrag</Text>
          <Text style={styles.intro}>
            Die nachstehenden Angaben wurden im Online-Antragsportal erfasst.
          </Text>

          <Text style={styles.sectionTitle}>Ansprechpartner</Text>
          <Field label="Anrede" value={get("kontakt.anrede")} />
          <Field label="Akademischer Titel" value={get("kontakt.titel")} />
          <Field label="Vorname" value={get("kontakt.name.vorname")} />
          <Field label="Nachname" value={get("kontakt.name.nachname")} />
          <Field label="E-Mail-Adresse" value={get("kontakt.email")} />
          <Field label="Telefonnummer" value={get("kontakt.telefon")} />
          <Field label="Weitere Anmerkungen" value={get("kontakt.anmerkungen")} />

          <Text style={styles.sectionTitle}>Organisation</Text>
          <Field label="Name der Organisation" value={get("organisation.name")} />
          <Field label="Rechtsform" value={get("organisation.rechtsform")} />
          <Field label="Straße und Hausnummer" value={get("organisation.adresse.strasse")} />
          <Field label="PLZ" value={get("organisation.adresse.plz")} />
          <Field label="Ort" value={get("organisation.adresse.ort")} />
          <Field label="Land" value={get("organisation.land")} />
          <Field label="Website" value={get("organisation.website")} />
          <Field label="Mitarbeitende" value={get("organisation.kennzahlen.mitarbeiter")} />
          <Field label="Gründungsjahr" value={get("organisation.kennzahlen.gruendungsjahr")} />

          <Text style={styles.sectionTitle}>Vorhaben</Text>
          <Field label="Titel des Vorhabens" value={get("vorhaben.titel")} />
          <Field label="Kurzbeschreibung" value={get("vorhaben.beschreibung")} />
          <Field label="Förderbereich" value={get("vorhaben.foerderbereich")} />
          <Field label="Geplanter Beginn" value={get("vorhaben.beginn")} />
          <Field label="Personalkosten" value={get("vorhaben.kosten.personal")} />
          <Field label="Sachmittel" value={get("vorhaben.kosten.sachmittel")} />
          <Field label="Gesamtkosten (berechnet)" value={gesamt ? String(gesamt) : ""} />
          <Field label="Eingesetzte Eigenmittel" value={get("vorhaben.eigenmittel")} />
          <Choice label="Internationale Projektpartner?" value={get("vorhaben.international")} />
          {has("vorhaben.beschreibungInternational") && (
            <Field label="Internationale Zusammenarbeit" value={get("vorhaben.beschreibungInternational")} />
          )}
          {partner.map((p, i) => (
            <View key={i} style={styles.group} wrap={false}>
              <Text style={styles.groupTitle}>Partner {i + 1}</Text>
              <Field label="Name des Partners" value={p?.partnername} />
              <Field label="Land" value={p?.land} />
            </View>
          ))}

          <View style={styles.table} wrap={false}>
            <View style={styles.tHead}>
              <Text style={styles.tHeadCell}>Meilenstein</Text>
              <Text style={styles.tHeadCell}>Termin</Text>
              <Text style={styles.tHeadCell}>Budget</Text>
            </View>
            {meilensteine.length === 0 && (
              <View style={styles.tRow}>
                <Text style={styles.tCell}>—</Text>
                <Text style={styles.tCell}> </Text>
                <Text style={styles.tCell}> </Text>
              </View>
            )}
            {meilensteine.map((m, i) => (
              <View key={i} style={styles.tRow}>
                <Text style={styles.tCell}>{str(m?.bezeichnung)}</Text>
                <Text style={styles.tCell}>{str(m?.termin)}</Text>
                <Text style={styles.tCell}>{str(m?.budget)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.table} wrap={false}>
            <View style={styles.tHead}>
              <Text style={styles.tHeadCell}>Mittelverwendung (EUR)</Text>
              <Text style={styles.tHeadCell}>Jahr 1</Text>
              <Text style={styles.tHeadCell}>Jahr 2</Text>
              <Text style={styles.tHeadCell}>Jahr 3</Text>
            </View>
            {mvRows.map((r) => (
              <View key={r.key} style={styles.tRow}>
                <Text style={styles.tCell}>{r.label}</Text>
                <Text style={styles.tCell}>{str(get(`vorhaben.mittelverwendung.${r.key}.jahr1`))}</Text>
                <Text style={styles.tCell}>{str(get(`vorhaben.mittelverwendung.${r.key}.jahr2`))}</Text>
                <Text style={styles.tCell}>{str(get(`vorhaben.mittelverwendung.${r.key}.jahr3`))}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Erklärung & Abschluss</Text>
          <Field label="Weitere Hinweise" value={get("abschluss.hinweise")} />
          <Field label="Ort" value={get("abschluss.unterschrift.ort")} />
          <Field label="Datum" value={get("abschluss.unterschrift.datum")} />
          <Choice label="Datenschutz zugestimmt" value={get("abschluss.datenschutz") ? "Ja" : "Nein"} />
          <Choice label="Newsletter abonniert" value={get("abschluss.newsletter") ? "Ja" : "Nein"} />
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Muster-Förderantrag · eforms Portal
            {reference ? `   ·   Referenz ${reference}` : ""}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
            <View style={styles.footerSquare} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
