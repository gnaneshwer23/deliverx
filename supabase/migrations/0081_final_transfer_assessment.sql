-- Phase 5 (part A): evidence source enum values for final/transfer assessment.
-- Must commit before inserts that reference the new enum labels (PG 55P04).

alter type public.pi_evidence_source_type add value if not exists 'final_assessment';
alter type public.pi_evidence_source_type add value if not exists 'transfer_assessment';
