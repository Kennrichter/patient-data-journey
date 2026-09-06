import React, { useState } from "react";
import {
  Lock, Eye, Pencil, FileText, FlaskConical, Stethoscope, HeartPulse, User, X,
  Clock, Share2, ScrollText, CheckCircle2, XCircle, MinusCircle, Landmark,
  Microscope, ShieldCheck, Activity, ClipboardList, Image as ImageIcon,
  FileSignature, Receipt, CalendarCheck, Building2, ArrowRight, Layers,
  GitBranch, Sparkles, Ban, AlertTriangle, CornerDownRight, Gauge, FileStack,
} from "lucide-react";

/* ================================================================== */
/* Design tokens                                                       */
/* ================================================================== */
const C = {
  bg: "#F4F6F8",
  ink: "#16232E",
  inkSoft: "#4A5A68",
  card: "#FFFFFF",
  line: "#D9E0E6",
  desc: "#33566B",
  descLight: "#E9F0F4",
  gov: "#5C3D99",
  govLight: "#F2EDFA",
  govBorder: "#D9CCF1",
  consent: "#0B8A78",
  contract: "#46637A",
  legal: "#8A94A0",
  write: "#1D7A46",
  writeLight: "#E4F3E9",
  read: "#1E6FA8",
  readLight: "#E6F1F9",
  none: "#9AA4AD",
  revoked: "#B0452F",
  revokedLight: "#F9ECE8",
};

/* Contract levels — colours follow Figure 1 of the paper
   (journey = green, data = red, derived-data = blue)                  */
const LEVELS = {
  journey: { label: "Journey-level contract", short: "Journey level", color: "#2E7D5B", light: "#E7F3EC", border: "#BFE0CD" },
  data: { label: "Data-level contract", short: "Data level", color: "#A6392F", light: "#FAECE9", border: "#EFC9C2" },
  derived: { label: "Derived-data-level contract", short: "Derived-data level", color: "#2B5F9E", light: "#E8F0F9", border: "#C4D8EE" },
};

/* Checkpoint outcomes — the wrapper informs, it does not enforce      */
const OUTCOMES = {
  permitted: { label: "Permitted", icon: CheckCircle2, color: "#1D7A46", light: "#E4F3E9" },
  clarification: { label: "Clarification required", icon: AlertTriangle, color: "#9A6B0E", light: "#FBF1DC" },
  blocked: { label: "Blocked", icon: Ban, color: "#A6392F", light: "#FAECE9" },
};

/* ================================================================== */
/* Roles (perspectives) and actors (contracting parties)               */
/* ================================================================== */
const ROLES = [
  { id: "patient", label: "Patient", icon: User },
  { id: "gp", label: "General practitioner", icon: Stethoscope },
  { id: "hospital", label: "Hospital physician", icon: Activity },
  { id: "care", label: "Nursing / rehab team", icon: HeartPulse },
  { id: "insurer", label: "Health insurer", icon: Landmark },
  { id: "research", label: "Research", icon: Microscope },
];
const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id;

const ACTORS = {
  gpPractice: { label: "GP practice Dr. Weber", icon: Stethoscope, roles: ["gp"] },
  hospital: { label: "St. Elisabeth Clinic", icon: Building2, roles: ["hospital"] },
  rehab: { label: "Teutoburg Rehab Centre", icon: HeartPulse, roles: ["care"] },
  insurer: { label: "AOK Lower Saxony", icon: Landmark, roles: ["insurer"] },
  research: { label: "Arthroplasty registry consortium", icon: Microscope, roles: ["research"] },
};

/* ================================================================== */
/* Journey-level contract (default conditions for the episode of care) */
/* ================================================================== */
const JOURNEY_CONTRACT = {
  id: "JC-2026-014",
  scope: "Episode of care: right hip osteoarthritis → total hip arthroplasty → rehabilitation → follow-up",
  subject: "Erika Mustermann (data subject), b. 12 Aug 1964",
  purposes: [
    "Medical treatment and continuity of care across participating providers",
    "Reimbursement of services rendered within the episode",
    "Secondary research use, only where separately consented",
  ],
  actorCategories: "Treating physicians, nursing and rehabilitation staff, statutory health insurer (billing data only), research partners (pseudonymised data only)",
  validity: "5 Feb 2026 – 31 Dec 2026, extendable for implant-related follow-up",
  consentRefs: "Treatment consent (5 Feb 2026) · Discharge management consent (12 Feb 2026) · Broad research consent (12 Feb 2026, partially withdrawn 1 Mar 2026)",
  accountability: "Data protection officer, St. Elisabeth Clinic — dpo@st-elisabeth.example",
  escalation: "Unresolved purpose conflicts are escalated to the treating physician and the DPO before data are released.",
  inheritanceRule:
    "Lower levels inherit these defaults and may narrow them. They cannot widen what they inherit. Derived-data-level contracts inherit from the object they were generated from, not from the journey level directly.",
};

/* ================================================================== */
/* Data objects — fictitious example patient                           */
/* ================================================================== */
const OBJECTS = [
  {
    id: "history", station: "gp", phase: null, icon: ClipboardList, level: "data",
    desc: { title: "Patient history form", date: "3 Feb 2026", institution: "GP practice Dr. Weber", type: "Clinical documentation", format: "FHIR (Composition) / PDF" },
    perm: { read: ["patient", "gp", "hospital"], write: ["gp"] },
    gov: {
      purpose: "Medical treatment (initial diagnosis of hip osteoarthritis)",
      basis: "Treatment contract (§ 630a German Civil Code) · Art. 9(2)(h) GDPR",
      consent: { status: "granted", detail: "Disclosure to St. Elisabeth Clinic, granted 5 Feb 2026" },
      retention: "10 years (§ 630f(3) German Civil Code)",
      disclosures: [{ to: "St. Elisabeth Clinic", purpose: "Inpatient treatment", basis: "consent" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Purpose narrowed to orthopaedic care; research use not covered at this level.",
      rd: { status: "not requested", scope: "No secondary-use request recorded for this object.", derivation: "Derivation into research data would require a separate derived-data-level contract.", restrictions: "—" },
      accountability: { contact: "Dr. J. Weber, GP practice", escalation: "Questions on scope of use are referred to the practice before disclosure." },
      log: [
        { when: "3 Feb 2026 · 10:12", who: "Dr. J. Weber", role: "GP", action: "Created" },
        { when: "5 Feb 2026 · 08:41", who: "Dr. J. Weber", role: "GP", action: "Transmitted (HIS export)" },
        { when: "12 Feb 2026 · 09:14", who: "Dr. K. Sommer", role: "Hospital physician", action: "Viewed" },
      ],
    },
  },
  {
    id: "referral", station: "gp", phase: null, icon: FileSignature, level: "data",
    desc: { title: "Referral note", date: "5 Feb 2026", institution: "GP practice Dr. Weber", type: "Administrative document", format: "KVDT / PDF" },
    perm: { read: ["patient", "gp", "hospital", "insurer"], write: ["gp"] },
    gov: {
      purpose: "Initiation of inpatient treatment; reimbursement",
      basis: "Treatment contract · § 295 Social Code Book V (billing)",
      consent: { status: "not required", detail: "Transmission mandated by statute" },
      retention: "10 years",
      disclosures: [
        { to: "St. Elisabeth Clinic", purpose: "Admission", basis: "contract" },
        { to: "AOK Lower Saxony", purpose: "Reimbursement", basis: "statute" },
      ],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Insurer access narrowed to administrative and billing fields; clinical narrative excluded.",
      rd: { status: "excluded", scope: "Secondary research use excluded at this level.", derivation: "No derived objects may be generated from this object for research purposes.", restrictions: "Exclusion cannot be widened by a lower-level contract." },
      accountability: { contact: "Dr. J. Weber, GP practice", escalation: "Billing disputes are escalated to the practice administration." },
      log: [
        { when: "5 Feb 2026 · 08:39", who: "Dr. J. Weber", role: "GP", action: "Created" },
        { when: "6 Feb 2026 · 11:03", who: "M. Brand", role: "Health insurer", action: "Viewed (cost approval)" },
      ],
    },
  },
  {
    id: "admission", station: "hospital", phase: "Admission", icon: FileText, level: "data",
    desc: { title: "Admission findings", date: "12 Feb 2026", institution: "St. Elisabeth Clinic, Orthopaedics", type: "Clinical documentation", format: "FHIR (Encounter/Condition)" },
    perm: { read: ["patient", "hospital", "care", "gp"], write: ["hospital"] },
    gov: {
      purpose: "Inpatient treatment (right total hip arthroplasty)",
      basis: "Treatment contract · Art. 9(2)(h) GDPR",
      consent: { status: "not required", detail: "Treatment context" },
      retention: "10 years (§ 630f German Civil Code)",
      disclosures: [],
      inherits: "Journey contract JC-2026-014",
      narrowing: null,
      rd: { status: "restricted", scope: "Included in the registry study only as a derived, pseudonymised variable set.", derivation: "Direct disclosure of the source record for research is not permitted.", restrictions: "Non-commercial research only; no re-identification; no onward transfer by the recipient." },
      accountability: { contact: "Dr. K. Sommer, Orthopaedics", escalation: "DPO of St. Elisabeth Clinic" },
      log: [
        { when: "12 Feb 2026 · 09:02", who: "Dr. K. Sommer", role: "Hospital physician", action: "Created" },
        { when: "12 Feb 2026 · 13:45", who: "S. Nowak", role: "Nursing", action: "Viewed" },
      ],
    },
  },
  {
    id: "lab", station: "hospital", phase: "Diagnostics", icon: FlaskConical, level: "data",
    desc: { title: "Laboratory report (pre-operative)", date: "12 Feb 2026", institution: "Central Laboratory, St. Elisabeth Clinic", type: "Laboratory findings", format: "LDT / FHIR (Observation)" },
    perm: { read: ["patient", "hospital", "care", "research"], write: ["hospital"] },
    gov: {
      purpose: "Surgical preparation · secondary: medical research (pseudonymised)",
      basis: "Treatment contract · Research: consent (broad consent, Art. 6(1)(a) GDPR)",
      consent: { status: "granted", detail: "Broad consent for research, granted 12 Feb 2026" },
      retention: "10 years · research copy: 30 years, pseudonymised",
      disclosures: [{ to: "Arthroplasty registry consortium (pseudonymised)", purpose: "Registry study", basis: "consent" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Research use limited to the arthroplasty registry study; no other studies without renewed consent.",
      rd: { status: "granted", scope: "Broad consent for research and development, granted 12 Feb 2026, covering pseudonymised derivation for registry research.", derivation: "Derived objects inherit the purpose limitation and the retention period of the research copy.", restrictions: "Non-commercial research only; no re-identification; no transfer outside the consortium; derived objects may not be used for commercial product development." },
      accountability: { contact: "Head of Central Laboratory", escalation: "DPO of St. Elisabeth Clinic · research ethics board of the consortium" },
      log: [
        { when: "12 Feb 2026 · 11:20", who: "Laboratory system", role: "System", action: "Created" },
        { when: "13 Feb 2026 · 07:58", who: "Dr. K. Sommer", role: "Hospital physician", action: "Viewed" },
        { when: "1 Mar 2026 · 02:00", who: "Research ETL", role: "Research", action: "Pseudonymised derivation" },
      ],
    },
  },
  {
    id: "xray", station: "hospital", phase: "Diagnostics", icon: ImageIcon, level: "data",
    desc: { title: "X-ray, pelvis / right hip", date: "13 Feb 2026", institution: "Radiology, St. Elisabeth Clinic", type: "Imaging data", format: "DICOM" },
    perm: { read: ["patient", "hospital", "gp"], write: ["hospital"] },
    gov: {
      purpose: "Surgical planning for total hip arthroplasty",
      basis: "Treatment contract · Research: consent (withdrawn)",
      consent: { status: "withdrawn", detail: "Consent for research use withdrawn on 1 Mar 2026 — research access blocked" },
      retention: "10 years (§ 630f German Civil Code); imaging data up to 30 years",
      disclosures: [{ to: "GP practice Dr. Weber", purpose: "Continued treatment", basis: "consent" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Research purposes removed from the inherited defaults following withdrawal.",
      rd: { status: "withdrawn", scope: "Research and development consent withdrawn on 1 Mar 2026.", derivation: "No new derived objects may be generated for research; a derived object cannot inherit a permission the source object no longer carries.", restrictions: "Existing derived objects must be flagged for review by the consortium and excluded from further analyses." },
      accountability: { contact: "Radiology, St. Elisabeth Clinic", escalation: "DPO of St. Elisabeth Clinic — withdrawal is propagated to all downstream recipients." },
      log: [
        { when: "13 Feb 2026 · 10:15", who: "R. Diallo", role: "Radiographer", action: "Created" },
        { when: "28 Feb 2026 · 14:22", who: "Research ETL", role: "Research", action: "Access denied (withdrawal)" },
      ],
    },
  },
  {
    id: "researchset", station: "hospital", phase: "Diagnostics", icon: FileStack, level: "derived",
    desc: { title: "Pseudonymised registry dataset", date: "1 Mar 2026", institution: "St. Elisabeth Clinic, research data pipeline", type: "Derived research data", format: "OMOP CDM extract" },
    perm: { read: ["patient", "research"], write: [] },
    gov: {
      purpose: "Arthroplasty registry study (non-commercial outcome research)",
      basis: "Broad research consent (Art. 6(1)(a), Art. 9(2)(j) GDPR), inherited from the source object",
      consent: { status: "granted", detail: "Derived under the broad research consent of 12 Feb 2026" },
      retention: "30 years, pseudonymised (inherited from the research copy of the source object)",
      disclosures: [{ to: "Arthroplasty registry consortium", purpose: "Registry study", basis: "consent" }],
      derivedFrom: ["lab", "admission"],
      derivationNote:
        "Generated by pseudonymised extraction from the laboratory report and selected admission variables. Imaging data were excluded because research consent for the X-ray was withdrawn on 1 Mar 2026.",
      inherits: "Laboratory report (data-level contract) — not the journey level directly",
      narrowing: "Purpose narrowed from 'medical research' to the named registry study; no commercial reuse.",
      rd: { status: "granted", scope: "Covered by the broad research and development consent of the source object.", derivation: "Further derivation (e.g. model training) requires a new derived-data-level contract referencing this object.", restrictions: "Non-commercial only · no re-identification · no onward transfer outside the consortium · withdrawal on any source object triggers review of this dataset." },
      accountability: { contact: "Research data steward, St. Elisabeth Clinic", escalation: "Consortium ethics board; withdrawal notices are processed within 30 days." },
      log: [
        { when: "1 Mar 2026 · 02:00", who: "Research ETL", role: "System", action: "Derived from laboratory report and admission findings" },
        { when: "1 Mar 2026 · 02:00", who: "Research ETL", role: "System", action: "Imaging variables excluded (source consent withdrawn)" },
        { when: "4 Mar 2026 · 10:07", who: "Dr. A. Petrov", role: "Research", action: "Viewed" },
      ],
    },
  },
  {
    id: "surgery", station: "hospital", phase: "Surgery", icon: Activity, level: "data",
    desc: { title: "Surgical report, right total hip arthroplasty", date: "14 Feb 2026", institution: "St. Elisabeth Clinic, Surgical Unit", type: "Clinical documentation", format: "FHIR (Procedure) / PDF" },
    perm: { read: ["patient", "hospital", "care", "gp"], write: ["hospital"] },
    gov: {
      purpose: "Documentation of the procedure · continued treatment",
      basis: "Treatment contract (§ 630f German Civil Code)",
      consent: { status: "not required", detail: "Statutory documentation duty" },
      retention: "10 years; 30 years recommended (implant)",
      disclosures: [{ to: "Teutoburg Rehab Centre", purpose: "Post-acute rehabilitation", basis: "contract" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: null,
      rd: { status: "restricted", scope: "Implant and procedure variables may enter the registry study in derived form only.", derivation: "Free-text operative narrative may not be derived or transferred.", restrictions: "Non-commercial research only; structured variables only." },
      accountability: { contact: "Dr. K. Sommer, Orthopaedics", escalation: "DPO of St. Elisabeth Clinic" },
      log: [
        { when: "14 Feb 2026 · 12:40", who: "Dr. K. Sommer", role: "Hospital physician", action: "Created" },
        { when: "24 Feb 2026 · 09:05", who: "Dr. L. Hoff", role: "Rehab physician", action: "Viewed" },
      ],
    },
  },
  {
    id: "discharge", station: "hospital", phase: "Discharge", icon: FileText, level: "data",
    desc: { title: "Discharge letter", date: "20 Feb 2026", institution: "St. Elisabeth Clinic, Orthopaedics", type: "Physician's letter", format: "CDA / electronic discharge letter" },
    perm: { read: ["patient", "gp", "hospital", "care"], write: ["hospital"] },
    gov: {
      purpose: "Discharge management · continuity of care",
      basis: "§ 39(1a) Social Code Book V (discharge management) · treatment contract",
      consent: { status: "granted", detail: "Consent to discharge management, granted 12 Feb 2026" },
      retention: "10 years",
      disclosures: [
        { to: "GP practice Dr. Weber", purpose: "Continued treatment", basis: "consent" },
        { to: "Teutoburg Rehab Centre", purpose: "Post-acute rehabilitation", basis: "contract" },
      ],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Recipients limited to the providers named in the discharge management consent.",
      rd: { status: "not requested", scope: "No secondary-use request recorded for this object.", derivation: "Summarisation for research would create a derived object requiring its own contract.", restrictions: "—" },
      accountability: { contact: "Dr. K. Sommer, Orthopaedics", escalation: "DPO of St. Elisabeth Clinic" },
      log: [
        { when: "20 Feb 2026 · 10:30", who: "Dr. K. Sommer", role: "Hospital physician", action: "Created and signed" },
        { when: "21 Feb 2026 · 08:12", who: "Dr. J. Weber", role: "GP", action: "Viewed" },
        { when: "24 Feb 2026 · 08:47", who: "S. Yildiz", role: "Rehab team", action: "Viewed" },
      ],
    },
  },
  {
    id: "riskscore", station: "hospital", phase: "Discharge", icon: Gauge, level: "derived",
    desc: { title: "Post-operative complication risk score", date: "20 Feb 2026", institution: "St. Elisabeth Clinic, clinical decision support", type: "Derived data (AI-generated)", format: "FHIR (RiskAssessment)" },
    perm: { read: ["patient", "hospital", "care", "gp"], write: [] },
    gov: {
      purpose: "Support of discharge planning and rehabilitation intensity",
      basis: "Treatment contract, inherited from the source objects · Art. 9(2)(h) GDPR",
      consent: { status: "not required", detail: "Generated within the treatment context; no research use" },
      retention: "10 years, tied to the retention of the source objects",
      disclosures: [{ to: "Teutoburg Rehab Centre", purpose: "Therapy planning", basis: "contract" }],
      derivedFrom: ["admission", "lab", "surgery"],
      derivationNote:
        "Generated by a clinical decision support model from admission findings, pre-operative laboratory values and the surgical report. The score is advisory and does not replace clinical judgement.",
      inherits: "Admission findings, laboratory report and surgical report (data-level contracts)",
      narrowing: "Purpose narrowed to treatment planning; the score inherits the most restrictive condition among its source objects.",
      rd: { status: "excluded", scope: "Research and development use excluded — model outputs may not be fed back into training data under the current consent.", derivation: "Use for model retraining or validation requires a new consent and a separate derived-data-level contract.", restrictions: "No transfer to the model vendor; no use for commercial product development; no derivation of further scores outside the treatment context." },
      accountability: { contact: "Clinical decision support governance board, St. Elisabeth Clinic", escalation: "Requests outside the treatment purpose are escalated to the treating physician and the DPO before release." },
      log: [
        { when: "20 Feb 2026 · 09:55", who: "CDS model v2.3", role: "System", action: "Derived from three source objects" },
        { when: "20 Feb 2026 · 11:10", who: "Dr. K. Sommer", role: "Hospital physician", action: "Reviewed and released" },
        { when: "24 Feb 2026 · 09:20", who: "Dr. L. Hoff", role: "Rehab physician", action: "Access request — purpose clarification" },
        { when: "24 Feb 2026 · 14:05", who: "DPO", role: "Governance", action: "Released for therapy planning" },
      ],
    },
  },
  {
    id: "billing", station: "hospital", phase: "Discharge", icon: Receipt, level: "data",
    desc: { title: "Billing record (DRG)", date: "21 Feb 2026", institution: "St. Elisabeth Clinic, Administration", type: "Billing data", format: "§ 301 dataset (EDIFACT)" },
    perm: { read: ["patient", "hospital", "insurer"], write: ["hospital"] },
    gov: {
      purpose: "Reimbursement of inpatient services",
      basis: "Legal obligation (§ 301 Social Code Book V, Art. 6(1)(c) GDPR)",
      consent: { status: "not required", detail: "Statutory transmission duty" },
      retention: "10 years (tax and social security law)",
      disclosures: [{ to: "AOK Lower Saxony", purpose: "Payment", basis: "statute" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Insurer may process for reimbursement and audit only; no risk profiling.",
      rd: { status: "excluded", scope: "Research and development use excluded.", derivation: "Derivation for analytics by the insurer is not covered by the inherited conditions.", restrictions: "Exclusion cannot be widened by the recipient." },
      accountability: { contact: "Billing department, St. Elisabeth Clinic", escalation: "DPO of St. Elisabeth Clinic" },
      log: [
        { when: "21 Feb 2026 · 06:00", who: "HIS billing module", role: "System", action: "Created and transmitted" },
        { when: "23 Feb 2026 · 09:31", who: "M. Brand", role: "Health insurer", action: "Viewed (audit)" },
      ],
    },
  },
  {
    id: "careplan", station: "rehab", phase: null, icon: CalendarCheck, level: "data",
    desc: { title: "Rehabilitation therapy plan", date: "24 Feb 2026", institution: "Teutoburg Rehab Centre", type: "Care planning", format: "FHIR (CarePlan)" },
    perm: { read: ["patient", "care", "gp"], write: ["care"] },
    gov: {
      purpose: "Post-acute rehabilitation after hip arthroplasty",
      basis: "Treatment contract · § 40 Social Code Book V",
      consent: { status: "not required", detail: "Treatment context" },
      retention: "10 years",
      disclosures: [],
      inherits: "Journey contract JC-2026-014",
      narrowing: null,
      rd: { status: "not requested", scope: "No secondary-use request recorded for this object.", derivation: "Outcome variables could be derived for research only under a new consent.", restrictions: "—" },
      accountability: { contact: "Dr. L. Hoff, Teutoburg Rehab Centre", escalation: "DPO of the rehabilitation centre" },
      log: [
        { when: "24 Feb 2026 · 10:00", who: "S. Yildiz", role: "Rehab team", action: "Created" },
        { when: "10 Mar 2026 · 15:20", who: "S. Yildiz", role: "Rehab team", action: "Updated (weight-bearing progression)" },
      ],
    },
  },
  {
    id: "rehabreport", station: "rehab", phase: null, icon: FileText, level: "data",
    desc: { title: "Rehabilitation discharge report", date: "24 Mar 2026", institution: "Teutoburg Rehab Centre", type: "Physician's letter", format: "PDF / electronic letter" },
    perm: { read: ["patient", "gp", "care"], write: ["care"] },
    gov: {
      purpose: "Outcome documentation · handover to follow-up care",
      basis: "Treatment contract · transmission to GP: consent",
      consent: { status: "granted", detail: "Transmission to GP, granted 24 Feb 2026" },
      retention: "10 years",
      disclosures: [{ to: "GP practice Dr. Weber", purpose: "Follow-up care", basis: "consent" }],
      inherits: "Journey contract JC-2026-014",
      narrowing: "Recipient limited to the GP practice named in the consent.",
      rd: { status: "restricted", scope: "Functional outcome variables may enter the registry study in derived form.", derivation: "Free-text assessment may not be derived or transferred.", restrictions: "Non-commercial research only; structured outcome variables only." },
      accountability: { contact: "Dr. L. Hoff, Teutoburg Rehab Centre", escalation: "DPO of the rehabilitation centre" },
      log: [
        { when: "24 Mar 2026 · 11:45", who: "Dr. L. Hoff", role: "Rehab physician", action: "Created and signed" },
        { when: "25 Mar 2026 · 08:05", who: "Dr. J. Weber", role: "GP", action: "Viewed" },
      ],
    },
  },
  {
    id: "followup", station: "followup", phase: null, icon: ClipboardList, level: "data",
    desc: { title: "Follow-up consultation record", date: "7 Apr 2026", institution: "GP practice Dr. Weber", type: "Clinical documentation", format: "FHIR (Composition)" },
    perm: { read: ["patient", "gp"], write: ["gp"] },
    gov: {
      purpose: "Monitoring of recovery after arthroplasty and rehabilitation",
      basis: "Treatment contract (§ 630a German Civil Code)",
      consent: { status: "not required", detail: "Treatment context" },
      retention: "10 years (§ 630f German Civil Code)",
      disclosures: [],
      inherits: "Journey contract JC-2026-014",
      narrowing: null,
      rd: { status: "not requested", scope: "No secondary-use request recorded for this object.", derivation: "—", restrictions: "—" },
      accountability: { contact: "Dr. J. Weber, GP practice", escalation: "Practice data protection contact" },
      log: [{ when: "7 Apr 2026 · 09:30", who: "Dr. J. Weber", role: "GP", action: "Created" }],
    },
  },
];

const objById = (id) => OBJECTS.find((o) => o.id === id);

/* ================================================================== */
/* Checkpoints — data contract relationships between actors            */
/* ================================================================== */
const CHECKPOINTS = [
  {
    id: "cp1", from: "gpPractice", to: "hospital", objects: ["history", "referral"],
    level: "data", outcome: "permitted",
    condition: "Transfer for inpatient treatment under the consent of 5 Feb 2026. Journey-level defaults are inherited and narrowed to orthopaedic care.",
  },
  {
    id: "cp2", from: "gpPractice", to: "insurer", objects: ["referral"],
    level: "data", outcome: "permitted",
    condition: "Statutory transmission under § 295 Social Code Book V. Recipient conditions narrowed to billing fields; the clinical narrative is withheld.",
  },
  {
    id: "cp3", from: "hospital", to: "research", objects: ["xray"],
    level: "derived", outcome: "blocked",
    condition: "Derivation for the registry study refused on 28 Feb 2026: research consent for the imaging object was withdrawn. A derived object cannot inherit a permission its source no longer carries.",
  },
  {
    id: "cp4", from: "hospital", to: "research", objects: ["researchset"],
    level: "derived", outcome: "permitted",
    condition: "Pseudonymised dataset derived from the laboratory report and admission variables under broad consent. Imaging variables excluded; purpose narrowed to the named registry study.",
  },
  {
    id: "cp5", from: "hospital", to: "rehab", objects: ["discharge", "surgery"],
    level: "data", outcome: "permitted",
    condition: "Handover for post-acute rehabilitation. Recipients limited to the providers named in the discharge management consent of 12 Feb 2026.",
  },
  {
    id: "cp6", from: "hospital", to: "rehab", objects: ["riskscore"],
    level: "derived", outcome: "clarification",
    condition: "Access to the AI-generated score requested for therapy planning. The purpose was not covered by the derivation context; released on 24 Feb 2026 after escalation to the treating physician and the DPO.",
  },
  {
    id: "cp7", from: "hospital", to: "insurer", objects: ["billing"],
    level: "data", outcome: "permitted",
    condition: "Statutory transmission under § 301 Social Code Book V. Processing narrowed to reimbursement and audit; risk profiling excluded.",
  },
  {
    id: "cp8", from: "rehab", to: "gpPractice", objects: ["rehabreport"],
    level: "data", outcome: "permitted",
    condition: "Handover to follow-up care under the consent of 24 Feb 2026, with the recipient limited to the named GP practice.",
  },
  {
    id: "cp9", from: "rehab", to: "gpPractice", objects: ["riskscore"],
    level: "derived", outcome: "permitted",
    condition: "Direct access at the follow-up checkpoint. No further clarification was required because the conditions had already been specified in the derived-data-level contract at the preceding checkpoint.",
  },
];

const BASIS = {
  consent: { label: "Consent", color: C.consent },
  contract: { label: "Treatment contract", color: C.contract },
  statute: { label: "Legal obligation", color: C.legal },
};

/* ================================================================== */
/* Helpers                                                             */
/* ================================================================== */
function accessFor(obj, role) {
  if (!role) return "neutral";
  if (obj.perm.write.includes(role)) return "write";
  if (obj.perm.read.includes(role)) return "read";
  return "none";
}

const CONSENT_META = {
  granted: { icon: CheckCircle2, color: C.consent, label: "Consent granted" },
  withdrawn: { icon: XCircle, color: C.revoked, label: "Consent withdrawn" },
  "not required": { icon: MinusCircle, color: C.none, label: "No consent required" },
};

const RD_META = {
  granted: { icon: CheckCircle2, color: C.consent, label: "R&D consent granted" },
  restricted: { icon: AlertTriangle, color: "#9A6B0E", label: "R&D consent restricted" },
  withdrawn: { icon: XCircle, color: C.revoked, label: "R&D consent withdrawn" },
  excluded: { icon: Ban, color: C.revoked, label: "Secondary use excluded" },
  "not requested": { icon: MinusCircle, color: C.none, label: "No R&D consent requested" },
};

/* ================================================================== */
/* Small UI pieces                                                     */
/* ================================================================== */
function LevelBadge({ level, size = "sm" }) {
  const L = LEVELS[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}
      style={{ background: L.light, color: L.color, border: `1px solid ${L.border}` }}
    >
      <Layers size={size === "sm" ? 11 : 13} /> {L.short}
    </span>
  );
}

function OutcomeBadge({ outcome }) {
  const O = OUTCOMES[outcome];
  const Icon = O.icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: O.light, color: O.color, border: `1px solid ${O.color}33` }}>
      <Icon size={11} /> {O.label}
    </span>
  );
}

function AccessBadge({ state }) {
  if (state === "neutral") return null;
  const cfg = {
    write: { bg: C.writeLight, fg: C.write, Icon: Pencil, txt: "Read and write" },
    read: { bg: C.readLight, fg: C.read, Icon: Eye, txt: "Read only" },
    none: { bg: "#EEF1F3", fg: C.none, Icon: Lock, txt: "No access" },
  }[state];
  const Icon = cfg.Icon;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.fg }}>
      <Icon size={12} /> {cfg.txt}
    </span>
  );
}

/* ================================================================== */
/* Block 1: multi-level data contract architecture                     */
/* ================================================================== */
function ContractBlock({ role, onOpenObject, onOpenJourney, selectedId }) {
  const actorMatchesRole = (actorId) =>
    role === "patient" ? true : ACTORS[actorId].roles.includes(role);
  const involved = (cp) => !role || actorMatchesRole(cp.from) || actorMatchesRole(cp.to);

  return (
    <section className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.ink }}>
          Data contract relationships between actors
        </h2>
        <span className="text-xs" style={{ color: C.inkSoft }}>
          Each row is a journey checkpoint: data are transferred, interpreted, or transformed, and the wrapper is read
        </span>
      </div>

      {/* Journey-level contract banner */}
      <button
        onClick={onOpenJourney}
        className="w-full text-left rounded-lg p-3 transition-all hover:shadow-md"
        style={{
          background: LEVELS.journey.light,
          border: `1.5px solid ${selectedId === "__journey__" ? LEVELS.journey.color : LEVELS.journey.border}`,
          boxShadow: selectedId === "__journey__" ? `0 0 0 2px ${LEVELS.journey.color}` : "none",
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level="journey" size="md" />
          <span className="text-sm font-semibold" style={{ color: LEVELS.journey.color }}>
            {JOURNEY_CONTRACT.id}
          </span>
          <span className="text-sm" style={{ color: C.ink }}>{JOURNEY_CONTRACT.scope}</span>
          <span className="ml-auto text-xs font-medium underline" style={{ color: LEVELS.journey.color }}>
            View default conditions
          </span>
        </div>
        <div className="text-xs mt-1.5 flex items-start gap-1.5" style={{ color: C.inkSoft }}>
          <CornerDownRight size={13} className="mt-0.5 shrink-0" />
          {JOURNEY_CONTRACT.inheritanceRule}
        </div>
      </button>

      {/* Checkpoint rows */}
      <div className="mt-3 space-y-2">
        {CHECKPOINTS.map((cp) => {
          const From = ACTORS[cp.from].icon;
          const To = ACTORS[cp.to].icon;
          const L = LEVELS[cp.level];
          const dim = role && !involved(cp);
          const active = cp.objects.includes(selectedId);
          return (
            <button
              key={cp.id}
              onClick={() => onOpenObject(cp.objects[0])}
              className="w-full text-left rounded-lg p-2.5 transition-all"
              style={{
                background: C.card,
                borderLeft: `4px solid ${L.color}`,
                border: `1px solid ${active ? L.color : C.line}`,
                borderLeftWidth: 4, borderLeftColor: L.color,
                boxShadow: active ? `0 0 0 2px ${L.color}55` : "0 1px 2px rgba(22,35,46,0.05)",
                opacity: dim ? 0.4 : 1,
              }}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.ink }}>
                  <From size={14} style={{ color: C.desc }} /> {ACTORS[cp.from].label}
                </span>
                <ArrowRight size={15} style={{ color: L.color }} />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.ink }}>
                  <To size={14} style={{ color: C.desc }} /> {ACTORS[cp.to].label}
                </span>
                <span className="ml-auto flex flex-wrap items-center gap-1.5">
                  <LevelBadge level={cp.level} />
                  <OutcomeBadge outcome={cp.outcome} />
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {cp.objects.map((oid) => {
                  const o = objById(oid);
                  const Icon = o.icon;
                  return (
                    <span key={oid} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]"
                      style={{ background: C.descLight, color: C.desc }}>
                      <Icon size={11} /> {o.desc.title}
                    </span>
                  );
                })}
              </div>
              <div className="text-xs mt-1.5" style={{ color: C.inkSoft }}>{cp.condition}</div>
            </button>
          );
        })}
      </div>

      {role && (
        <div className="text-xs mt-3" style={{ color: C.inkSoft }}>
          {role === "patient"
            ? "As the data subject, the patient is a party to every checkpoint in this journey."
            : `Checkpoints involving the ${roleLabel(role)} are highlighted; others are dimmed.`}
        </div>
      )}
    </section>
  );
}

/* ================================================================== */
/* Object card                                                         */
/* ================================================================== */
function ObjectCard({ obj, role, selected, onClick }) {
  const state = accessFor(obj, role);
  const consent = CONSENT_META[obj.gov.consent.status];
  const ConsentIcon = consent.icon;
  const rd = RD_META[obj.gov.rd.status];
  const RdIcon = rd.icon;
  const Icon = obj.icon;
  const locked = state === "none";
  const L = LEVELS[obj.level];
  const ring = state === "write" ? C.write : state === "read" ? C.read : selected ? C.gov : "transparent";
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg transition-all focus:outline-none"
      style={{
        background: C.card,
        border: `1px solid ${selected ? C.gov : C.line}`,
        borderLeft: `4px solid ${L.color}`,
        boxShadow: selected
          ? `0 0 0 2px ${C.gov}, 0 6px 16px rgba(22,35,46,0.10)`
          : state === "write" || state === "read"
          ? `0 0 0 2px ${ring}, 0 2px 6px rgba(22,35,46,0.06)`
          : "0 1px 3px rgba(22,35,46,0.06)",
        opacity: locked ? 0.45 : 1,
        filter: locked ? "grayscale(0.9)" : "none",
      }}
      aria-label={`Open data object ${obj.desc.title}`}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 rounded-md p-1.5" style={{ background: C.descLight, color: C.desc }}>
            {locked ? <Lock size={15} /> : <Icon size={15} />}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight" style={{ color: C.ink }}>{obj.desc.title}</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>{obj.desc.date}</div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <LevelBadge level={obj.level} />
          {obj.level === "derived" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: LEVELS.derived.color }}>
              <GitBranch size={11} /> from {obj.gov.derivedFrom.length} source{obj.gov.derivedFrom.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {state !== "neutral" && <div className="mt-2"><AccessBadge state={state} /></div>}
      </div>
      {/* Governance strip */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-b-lg text-xs"
        style={{ background: C.govLight, borderTop: `1px solid ${C.govBorder}`, color: C.gov }}>
        <span title={consent.label}><ConsentIcon size={13} style={{ color: consent.color }} /></span>
        <span title={rd.label} className="inline-flex items-center gap-0.5">
          <Sparkles size={11} /><RdIcon size={12} style={{ color: rd.color }} />
        </span>
        <span className="inline-flex items-center gap-1" title={`Retention: ${obj.gov.retention}`}>
          <Clock size={12} /> {obj.gov.retention.split("(")[0].trim().split(";")[0].split("·")[0]}
        </span>
        <span className="inline-flex items-center gap-1 ml-auto" title="Disclosures to third parties">
          <Share2 size={12} /> {obj.gov.disclosures.length}
        </span>
      </div>
    </button>
  );
}

/* ================================================================== */
/* Detail panels                                                       */
/* ================================================================== */
function Field({ label, children }) {
  return (
    <div className="mb-2.5">
      <div className="text-xs uppercase tracking-wide font-medium mb-0.5" style={{ color: C.inkSoft }}>{label}</div>
      <div className="text-sm" style={{ color: C.ink }}>{children}</div>
    </div>
  );
}

function PanelShell({ eyebrow, title, accent, onClose, children }) {
  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full overflow-y-auto shadow-2xl
                 lg:static lg:z-auto lg:h-auto lg:overflow-visible lg:w-[58%] xl:w-[60%] lg:shrink-0 lg:shadow-none"
      style={{ background: C.card, borderLeft: `1px solid ${C.line}` }} aria-label="Contract detail view">
      <div className="z-10 flex items-start justify-between gap-3 px-5 py-4"
        style={{ background: C.card, borderBottom: `2px solid ${accent}` }}>
        <div>
          <div className="text-xs uppercase tracking-wide" style={{ color: C.inkSoft }}>{eyebrow}</div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: C.ink, fontFamily: "'IBM Plex Serif', serif" }}>
            {title}
          </h2>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-md p-1.5 hover:bg-slate-100" style={{ color: C.inkSoft }}>
          <X size={18} />
        </button>
      </div>
      {children}
    </aside>
  );
}

function JourneyPanel({ onClose }) {
  const J = JOURNEY_CONTRACT;
  return (
    <PanelShell eyebrow="Journey-level contract" title={`${J.id} — default conditions`} accent={LEVELS.journey.color} onClose={onClose}>
      <section className="px-5 py-4">
        <div className="rounded-lg p-4" style={{ background: LEVELS.journey.light, border: `1px solid ${LEVELS.journey.border}` }}>
          <Field label="Scope of validity">{J.scope}</Field>
          <Field label="Data subject">{J.subject}</Field>
          <Field label="Default legitimate purposes">
            <ul className="list-disc pl-4 space-y-0.5">{J.purposes.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </Field>
          <Field label="Authorised actor categories">{J.actorCategories}</Field>
          <Field label="Temporal validity">{J.validity}</Field>
          <Field label="Consent references">{J.consentRefs}</Field>
          <Field label="Accountability contact">{J.accountability}</Field>
          <Field label="Escalation procedure">{J.escalation}</Field>
        </div>
        <div className="mt-3 rounded-lg p-3 text-sm" style={{ background: C.govLight, border: `1px solid ${C.govBorder}`, color: C.ink }}>
          <div className="font-semibold mb-1 inline-flex items-center gap-1.5" style={{ color: C.gov }}>
            <Layers size={14} /> Inheritance rule
          </div>
          {J.inheritanceRule}
        </div>
      </section>
    </PanelShell>
  );
}

function DetailPanel({ obj, role, onClose, onOpenObject }) {
  const consent = CONSENT_META[obj.gov.consent.status];
  const ConsentIcon = consent.icon;
  const rd = RD_META[obj.gov.rd.status];
  const RdIcon = rd.icon;
  const L = LEVELS[obj.level];

  return (
    <PanelShell eyebrow={`Data object · ${L.label}`} title={obj.desc.title} accent={L.color} onClose={onClose}>
      <div className="px-5 py-4 xl:grid xl:grid-cols-2 xl:gap-5 xl:items-start">
      <div className="space-y-4">
      {/* Contract level and inheritance */}
      <section>
        <div className="rounded-lg p-3" style={{ background: L.light, border: `1px solid ${L.border}` }}>
          <div className="flex items-center gap-2 mb-2"><LevelBadge level={obj.level} size="md" /></div>
          <div className="text-xs mb-1" style={{ color: C.inkSoft }}>INHERITS FROM</div>
          <div className="text-sm mb-2" style={{ color: C.ink }}>{obj.gov.inherits}</div>
          {obj.gov.narrowing && (
            <div className="flex items-start gap-1.5 text-sm" style={{ color: C.ink }}>
              <CornerDownRight size={14} className="mt-0.5 shrink-0" style={{ color: L.color }} />
              <span><span className="font-semibold" style={{ color: L.color }}>Narrowed:</span> {obj.gov.narrowing}</span>
            </div>
          )}
          {obj.level === "derived" && (
            <div className="mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${L.border}` }}>
              <div className="text-xs mb-1 inline-flex items-center gap-1.5" style={{ color: C.inkSoft }}>
                <GitBranch size={12} /> DERIVED FROM
              </div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {obj.gov.derivedFrom.map((sid) => {
                  const s = objById(sid);
                  const SIcon = s.icon;
                  return (
                    <button key={sid} onClick={() => onOpenObject(sid)}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] underline"
                      style={{ background: C.card, color: L.color, border: `1px solid ${L.border}` }}>
                      <SIcon size={11} /> {s.desc.title}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{obj.gov.derivationNote}</div>
            </div>
          )}
        </div>
      </section>

      {/* A) Descriptive metadata */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-1 rounded" style={{ background: C.desc }} />
          <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: C.desc }}>Descriptive metadata</h3>
        </div>
        <div className="rounded-lg p-4" style={{ background: C.descLight }}>
          <Field label="Title">{obj.desc.title}</Field>
          <Field label="Date created">{obj.desc.date}</Field>
          <Field label="Originating institution">{obj.desc.institution}</Field>
          <Field label="Data type">{obj.desc.type}</Field>
          <Field label="Format">{obj.desc.format}</Field>
        </div>
      </section>

      </div>

      {/* B) Governance metadata */}
      <section className="mt-4 xl:mt-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-4 w-1 rounded" style={{ background: C.gov }} />
          <h3 className="text-sm font-bold uppercase tracking-wide inline-flex items-center gap-1.5" style={{ color: C.gov }}>
            <ShieldCheck size={15} /> Governance metadata
          </h3>
        </div>
        <div className="rounded-lg p-4" style={{ background: C.govLight, border: `1px solid ${C.govBorder}` }}>
          <div className="text-xs uppercase tracking-wide font-medium mb-1.5" style={{ color: C.gov }}>Authorised roles</div>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-xs" style={{ color: C.inkSoft }}>
                <th className="text-left font-medium pb-1">Role</th>
                <th className="text-center font-medium pb-1 w-16">Read</th>
                <th className="text-center font-medium pb-1 w-20">Write</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((r) => {
                const canR = obj.perm.read.includes(r.id) || obj.perm.write.includes(r.id);
                const canW = obj.perm.write.includes(r.id);
                const active = role === r.id;
                return (
                  <tr key={r.id} style={{ background: active ? "#FFFFFF" : "transparent", outline: active ? `1.5px solid ${C.gov}` : "none" }}>
                    <td className="py-1 pl-1 rounded-l" style={{ color: C.ink, fontWeight: active ? 600 : 400 }}>
                      {r.label}{active ? " ◂" : ""}
                    </td>
                    <td className="text-center py-1">
                      {canR ? <Eye size={14} className="inline" style={{ color: C.read }} /> : <Lock size={13} className="inline" style={{ color: C.none }} />}
                    </td>
                    <td className="text-center py-1 pr-1 rounded-r">
                      {canW ? <Pencil size={14} className="inline" style={{ color: C.write }} /> : <span style={{ color: C.none }}>–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Field label="Processing purpose">{obj.gov.purpose}</Field>
          <Field label="Legal basis">{obj.gov.basis}</Field>

          <Field label="Consent status (primary use)">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: obj.gov.consent.status === "withdrawn" ? C.revokedLight : "#FFFFFF", color: consent.color, border: `1px solid ${consent.color}` }}>
              <ConsentIcon size={14} /> {consent.label}
            </span>
            <div className="text-xs mt-1" style={{ color: C.inkSoft }}>{obj.gov.consent.detail}</div>
          </Field>

          {/* NEW: derived-data-level / secondary use */}
          <div className="my-3 rounded-lg p-3" style={{ background: "#FFFFFF", border: `1px solid ${LEVELS.derived.border}` }}>
            <div className="text-xs uppercase tracking-wide font-semibold mb-2 inline-flex items-center gap-1.5" style={{ color: LEVELS.derived.color }}>
              <Sparkles size={13} /> Research &amp; development consent (derived-data level)
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold mb-2"
              style={{ background: LEVELS.derived.light, color: rd.color, border: `1px solid ${rd.color}55` }}>
              <RdIcon size={14} /> {rd.label}
            </span>
            <Field label="Scope of secondary use">{obj.gov.rd.scope}</Field>
            <Field label="Conditions on derivation">{obj.gov.rd.derivation}</Field>
            <Field label="Downstream restrictions">{obj.gov.rd.restrictions}</Field>
            <div className="text-[11px] pt-1" style={{ color: C.inkSoft }}>
              Governs whether new data may be generated from this object and under which conditions the resulting
              derived-data-level contract may be written. Restrictions may be narrowed downstream, never widened.
            </div>
          </div>

          <Field label="Retention period">
            <span className="inline-flex items-center gap-1"><Clock size={14} style={{ color: C.gov }} /> {obj.gov.retention}</span>
          </Field>

          <Field label="Disclosures to third parties">
            {obj.gov.disclosures.length === 0 ? (
              <span style={{ color: C.inkSoft }}>No disclosures recorded.</span>
            ) : (
              <ul className="space-y-1.5">
                {obj.gov.disclosures.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Share2 size={14} className="mt-0.5 shrink-0" style={{ color: BASIS[w.basis].color }} />
                    <span>
                      <span className="font-medium">{w.to}</span> · {w.purpose}{" "}
                      <span className="text-xs rounded-full px-1.5 py-0.5 whitespace-nowrap"
                        style={{ background: "#FFFFFF", color: BASIS[w.basis].color, border: `1px solid ${BASIS[w.basis].color}` }}>
                        {BASIS[w.basis].label}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field label="Accountability and escalation">
            <div>{obj.gov.accountability.contact}</div>
            <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>{obj.gov.accountability.escalation}</div>
          </Field>

          <div className="text-xs uppercase tracking-wide font-medium mb-1.5 mt-3 inline-flex items-center gap-1.5" style={{ color: C.gov }}>
            <ScrollText size={13} /> Access and event log
          </div>
          <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${C.govBorder}` }}>
            {obj.gov.log.map((p, i) => (
              <div key={i} className="px-2.5 py-1.5 text-xs flex flex-wrap gap-x-2"
                style={{ background: i % 2 ? "#FBF9FE" : "#FFFFFF", fontFamily: "'IBM Plex Mono', monospace", color: C.ink }}>
                <span style={{ color: C.inkSoft }}>{p.when}</span>
                <span className="font-medium">{p.who}</span>
                <span style={{ color: C.gov }}>[{p.role}]</span>
                <span className="ml-auto">{p.action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </PanelShell>
  );
}

/* ================================================================== */
/* Legend                                                              */
/* ================================================================== */
function Legend() {
  const Item = ({ children }) => (
    <div className="flex items-center gap-2 text-xs mb-1" style={{ color: C.ink }}>{children}</div>
  );
  const Swatch = ({ color }) => (
    <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: "#FFFFFF", border: `2px solid ${color}` }} />
  );
  const DRS = [
    ["DR1", "Conditions are interpretable across settings — one shared representation for every actor"],
    ["DR2", "Conditions travel with the object — the wrapper is shown at each checkpoint, not per system"],
    ["DR3", "Level-based granularity — journey, data, and derived-data contracts"],
    ["DR4", "Governance continuity for derived data — provenance and inherited restrictions"],
    ["DR5", "Role- and purpose-based conditions — the perspective switch"],
    ["DR6", "Human interpretation supported — outcomes inform judgement, they do not enforce"],
  ];
  return (
    <div className="rounded-xl p-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: C.ink }}>Legend</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2.5">
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Contract levels (Figure 1)</div>
          {Object.entries(LEVELS).map(([k, L]) => (
            <Item key={k}><Swatch color={L.color} /> {L.label}</Item>
          ))}
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Checkpoint outcome</div>
          {Object.keys(OUTCOMES).map((k) => <Item key={k}><OutcomeBadge outcome={k} /></Item>)}
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Metadata layers and access</div>
          <Item><span className="h-3 w-3 rounded-sm shrink-0" style={{ background: C.descLight, border: `1.5px solid ${C.desc}` }} /> Descriptive metadata</Item>
          <Item><span className="h-3 w-3 rounded-sm shrink-0" style={{ background: C.govLight, border: `1.5px solid ${C.gov}` }} /> Governance metadata</Item>
          <Item><AccessBadge state="write" /></Item>
          <Item><AccessBadge state="read" /></Item>
          <Item><AccessBadge state="none" /></Item>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Consent encodings</div>
          <Item><CheckCircle2 size={14} style={{ color: C.consent }} /> Primary consent granted</Item>
          <Item><XCircle size={14} style={{ color: C.revoked }} /> Primary consent withdrawn</Item>
          <Item><MinusCircle size={14} style={{ color: C.none }} /> Not required</Item>
          <Item><Sparkles size={13} style={{ color: LEVELS.derived.color }} /> R&amp;D consent for derivation</Item>
        </div>
      </div>
      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
        <div className="text-xs font-semibold mb-1.5" style={{ color: C.inkSoft }}>Design requirements demonstrated</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
          {DRS.map(([dr, txt]) => (
            <div key={dr} className="flex items-start gap-1.5 text-xs" style={{ color: C.ink }}>
              <span className="shrink-0 rounded px-1 py-0.5 font-bold text-[10px]" style={{ background: C.govLight, color: C.gov }}>{dr}</span>
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Main app                                                            */
/* ================================================================== */
const STATIONS = [
  { id: "gp", label: "GP practice", sub: "Dr. J. Weber, Osnabrück", flex: 1 },
  { id: "hospital", label: "Hospital", sub: "St. Elisabeth Clinic · admission, diagnostics, surgery", flex: 2 },
  { id: "rehab", label: "Rehabilitation clinic", sub: "Teutoburg Forest Rehab Centre", flex: 1 },
  { id: "followup", label: "Follow-up care", sub: "GP practice Dr. Weber", flex: 1 },
];

export default function App() {
  const [role, setRole] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const selected = selectedId && selectedId !== "__journey__" ? objById(selectedId) : null;

  const hospitalPhases = ["Admission", "Diagnostics", "Surgery", "Discharge"];
  const panelOpen = selectedId !== null;
  const compact = panelOpen;

  return (
    <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <header className="px-4 sm:px-8 pt-6 pb-4" style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: C.gov }}>
                Design science research prototype · Formative artificial evaluation
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: C.ink, fontFamily: "'IBM Plex Serif', serif" }}>
                Multi-level data contracts and the data governance wrapper
              </h1>
              <p className="text-sm mt-1 max-w-3xl" style={{ color: C.inkSoft }}>
                Every data object carries a portable{" "}
                <span className="font-semibold" style={{ color: C.gov }}>governance wrapper</span> alongside its
                descriptive metadata. Conditions are set at three levels — journey, data, and derived data — and are
                read at journey checkpoints, where data may move, be slowed for clarification, or be stopped.
              </p>
            </div>
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: C.descLight, border: `1px solid ${C.line}` }}>
              <div className="text-xs uppercase tracking-wide font-medium" style={{ color: C.inkSoft }}>Example patient (fictitious)</div>
              <div className="font-semibold" style={{ color: C.ink }}>Erika Mustermann, b. 12 Aug 1964</div>
              <div style={{ color: C.inkSoft }}>Right hip osteoarthritis · total hip arthroplasty · ID K123456789</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide mr-1" style={{ color: C.inkSoft }}>Perspective:</span>
            <button onClick={() => setRole(null)}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              style={{ background: role === null ? C.ink : "#FFFFFF", color: role === null ? "#FFFFFF" : C.ink, border: `1px solid ${role === null ? C.ink : C.line}` }}>
              Overview (neutral)
            </button>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.id;
              return (
                <button key={r.id} onClick={() => setRole(active ? null : r.id)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{ background: active ? C.gov : "#FFFFFF", color: active ? "#FFFFFF" : C.ink, border: `1px solid ${active ? C.gov : C.line}` }}>
                  <Icon size={14} /> {r.label}
                </button>
              );
            })}
            {role && (
              <span className="text-xs ml-1" style={{ color: C.inkSoft }}>
                Highlighting conditions and access rights of the <b>{roleLabel(role)}</b>
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-start">
      <main className={`min-w-0 flex-1 px-4 sm:px-8 py-6 space-y-6 ${compact ? "" : "max-w-7xl mx-auto"}`}>
        <ContractBlock
          role={role}
          selectedId={selectedId}
          onOpenObject={(id) => setSelectedId(id)}
          onOpenJourney={() => setSelectedId("__journey__")}
        />

        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3 px-1" style={{ color: C.ink }}>
            Stations and data objects
            <span className="font-normal normal-case ml-2 text-xs" style={{ color: C.inkSoft }}>
              (select a data object to open its wrapper: descriptive and governance metadata)
            </span>
          </h2>
          <div className={compact ? "grid grid-cols-1 gap-4 items-start" : "flex flex-col lg:flex-row gap-4"}>
            {STATIONS.map((st, si) => {
              const objs = OBJECTS.filter((o) => o.station === st.id);
              return (
                <div key={st.id} className="rounded-xl p-3"
                  style={{ flex: compact ? undefined : st.flex, background: C.card, border: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: C.desc, color: "#FFFFFF" }}>{si + 1}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: C.ink }}>{st.label}</div>
                      <div className="text-xs" style={{ color: C.inkSoft }}>{st.sub}</div>
                    </div>
                  </div>
                  {st.id === "hospital" ? (
                    <div className={compact ? "grid grid-cols-1 gap-3 mt-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3"}>
                      {hospitalPhases.map((ph) => (
                        <div key={ph}>
                          <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: C.desc }}>{ph}</div>
                          <div className="space-y-2.5">
                            {objs.filter((o) => o.phase === ph).map((o) => (
                              <ObjectCard key={o.id} obj={o} role={role} selected={selectedId === o.id} onClick={() => setSelectedId(o.id)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 mt-3">
                      {objs.map((o) => (
                        <ObjectCard key={o.id} obj={o} role={role} selected={selectedId === o.id} onClick={() => setSelectedId(o.id)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <Legend />

        <footer className="text-xs pb-6 px-1" style={{ color: C.inkSoft }}>
          All personal, institutional and case data are fictitious and serve solely to demonstrate the multi-level data
          contract architecture. The wrapper represents governance conditions; it neither establishes legal authority nor
          enforces compliance. Prototype without a backend; state held in memory only.
        </footer>
      </main>

      {panelOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSelectedId(null)} />
      )}
      {selectedId === "__journey__" && <JourneyPanel onClose={() => setSelectedId(null)} />}
      {selected && (
        <DetailPanel obj={selected} role={role} onClose={() => setSelectedId(null)} onOpenObject={(id) => setSelectedId(id)} />
      )}
      </div>
    </div>
  );
}
