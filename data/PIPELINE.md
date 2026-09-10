# Data pipeline layout

```
SOURCE (official portal / live API)
  -> data/raw/                 (immutable raw evidence: PDFs, fetched pages, API payloads + retrieval memo)
  -> validation (data/validation/reports/)   (schema/dupe/range checks, never silent repair)
  -> data/normalized/          (cleaned, typed records with provenance envelope)
  -> data/processed/           (versioned datasets engines actually read)
  -> BUSINESS ENGINE (deterministic code only)
```

Active versioned datasets live beside this pipeline during the migration
(`data/schemes/`, `data/tamilnadu/`, `data/business-templates/`,
`data/regulatory-rules/`, `data/seed/`) and are inventoried in
`data/source_registry.json`. New normalizations land in
`data/normalized/` + `data/processed/` with a `dataset_version`.

Rules:
- Never write external API responses directly into business logic.
- Every normalized record keeps `{dataset_version, source_version,
  retrieved_at, effective_from, effective_to, source_url}`.
- Scheme history is append-only (`v1`, `v2`, ...); engines use the
  currently valid version. Never overwrite history silently.
- Snapshots of inputs that produced a decision go to `data/snapshots/`
  so results reproduce byte-for-byte.
- `data/sample/` holds legacy dev samples only — engines never read it.
