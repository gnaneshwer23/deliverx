# Confidence-band algorithm

**Version:** `confidence-bands@2026.1`  
**Status:** Active (B1 / SCH-BANDS / PACK-E3)  
**Authority:** Build Charter · PD-2026-07-05 · Capability Engine  
**Typed SoT:** `src/lib/capability-engine/confidence-bands.ts`  
**Related engine version:** `capability-engine-v1` (orchestration / persist — separate pin)

---

## Purpose

Candidates and employers can understand **capability bands** and **confidence display bands** without pseudo-% theatre. Every band shown in Profile, Career, or Portfolio must be explainable (“Why this band”).

---

## Capability bands (levels)

Capability bands are the Capability Engine levels. **Do not invent parallel band vocabularies.**

| Band id | UI label |
| --- | --- |
| `emerging` | Emerging |
| `developing` | Developing |
| `proficient` | Proficient |
| `advanced` | Advanced |
| `insufficient_evidence` | Insufficient evidence |

### Input signals (what the code uses)

Mapped by `mapSignalsToCapabilityBand`:

| Signal | Meaning |
| --- | --- |
| `avgStrength` | Mean evidence→indicator strength hint in `[0, 1]` |
| `practiceEvidenceCount` | Count of non-knowledge-only practice evidence items |
| `hasVerified` | Any cited item is `platform_verified` **or** `sourceType === external_verification` |
| `knowledgeOnly` | Every cited item is knowledge-only |

Recency, AI domination, and contradictions adjust **confidence** (below), not the level mapper directly. Contradiction severity can still affect review / confidence after judgement.

### Mapping rules

Evaluated top-down (first match wins):

1. `knowledgeOnly` **or** `practiceEvidenceCount === 0` → `insufficient_evidence`
2. `hasVerified` **and** `avgStrength >= 0.75` **and** `practiceEvidenceCount >= 2` → `advanced`
3. `hasVerified` **and** `avgStrength >= 0.6` → `proficient`
4. `avgStrength >= 0.55` **and** `practiceEvidenceCount >= 2` → `proficient`
5. `avgStrength >= 0.4` **or** `practiceEvidenceCount >= 2` → `developing`
6. `avgStrength >= 0.25` → `emerging`
7. else → `insufficient_evidence`

Rubric anchors (versioned `pm-core@…`) supply human-readable reasoning text; they do not change the band id.

---

## Confidence display bands

Internal judgements carry a numeric `confidence` in `[0, 1]` from `calculateConfidence` (evidence count, verification method, knowledge-only / AI-dominated penalties, age > 365 days, contradiction severity).

**UI must not present that number as a decorative %.** Map to display bands via `mapConfidenceToDisplayBand`:

| Display band | Threshold | UI label |
| --- | --- | --- |
| `higher` | `confidence >= 0.75` | Higher confidence |
| `moderate` | `0.45 <= confidence < 0.75` | Moderate confidence |
| `lower` | `confidence < 0.45` (or non-finite) | Lower confidence |

### Confidence input signals (what the calculator uses)

Documented for honesty; calculator lives in `confidence-and-contradictions.ts`:

- Evidence citation count (capped contribution)
- `platform_verified` / `external_verification` boosts
- Knowledge-only and AI-dominated penalties
- Staleness (`ageDays > 365`)
- Contradiction severity (`high` / `medium`)
- Cap for `insufficient_evidence` judgements

---

## How UI should cite “Why this band”

1. Show the **capability band label** from `formatCapabilityBandLabel` / `CAPABILITY_BAND_COPY`.
2. Show static **Why this band** from `whyThisCapabilityBand` (algorithm meaning).
3. Prefer also showing claim-specific `reasoningSummary` and evidence citation ids when present.
4. Show **confidence display band** via `formatConfidenceDisplayLabel` + `whyThisConfidenceDisplayBand` — never `Math.round(confidence * 100)%` as capability truth.
5. Cite algorithm version when packaging claims: `confidenceBandAlgorithmVersion` on SnapshotClaims / `CONFIDENCE_BAND_ALGORITHM_VERSION`.

---

## Explicit non-goals

- No unexplained scores or decorative readiness % as **capability** truth (PD-2026-07-05).
- Learning completion ≠ capability; knowledge-only paths stay `insufficient_evidence`.
- ScoreRun / band mapping alone **never** lights `deliverxVerified` (PD-2026-07-06 / T8).
- No new band vocabulary (e.g. “Demonstrated / Consistent”) unless a future product decision replaces this version.
- No DB enum migration required for this version (bands remain string levels on judgements).

---

## Versioning

Bump `CONFIDENCE_BAND_ALGORITHM_VERSION` and this document together when thresholds or band ids change. Persist path continues to pin `capability-engine-v1` separately for full orchestration.
