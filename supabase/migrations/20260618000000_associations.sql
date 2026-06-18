create table public.associations (
  id              varchar(10)   primary key,
  id_ex           varchar(10),
  siret           varchar(14),
  rup_mi          varchar(11),
  gestion         varchar(4),
  date_creat      date,
  date_decla      date,
  date_publi      date,
  date_disso      date,
  maj_time        timestamptz,
  nature          char(1),
  groupement      char(1),
  position        char(1),
  objet_social1   varchar(6),
  objet_social2   varchar(6),
  titre           varchar(250)  not null,
  titre_court     varchar(38),
  objet           text,
  adrs_complement varchar(76),
  adrs_numvoie    varchar(10),
  adrs_repetition char(1),
  adrs_typevoie   varchar(5),
  adrs_libvoie    varchar(42),
  adrs_distrib    varchar(38),
  adrs_codeinsee  varchar(5),
  adrs_codepostal varchar(5),
  adrs_libcommune varchar(45),
  adrg_declarant  varchar(38),
  adrg_complemid  varchar(38),
  adrg_complemgeo varchar(38),
  adrg_libvoie    varchar(38),
  adrg_distrib    varchar(38),
  adrg_codepostal varchar(5),
  adrg_achemine   varchar(32),
  adrg_pays       varchar(38),
  dir_civilite    char(2),
  telephone       varchar(10),
  siteweb         varchar(64),
  email           varchar(64),
  publiweb        char(1),
  observation     varchar(255),
  source          text          not null default 'waldec',
  created_at      timestamptz   default now(),
  updated_at      timestamptz   default now()
);

create index associations_fts on public.associations
  using gin(to_tsvector('french', coalesce(titre, '') || ' ' || coalesce(objet, '')));

create table public.ingestion_runs (
  id            bigint generated always as identity primary key,
  resource_id   text          not null,
  last_modified timestamptz,
  filesize      bigint,
  row_count     bigint,
  status        text          not null,
  error_message text,
  imported_at   timestamptz   default now()
);

alter table public.associations enable row level security;
create policy "public read" on public.associations for select using (true);

alter table public.ingestion_runs enable row level security;
