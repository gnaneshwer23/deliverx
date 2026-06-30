-- Slice E — Brain document storage bucket (server uploads via API)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brain-documents',
  'brain-documents',
  false,
  12582912,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/octet-stream'
  ]
)
on conflict (id) do nothing;
