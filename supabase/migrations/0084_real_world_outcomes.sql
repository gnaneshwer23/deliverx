-- Phase 7: Real-world outcome loop — enum value only.
-- Split from the body (0085) so the new enum value commits before it is used, per
-- PG 55P04 ("unsafe use of new value ... of enum type" in the same transaction).
-- See 0081 → 0082 for the same pattern.

alter type public.pi_evidence_source_type add value if not exists 'real_world_outcome';
