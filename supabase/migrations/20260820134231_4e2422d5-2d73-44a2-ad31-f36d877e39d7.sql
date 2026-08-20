alter table public.scans add column if not exists latitude double precision;
alter table public.scans add column if not exists longitude double precision;
alter table public.scans add column if not exists district text;
alter table public.scans add column if not exists taluka text;