-- Sprint G2 — add in_review to task_status for kanban parity

alter type public.task_status add value if not exists 'in_review' after 'in_progress';
