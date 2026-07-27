import React, { useState } from "react";
import {
  Lock, Eye, Pencil, FileText, FlaskConical, Building2, Stethoscope,
  HeartPulse, User, X, Clock, Share2, ScrollText, CheckCircle2, XCircle,
  MinusCircle, Landmark, Microscope, ShieldCheck, Activity, ClipboardList,
  Image as ImageIcon, FileSignature, Receipt, CalendarCheck
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design-Token                                                        */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#F4F6F8",
  ink: "#16232E",
  inkSoft: "#4A5A68",
  card: "#FFFFFF",
  line: "#D9E0E6",
  // Deskriptive Metadaten
  desc: "#33566B",
  descLight: "#E9F0F4",
  // Governance-Metadaten
  gov: "#5C3D99",
  govLight: "#F2EDFA",
  govBorder: "#D9CCF1",
  // Rechtsgrundlagen / Flüsse
  consent: "#0B8A78",      // Einwilligung
  contract: "#46637A",     // Behandlungsvertrag
  legal: "#8A94A0",        // gesetzliche Pflicht
  // Zugriffszustände
  write: "#1D7A46",
  writeLight: "#E4F3E9",
  read: "#1E6FA8",
  readLight: "#E6F1F9",
  none: "#9AA4AD",
  revoked: "#B0452F",
  revokedLight: "#F9ECE8",
};

/* ------------------------------------------------------------------ */
/* Rollen                                                              */
/* ------------------------------------------------------------------ */
const ROLES = [
  { id: "patientin", label: "Patientin", icon: User },
  { id: "hausarzt", label: "Hausarzt", icon: Stethoscope },
  { id: "khArzt", label: "Krankenhausarzt", icon: Activity },
  { id: "pflege", label: "Pflege / Reha-Team", icon: HeartPulse },
  { id: "kasse", label: "Krankenkasse", icon: Landmark },
  { id: "forschung", label: "Forschung", icon: Microscope },
];
const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

/* ------------------------------------------------------------------ */
/* Stationen                                                           */
/* ------------------------------------------------------------------ */
const STATIONS = [
  { id: "hausarzt", label: "Hausarztpraxis", sub: "Dr. med. J. Weber, Osnabrück", flex: 1 },
  { id: "kh", label: "Krankenhaus", sub: "St.-Elisabeth-Klinik · Aufnahme, Diagnostik, OP", flex: 2 },
  { id: "reha", label: "Reha-Klinik", sub: "Reha-Zentrum Teutoburger Wald", flex: 1 },
  { id: "nachsorge", label: "Nachsorge", sub: "Hausarztpraxis Dr. Weber", flex: 1 },
];

/* ------------------------------------------------------------------ */
/* Datenobjekte – fiktive Beispielpatientin                            */
/* Fall: Erika Mustermann, Coxarthrose rechts → Hüft-TEP               */
/* ------------------------------------------------------------------ */
const OBJECTS = [
  {
    id: "anamnese", station: "hausarzt", phase: null, icon: ClipboardList,
    desc: {
      titel: "Anamnesebogen", datum: "03.02.2026",
      einrichtung: "Hausarztpraxis Dr. Weber", typ: "Klinische Dokumentation",
      format: "FHIR (Composition) / PDF",
    },
    perm: { read: ["patientin", "hausarzt", "khArzt"], write: ["hausarzt"] },
    gov: {
      zweck: "Medizinische Behandlung (Erstdiagnostik Coxarthrose)",
      grundlage: "Behandlungsvertrag (§ 630a BGB) · Art. 9 Abs. 2 lit. h DSGVO",
      einwilligung: { status: "erteilt", detail: "Weitergabe an St.-Elisabeth-Klinik, erteilt am 05.02.2026" },
      frist: "10 Jahre (§ 630f Abs. 3 BGB)",
      weitergaben: [{ an: "St.-Elisabeth-Klinik", zweck: "Stationäre Weiterbehandlung", basis: "einwilligung" }],
      protokoll: [
        { wann: "03.02.2026 · 10:12", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Erstellt" },
        { wann: "05.02.2026 · 08:41", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Übermittelt (KIS-Export)" },
        { wann: "12.02.2026 · 09:14", wer: "Dr. K. Sommer", rolle: "Krankenhausarzt", aktion: "Gelesen" },
      ],
    },
  },
  {
    id: "ueberweisung", station: "hausarzt", phase: null, icon: FileSignature,
    desc: {
      titel: "Überweisungsschein (Muster 6)", datum: "05.02.2026",
      einrichtung: "Hausarztpraxis Dr. Weber", typ: "Administratives Dokument",
      format: "KVDT / PDF",
    },
    perm: { read: ["patientin", "hausarzt", "khArzt", "kasse"], write: ["hausarzt"] },
    gov: {
      zweck: "Veranlassung stationärer Behandlung; Abrechnung",
      grundlage: "Behandlungsvertrag · § 295 SGB V (Abrechnung)",
      einwilligung: { status: "nicht erforderlich", detail: "Gesetzlich geregelte Übermittlung" },
      frist: "10 Jahre",
      weitergaben: [
        { an: "St.-Elisabeth-Klinik", zweck: "Aufnahme", basis: "vertrag" },
        { an: "AOK Niedersachsen (fiktiv)", zweck: "Abrechnung", basis: "gesetz" },
      ],
      protokoll: [
        { wann: "05.02.2026 · 08:39", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Erstellt" },
        { wann: "06.02.2026 · 11:03", wer: "M. Brand", rolle: "Krankenkasse", aktion: "Gelesen (Kostenzusage)" },
      ],
    },
  },
  {
    id: "aufnahme", station: "kh", phase: "Aufnahme", icon: FileText,
    desc: {
      titel: "Aufnahmebefund", datum: "12.02.2026",
      einrichtung: "St.-Elisabeth-Klinik, Orthopädie", typ: "Klinische Dokumentation",
      format: "FHIR (Encounter/Condition)",
    },
    perm: { read: ["patientin", "khArzt", "pflege", "hausarzt"], write: ["khArzt"] },
    gov: {
      zweck: "Stationäre Behandlung (Hüft-TEP rechts)",
      grundlage: "Behandlungsvertrag · Art. 9 Abs. 2 lit. h DSGVO",
      einwilligung: { status: "nicht erforderlich", detail: "Behandlungskontext" },
      frist: "10 Jahre (§ 630f BGB)",
      weitergaben: [],
      protokoll: [
        { wann: "12.02.2026 · 09:02", wer: "Dr. K. Sommer", rolle: "Krankenhausarzt", aktion: "Erstellt" },
        { wann: "12.02.2026 · 13:45", wer: "S. Nowak", rolle: "Pflege", aktion: "Gelesen" },
      ],
    },
  },
  {
    id: "labor", station: "kh", phase: "Diagnostik", icon: FlaskConical,
    desc: {
      titel: "Laborbefund (präoperativ)", datum: "12.02.2026",
      einrichtung: "Zentrallabor St.-Elisabeth-Klinik", typ: "Laborbefund",
      format: "LDT / FHIR (Observation)",
    },
    perm: { read: ["patientin", "khArzt", "pflege", "forschung"], write: ["khArzt"] },
    gov: {
      zweck: "OP-Vorbereitung · sekundär: medizinische Forschung (pseudonymisiert)",
      grundlage: "Behandlungsvertrag · Forschung: Einwilligung (Broad Consent, Art. 6 Abs. 1 lit. a DSGVO)",
      einwilligung: { status: "erteilt", detail: "Broad Consent Forschung, erteilt am 12.02.2026" },
      frist: "10 Jahre · Forschungskopie: 30 Jahre pseudonymisiert",
      weitergaben: [{ an: "Uniklinik-Forschungsverbund (pseudonymisiert)", zweck: "Endoprothetik-Register-Studie", basis: "einwilligung" }],
      protokoll: [
        { wann: "12.02.2026 · 11:20", wer: "Labor-System", rolle: "System", aktion: "Erstellt" },
        { wann: "13.02.2026 · 07:58", wer: "Dr. K. Sommer", rolle: "Krankenhausarzt", aktion: "Gelesen" },
        { wann: "01.03.2026 · 02:00", wer: "Forschungs-ETL", rolle: "Forschung", aktion: "Pseudonymisierter Export" },
      ],
    },
  },
  {
    id: "roentgen", station: "kh", phase: "Diagnostik", icon: ImageIcon,
    desc: {
      titel: "Röntgen Becken / Hüfte rechts", datum: "13.02.2026",
      einrichtung: "Radiologie St.-Elisabeth-Klinik", typ: "Bilddaten",
      format: "DICOM",
    },
    perm: { read: ["patientin", "khArzt", "hausarzt"], write: ["khArzt"] },
    gov: {
      zweck: "OP-Planung Hüft-TEP",
      grundlage: "Behandlungsvertrag · Forschung: Einwilligung (widerrufen)",
      einwilligung: { status: "widerrufen", detail: "Einwilligung zur Forschungsnutzung widerrufen am 01.03.2026 – Forschungszugriff gesperrt" },
      frist: "10 Jahre (§ 630f BGB), Bilddaten ggf. 30 Jahre (RöV a. F.)",
      weitergaben: [{ an: "Hausarztpraxis Dr. Weber", zweck: "Weiterbehandlung", basis: "einwilligung" }],
      protokoll: [
        { wann: "13.02.2026 · 10:15", wer: "R. Diallo", rolle: "MTR (Radiologie)", aktion: "Erstellt" },
        { wann: "28.02.2026 · 14:22", wer: "Forschungs-ETL", rolle: "Forschung", aktion: "Zugriff verweigert (Widerruf)" },
      ],
    },
  },
  {
    id: "op", station: "kh", phase: "OP", icon: Activity,
    desc: {
      titel: "OP-Bericht Hüft-TEP rechts", datum: "14.02.2026",
      einrichtung: "St.-Elisabeth-Klinik, OP-Abteilung", typ: "Klinische Dokumentation",
      format: "FHIR (Procedure) / PDF",
    },
    perm: { read: ["patientin", "khArzt", "pflege", "hausarzt"], write: ["khArzt"] },
    gov: {
      zweck: "Dokumentation des Eingriffs · Weiterbehandlung",
      grundlage: "Behandlungsvertrag (§ 630f BGB)",
      einwilligung: { status: "nicht erforderlich", detail: "Dokumentationspflicht" },
      frist: "10 Jahre; empfohlen 30 Jahre (Implantat)",
      weitergaben: [{ an: "Reha-Zentrum Teutoburger Wald", zweck: "Anschlussheilbehandlung", basis: "vertrag" }],
      protokoll: [
        { wann: "14.02.2026 · 12:40", wer: "Dr. K. Sommer", rolle: "Krankenhausarzt", aktion: "Erstellt" },
        { wann: "24.02.2026 · 09:05", wer: "Dr. L. Hoff", rolle: "Reha-Ärztin", aktion: "Gelesen" },
      ],
    },
  },
  {
    id: "entlass", station: "kh", phase: "Entlassung", icon: FileText,
    desc: {
      titel: "Entlassbrief", datum: "20.02.2026",
      einrichtung: "St.-Elisabeth-Klinik, Orthopädie", typ: "Arztbrief",
      format: "CDA / eArztbrief",
    },
    perm: { read: ["patientin", "hausarzt", "khArzt", "pflege"], write: ["khArzt"] },
    gov: {
      zweck: "Entlassmanagement · Sicherstellung der Anschlussversorgung",
      grundlage: "§ 39 Abs. 1a SGB V (Entlassmanagement) · Behandlungsvertrag",
      einwilligung: { status: "erteilt", detail: "Einwilligung Entlassmanagement, erteilt am 12.02.2026" },
      frist: "10 Jahre",
      weitergaben: [
        { an: "Hausarztpraxis Dr. Weber", zweck: "Weiterbehandlung", basis: "einwilligung" },
        { an: "Reha-Zentrum Teutoburger Wald", zweck: "Anschlussheilbehandlung", basis: "vertrag" },
      ],
      protokoll: [
        { wann: "20.02.2026 · 10:30", wer: "Dr. K. Sommer", rolle: "Krankenhausarzt", aktion: "Erstellt & signiert" },
        { wann: "21.02.2026 · 08:12", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Gelesen" },
        { wann: "24.02.2026 · 08:47", wer: "S. Yildiz", rolle: "Reha-Team", aktion: "Gelesen" },
      ],
    },
  },
  {
    id: "abrechnung", station: "kh", phase: "Entlassung", icon: Receipt,
    desc: {
      titel: "Abrechnungsdatensatz (DRG)", datum: "21.02.2026",
      einrichtung: "St.-Elisabeth-Klinik, Verwaltung", typ: "Abrechnungsdaten",
      format: "§ 301-Datensatz (EDIFACT)",
    },
    perm: { read: ["patientin", "khArzt", "kasse"], write: ["khArzt"] },
    gov: {
      zweck: "Abrechnung der stationären Leistungen",
      grundlage: "Gesetzliche Verpflichtung (§ 301 SGB V, Art. 6 Abs. 1 lit. c DSGVO)",
      einwilligung: { status: "nicht erforderlich", detail: "Gesetzliche Übermittlungspflicht" },
      frist: "10 Jahre (steuer-/sozialrechtlich)",
      weitergaben: [{ an: "AOK Niedersachsen (fiktiv)", zweck: "Vergütung", basis: "gesetz" }],
      protokoll: [
        { wann: "21.02.2026 · 06:00", wer: "KIS-Abrechnung", rolle: "System", aktion: "Erstellt & übermittelt" },
        { wann: "23.02.2026 · 09:31", wer: "M. Brand", rolle: "Krankenkasse", aktion: "Gelesen (Prüfung)" },
      ],
    },
  },
  {
    id: "rehaplan", station: "reha", phase: null, icon: CalendarCheck,
    desc: {
      titel: "Reha-Therapieplan", datum: "24.02.2026",
      einrichtung: "Reha-Zentrum Teutoburger Wald", typ: "Therapieplanung",
      format: "FHIR (CarePlan)",
    },
    perm: { read: ["patientin", "pflege", "hausarzt"], write: ["pflege"] },
    gov: {
      zweck: "Anschlussheilbehandlung nach Hüft-TEP",
      grundlage: "Behandlungsvertrag · § 40 SGB V",
      einwilligung: { status: "nicht erforderlich", detail: "Behandlungskontext" },
      frist: "10 Jahre",
      weitergaben: [],
      protokoll: [
        { wann: "24.02.2026 · 10:00", wer: "S. Yildiz", rolle: "Reha-Team", aktion: "Erstellt" },
        { wann: "10.03.2026 · 15:20", wer: "S. Yildiz", rolle: "Reha-Team", aktion: "Aktualisiert (Belastungsaufbau)" },
      ],
    },
  },
  {
    id: "rehabericht", station: "reha", phase: null, icon: FileText,
    desc: {
      titel: "Reha-Abschlussbericht", datum: "24.03.2026",
      einrichtung: "Reha-Zentrum Teutoburger Wald", typ: "Arztbrief",
      format: "PDF / eArztbrief",
    },
    perm: { read: ["patientin", "hausarzt", "pflege"], write: ["pflege"] },
    gov: {
      zweck: "Ergebnisdokumentation · Übergabe an Nachsorge",
      grundlage: "Behandlungsvertrag · Übermittlung an Hausarzt: Einwilligung",
      einwilligung: { status: "erteilt", detail: "Übermittlung an Hausarzt, erteilt am 24.02.2026" },
      frist: "10 Jahre",
      weitergaben: [{ an: "Hausarztpraxis Dr. Weber", zweck: "Nachsorge", basis: "einwilligung" }],
      protokoll: [
        { wann: "24.03.2026 · 11:45", wer: "Dr. L. Hoff", rolle: "Reha-Ärztin", aktion: "Erstellt & signiert" },
        { wann: "25.03.2026 · 08:05", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Gelesen" },
      ],
    },
  },
  {
    id: "nachsorge", station: "nachsorge", phase: null, icon: ClipboardList,
    desc: {
      titel: "Nachsorgeprotokoll", datum: "07.04.2026",
      einrichtung: "Hausarztpraxis Dr. Weber", typ: "Klinische Dokumentation",
      format: "FHIR (Composition)",
    },
    perm: { read: ["patientin", "hausarzt"], write: ["hausarzt"] },
    gov: {
      zweck: "Verlaufskontrolle nach Hüft-TEP und Reha",
      grundlage: "Behandlungsvertrag (§ 630a BGB)",
      einwilligung: { status: "nicht erforderlich", detail: "Behandlungskontext" },
      frist: "10 Jahre (§ 630f BGB)",
      weitergaben: [],
      protokoll: [
        { wann: "07.04.2026 · 09:30", wer: "Dr. J. Weber", rolle: "Hausarzt", aktion: "Erstellt" },
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/* Datenflüsse zwischen Stationen / externen Akteuren                  */
/* ------------------------------------------------------------------ */
const FLOWS = [
  { id: "f1", label: "Überweisung · Anamnese", basis: "einwilligung", path: "M 158 196 C 260 120, 370 120, 458 190", lx: 300, ly: 118 },
  { id: "f2", label: "Entlassbrief · OP-Bericht", basis: "vertrag", path: "M 548 190 C 650 118, 760 118, 828 190", lx: 690, ly: 116 },
  { id: "f3", label: "Reha-Abschlussbericht", basis: "einwilligung", path: "M 896 196 C 960 146, 1030 146, 1082 192", lx: 990, ly: 142 },
  { id: "f4", label: "Abrechnungsdaten (§ 301 SGB V)", basis: "gesetz", path: "M 462 188 C 400 130, 340 105, 296 78", lx: 330, ly: 172 },
  { id: "f5", label: "Pseudonymisierte Labordaten", basis: "einwilligung", path: "M 542 188 C 600 140, 660 110, 706 80", lx: 680, ly: 168 },
];
const BASIS = {
  einwilligung: { label: "Einwilligung", color: C.consent, dash: "7 5" },
  vertrag: { label: "Behandlungsvertrag", color: C.contract, dash: "" },
  gesetz: { label: "Gesetzliche Pflicht", color: C.legal, dash: "2 4" },
};

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */
function accessFor(obj, role) {
  if (!role) return "neutral";
  if (obj.perm.write.includes(role)) return "write";
  if (obj.perm.read.includes(role)) return "read";
  return "none";
}

const CONSENT_META = {
  erteilt: { icon: CheckCircle2, color: C.consent, label: "Einwilligung erteilt" },
  widerrufen: { icon: XCircle, color: C.revoked, label: "Einwilligung widerrufen" },
  "nicht erforderlich": { icon: MinusCircle, color: C.none, label: "Keine Einwilligung erforderlich" },
};

/* ------------------------------------------------------------------ */
/* UI-Bausteine                                                        */
/* ------------------------------------------------------------------ */
function AccessBadge({ state }) {
  if (state === "neutral") return null;
  const cfg = {
    write: { bg: C.writeLight, fg: C.write, Icon: Pencil, txt: "Lesen & Schreiben" },
    read: { bg: C.readLight, fg: C.read, Icon: Eye, txt: "Nur Lesen" },
    none: { bg: "#EEF1F3", fg: C.none, Icon: Lock, txt: "Kein Zugriff" },
  }[state];
  const Icon = cfg.Icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.fg }}>
      <Icon size={12} /> {cfg.txt}
    </span>
  );
}

function ObjectCard({ obj, role, selected, onClick }) {
  const state = accessFor(obj, role);
  const consent = CONSENT_META[obj.gov.einwilligung.status];
  const ConsentIcon = consent.icon;
  const Icon = obj.icon;
  const locked = state === "none";
  const ring =
    state === "write" ? C.write : state === "read" ? C.read :
    selected ? C.gov : "transparent";
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg transition-all focus:outline-none focus-visible:ring-2"
      style={{
        background: C.card,
        border: `1px solid ${selected ? C.gov : C.line}`,
        boxShadow: selected
          ? `0 0 0 2px ${C.gov}, 0 6px 16px rgba(22,35,46,0.10)`
          : state === "write" || state === "read"
          ? `0 0 0 2px ${ring}, 0 2px 6px rgba(22,35,46,0.06)`
          : "0 1px 3px rgba(22,35,46,0.06)",
        opacity: locked ? 0.45 : 1,
        filter: locked ? "grayscale(0.9)" : "none",
      }}
      aria-label={`Datenobjekt ${obj.desc.titel} öffnen`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 rounded-md p-1.5" style={{ background: C.descLight, color: C.desc }}>
              {locked ? <Lock size={15} /> : <Icon size={15} />}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate" style={{ color: C.ink }}>
                {obj.desc.titel}
              </div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{obj.desc.datum}</div>
            </div>
          </div>
        </div>
        {state !== "neutral" && (
          <div className="mt-2"><AccessBadge state={state} /></div>
        )}
      </div>
      {/* Governance-Streifen */}
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-b-lg text-xs"
        style={{ background: C.govLight, borderTop: `1px solid ${C.govBorder}`, color: C.gov }}>
        <span className="inline-flex items-center gap-1" title={consent.label}>
          <ConsentIcon size={13} style={{ color: consent.color }} />
        </span>
        <span className="inline-flex items-center gap-1" title={`Speicherfrist: ${obj.gov.frist}`}>
          <Clock size={12} /> {obj.gov.frist.split("(")[0].trim().split(";")[0].split("·")[0]}
        </span>
        <span className="inline-flex items-center gap-1 ml-auto" title="Weitergaben an Dritte">
          <Share2 size={12} /> {obj.gov.weitergaben.length}
        </span>
      </div>
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-2.5">
      <div className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: C.inkSoft }}>{label}</div>
      <div className="text-sm" style={{ color: C.ink }}>{children}</div>
    </div>
  );
}

function DetailPanel({ obj, role, onClose }) {
  const consent = CONSENT_META[obj.gov.einwilligung.status];
  const ConsentIcon = consent.icon;
  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[440px] overflow-y-auto shadow-2xl"
      style={{ background: C.card, borderLeft: `1px solid ${C.line}` }}
      aria-label="Metadaten-Detailansicht"
    >
      <div className="sticky top-0 flex items-start justify-between gap-3 px-5 py-4"
        style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
        <div>
          <div className="text-xs uppercase tracking-wide" style={{ color: C.inkSoft }}>Datenobjekt</div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: C.ink, fontFamily: "'IBM Plex Serif', serif" }}>
            {obj.desc.titel}
          </h2>
        </div>
        <button onClick={onClose} aria-label="Schließen"
          className="rounded-md p-1.5 hover:bg-slate-100" style={{ color: C.inkSoft }}>
          <X size={18} />
        </button>
      </div>

      {/* A) Deskriptive Metadaten */}
      <section className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-1 rounded" style={{ background: C.desc }} />
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.desc }}>
            Deskriptive Metadaten
          </h3>
        </div>
        <div className="rounded-lg p-4" style={{ background: C.descLight }}>
          <Field label="Titel">{obj.desc.titel}</Field>
          <Field label="Erstellungsdatum">{obj.desc.datum}</Field>
          <Field label="Erzeugende Einrichtung">{obj.desc.einrichtung}</Field>
          <Field label="Datentyp">{obj.desc.typ}</Field>
          <Field label="Format">{obj.desc.format}</Field>
        </div>
      </section>

      {/* B) Governance-Metadaten */}
      <section className="px-5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-1 rounded" style={{ background: C.gov }} />
          <h3 className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: C.gov }}>
            <ShieldCheck size={15} /> Governance-Metadaten
          </h3>
        </div>
        <div className="rounded-lg p-4" style={{ background: C.govLight, border: `1px solid ${C.govBorder}` }}>

          <div className="text-xs uppercase tracking-wide font-medium mb-1.5" style={{ color: C.gov }}>
            Zugriffsberechtigte Rollen
          </div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-xs" style={{ color: C.inkSoft }}>
                <th className="text-left font-medium pb-1">Rolle</th>
                <th className="text-center font-medium pb-1 w-16">Lesen</th>
                <th className="text-center font-medium pb-1 w-20">Schreiben</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => {
                const canR = obj.perm.read.includes(r.id) || obj.perm.write.includes(r.id);
                const canW = obj.perm.write.includes(r.id);
                const active = role === r.id;
                return (
                  <tr key={r.id} style={{
                    background: active ? "#FFFFFF" : "transparent",
                    outline: active ? `1.5px solid ${C.gov}` : "none",
                  }}>
                    <td className="py-1 pl-1 rounded-l" style={{ color: C.ink, fontWeight: active ? 600 : 400 }}>
                      {r.label}{active ? " ◂" : ""}
                    </td>
                    <td className="text-center py-1">
                      {canR ? <Eye size={14} className="inline" style={{ color: C.read }} />
                        : <Lock size={13} className="inline" style={{ color: C.none }} />}
                    </td>
                    <td className="text-center py-1 pr-1 rounded-r">
                      {canW ? <Pencil size={14} className="inline" style={{ color: C.write }} />
                        : <span style={{ color: C.none }}>–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Field label="Verarbeitungszweck">{obj.gov.zweck}</Field>
          <Field label="Rechtsgrundlage">{obj.gov.grundlage}</Field>

          <Field label="Einwilligungsstatus">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                background: obj.gov.einwilligung.status === "widerrufen" ? C.revokedLight : "#FFFFFF",
                color: consent.color, border: `1px solid ${consent.color}`,
              }}>
              <ConsentIcon size={14} /> {consent.label}
            </span>
            <div className="text-xs mt-1" style={{ color: C.inkSoft }}>{obj.gov.einwilligung.detail}</div>
          </Field>

          <Field label="Speicherfrist">
            <span className="inline-flex items-center gap-1"><Clock size={14} style={{ color: C.gov }} /> {obj.gov.frist}</span>
          </Field>

          <Field label="Weitergaben an Dritte">
            {obj.gov.weitergaben.length === 0 ? (
              <span style={{ color: C.inkSoft }}>Keine Weitergaben registriert.</span>
            ) : (
              <ul className="space-y-1.5">
                {obj.gov.weitergaben.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Share2 size={14} className="mt-0.5 shrink-0" style={{ color: BASIS[w.basis].color }} />
                    <span>
                      <span className="font-medium">{w.an}</span> · {w.zweck}{" "}
                      <span className="text-xs rounded-full px-1.5 py-0.5"
                        style={{ background: "#FFFFFF", color: BASIS[w.basis].color, border: `1px solid ${BASIS[w.basis].color}` }}>
                        {BASIS[w.basis].label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <div className="text-xs uppercase tracking-wide font-medium mb-1.5 mt-3 inline-flex items-center gap-1.5" style={{ color: C.gov }}>
            <ScrollText size={13} /> Zugriffsprotokoll
          </div>
          <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${C.govBorder}` }}>
            {obj.gov.protokoll.map((p, i) => (
              <div key={i} className="px-2.5 py-1.5 text-xs flex flex-wrap gap-x-2"
                style={{
                  background: i % 2 ? "#FBF9FE" : "#FFFFFF",
                  fontFamily: "'IBM Plex Mono', monospace", color: C.ink,
                }}>
                <span style={{ color: C.inkSoft }}>{p.wann}</span>
                <span className="font-medium">{p.wer}</span>
                <span style={{ color: C.gov }}>[{p.rolle}]</span>
                <span className="ml-auto">{p.aktion}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Flussdiagramm (SVG)                                                 */
/* ------------------------------------------------------------------ */
function FlowDiagram() {
  const nodes = [
    { id: "hausarzt", x: 60, y: 176, w: 190, label: "Hausarztpraxis", Icon: Stethoscope, external: false },
    { id: "kh", x: 400, y: 176, w: 210, label: "Krankenhaus", Icon: Building2, external: false },
    { id: "reha", x: 770, y: 176, w: 180, label: "Reha-Klinik", Icon: HeartPulse, external: false },
    { id: "nachsorge", x: 1020, y: 176, w: 170, label: "Nachsorge", Icon: Stethoscope, external: false },
    { id: "kasse", x: 190, y: 28, w: 200, label: "Krankenkasse", Icon: Landmark, external: true },
    { id: "forschung", x: 640, y: 28, w: 190, label: "Forschung", Icon: Microscope, external: true },
  ];
  return (
    <div className="rounded-xl p-3 sm:p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1 px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.ink }}>
          Datenflüsse entlang der Journey
        </h2>
        <span className="text-xs" style={{ color: C.inkSoft }}>
          Gestrichelt-grüne Flüsse basieren auf einer Einwilligung der Patientin
        </span>
      </div>
      <svg viewBox="0 0 1200 240" className="w-full" role="img"
        aria-label="Diagramm der Datenflüsse zwischen den Stationen">
        <defs>
          {Object.entries(BASIS).map(([k, b]) => (
            <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={b.color} />
            </marker>
          ))}
        </defs>

        {FLOWS.map((f) => {
          const b = BASIS[f.basis];
          return (
            <g key={f.id}>
              <path d={f.path} fill="none" stroke={b.color} strokeWidth="2.5"
                strokeDasharray={b.dash} markerEnd={`url(#arrow-${f.basis})`} />
              <text x={f.lx} y={f.ly} textAnchor="middle" fontSize="13" fontWeight="600"
                fill={b.color} stroke="#FFFFFF" strokeWidth="4" paintOrder="stroke"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {f.label}
              </text>
              {f.basis === "einwilligung" && (
                <text x={f.lx} y={f.ly + 15} textAnchor="middle" fontSize="11" fontStyle="italic"
                  fill={C.consent} stroke="#FFFFFF" strokeWidth="4" paintOrder="stroke"
                  style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  ✓ Einwilligung
                </text>
              )}
            </g>
          );
        })}

        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={n.w} height={44} rx={10}
              fill={n.external ? "#FFFFFF" : C.descLight}
              stroke={n.external ? C.gov : C.desc}
              strokeWidth={1.5} strokeDasharray={n.external ? "5 4" : ""} />
            <text x={n.x + n.w / 2} y={n.y + 27} textAnchor="middle" fontSize="16" fontWeight="600"
              fill={n.external ? C.gov : C.desc}
              style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {n.label}
            </text>
            {n.external && (
              <text x={n.x + n.w / 2} y={n.y - 8} textAnchor="middle" fontSize="11"
                fill={C.inkSoft} style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                externer Empfänger
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Legende                                                             */
/* ------------------------------------------------------------------ */
function Legend() {
  const Item = ({ children }) => (
    <div className="flex items-center gap-2 text-xs" style={{ color: C.ink }}>{children}</div>
  );
  const Line = ({ color, dash }) => (
    <svg width="34" height="8"><line x1="0" y1="4" x2="34" y2="4" stroke={color} strokeWidth="2.5" strokeDasharray={dash} /></svg>
  );
  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: C.ink }}>Legende</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2.5">
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Metadaten-Ebenen</div>
          <Item><span className="h-3 w-3 rounded-sm" style={{ background: C.descLight, border: `1.5px solid ${C.desc}` }} /> Deskriptive Metadaten</Item>
          <Item><span className="h-3 w-3 rounded-sm" style={{ background: C.govLight, border: `1.5px solid ${C.gov}` }} /> Governance-Metadaten</Item>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Zugriff (gewählte Rolle)</div>
          <Item><AccessBadge state="write" /></Item>
          <Item><AccessBadge state="read" /></Item>
          <Item><AccessBadge state="none" /></Item>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Einwilligungsstatus</div>
          <Item><CheckCircle2 size={14} style={{ color: C.consent }} /> erteilt</Item>
          <Item><XCircle size={14} style={{ color: C.revoked }} /> widerrufen</Item>
          <Item><MinusCircle size={14} style={{ color: C.none }} /> nicht erforderlich</Item>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Datenflüsse (Rechtsgrundlage)</div>
          <Item><Line color={C.consent} dash="7 5" /> Einwilligung</Item>
          <Item><Line color={C.contract} dash="" /> Behandlungsvertrag</Item>
          <Item><Line color={C.legal} dash="2 4" /> Gesetzliche Pflicht</Item>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Haupt-App                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [role, setRole] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const selected = OBJECTS.find((o) => o.id === selectedId) || null;

  const kkPhases = ["Aufnahme", "Diagnostik", "OP", "Entlassung"];

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      {/* Kopfbereich */}
      <header className="px-4 sm:px-8 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: C.gov }}>
                Design-Science-Research-Prototyp · Demonstrator
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: C.ink, fontFamily: "'IBM Plex Serif', serif" }}>
                Governance-erweiterte Metadaten in der Patient Data Journey
              </h1>
              <p className="text-sm mt-1 max-w-2xl" style={{ color: C.inkSoft }}>
                Jedes Datenobjekt trägt neben deskriptiven Metadaten eine{" "}
                <span className="font-semibold" style={{ color: C.gov }}>Governance-Schicht</span>:
                Zugriffsrechte, Zweck, Rechtsgrundlage, Einwilligung, Speicherfrist, Weitergaben und Zugriffsprotokoll.
              </p>
            </div>
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: C.descLight, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-medium" style={{ color: C.inkSoft }}>Beispielpatientin (fiktiv)</div>
              <div className="font-semibold" style={{ color: C.ink }}>Erika Mustermann, *12.08.1964</div>
              <div style={{ color: C.inkSoft }}>Coxarthrose rechts · Hüft-TEP · Vers.-Nr. K123456789</div>
            </div>
          </div>

          {/* Rollen-Umschalter */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide mr-1" style={{ color: C.inkSoft }}>
              Perspektive:
            </span>
            <button
              onClick={() => setRole(null)}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                background: role === null ? C.ink : "#FFFFFF",
                color: role === null ? "#FFFFFF" : C.ink,
                border: `1px solid ${role === null ? C.ink : C.line}`,
              }}>
              Übersicht (neutral)
            </button>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(active ? null : r.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    background: active ? C.gov : "#FFFFFF",
                    color: active ? "#FFFFFF" : C.ink,
                    border: `1px solid ${active ? C.gov : C.line}`,
                  }}>
                  <Icon size={14} /> {r.label}
                </button>
              );
            })}
            {role && (
              <span className="text-xs ml-1" style={{ color: C.inkSoft }}>
                Hervorgehoben: Zugriffsrechte der Rolle <b>{roleLabel(role)}</b>
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6"
        style={{ paddingRight: selected ? undefined : undefined }}>

        {/* Flussdiagramm */}
        <FlowDiagram />

        {/* Journey mit Datenobjekten */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3 px-1" style={{ color: C.ink }}>
            Stationen &amp; Datenobjekte
            <span className="font-normal normal-case ml-2 text-xs" style={{ color: C.inkSoft }}>
              (Datenobjekt anklicken, um beide Metadaten-Ebenen zu öffnen)
            </span>
          </h2>
          <div className="flex flex-col lg:flex-row gap-4">
            {STATIONS.map((st, si) => {
              const objs = OBJECTS.filter((o) => o.station === st.id);
              return (
                <div key={st.id} className="rounded-xl p-3"
                  style={{ flex: st.flex, background: C.card, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: C.desc, color: "#FFFFFF" }}>{si + 1}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: C.ink }}>{st.label}</div>
                      <div className="text-xs" style={{ color: C.inkSoft }}>{st.sub}</div>
                    </div>
                  </div>
                  {st.id === "kh" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {kkPhases.map((ph) => (
                        <div key={ph}>
                          <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.desc }}>
                            {ph}
                          </div>
                          <div className="space-y-2.5">
                            {objs.filter((o) => o.phase === ph).map((o) => (
                              <ObjectCard key={o.id} obj={o} role={role}
                                selected={selectedId === o.id}
                                onClick={() => setSelectedId(o.id)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 mt-3">
                      {objs.map((o) => (
                        <ObjectCard key={o.id} obj={o} role={role}
                          selected={selectedId === o.id}
                          onClick={() => setSelectedId(o.id)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Legende */}
        <Legend />

        <footer className="text-xs pb-6 px-1" style={{ color: C.inkSoft }}>
          Alle Personen-, Einrichtungs- und Falldaten sind fiktiv und dienen ausschließlich der Demonstration
          des Metadaten-Governance-Konzepts. Prototyp ohne Backend; Zustand nur im Speicher.
        </footer>
      </main>

      {selected && (
        <>
          <div className="fixed inset-0 z-30 bg-black/20 sm:bg-transparent" onClick={() => setSelectedId(null)} />
          <DetailPanel obj={selected} role={role} onClose={() => setSelectedId(null)} />
        </>
      )}
    </div>
  );
}
