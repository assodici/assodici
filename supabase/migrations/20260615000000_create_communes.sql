create table public.communes (
  id          serial primary key,
  code_postal varchar(5) not null,
  nom_commune text       not null
);

create index communes_code_postal_idx on public.communes (code_postal);

alter table public.communes enable row level security;

grant select on public.communes to anon, authenticated;

create policy "public read"
  on public.communes
  for select
  to anon, authenticated
  using (true);
