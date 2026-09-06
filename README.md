# Patient Data Journey — Multi-Level Data Contracts

Interactive demonstrator for the paper *Portable data governance across patient data
journeys* (ICIS 2026, research-in-progress). The prototype applies a portable data
governance wrapper to a fictitious patient data journey and instantiates the
multi-level data contract architecture (journey level, data level, derived-data level).

**All personal, institutional and case data are fictitious.** The wrapper represents
governance conditions and makes them inspectable; it does not establish legal
authority and does not enforce compliance.

## What the demonstrator shows

- **Data contract relationships between actors** — each row is a journey checkpoint
  (transfer, interpretation, transformation), annotated with the governing contract
  level and the outcome the wrapper supports: permitted, clarification required, blocked.
- **Journey-level contract** — default conditions for the episode of care and the
  inheritance rule: lower levels may narrow, never widen.
- **The wrapper per data object** — descriptive metadata separated from governance
  metadata (authorised roles, purpose, legal basis, consent, research and development
  consent, retention, disclosures, accountability and escalation, event log).
- **Derived data** — provenance links to source objects and inherited restrictions.
- **Perspective switch** — the same journey seen from six role types.

## Running it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open the address printed in the terminal (usually http://localhost:5173).

## Building a standalone file

```bash
npm run build
```

`dist/index.html` is a single self-contained file with all code and styles inlined.
It can be opened by double-clicking, without a server — convenient for presentations
and for sharing with reviewers.

## Structure

- `src/patient-data-journey.jsx` — the entire demonstrator: data model and interface
- `src/main.jsx` — React entry point
- `vite.config.js` — Vite, Tailwind, and the single-file build plugin

State is held in memory only; there is no backend and no persistence.
