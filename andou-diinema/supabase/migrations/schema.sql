-- =====================================================================
--  ANDOU DIINEMA — Schéma Supabase (PostgreSQL)
--  À exécuter une seule fois dans Supabase > SQL Editor (ou via la CLI).
--  Sécurité : RLS activée sur TOUTES les tables. Les données personnelles
--  (progression, bilans, favoris) ne sont lisibles que par leur propriétaire.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------
do $$ begin
  create type public.content_status as enum ('draft', 'review', 'validated', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.staff_role as enum ('admin', 'editor', 'reviewer');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- Rôles d'administration
--   admin    : tout gérer (publication, suppression, statistiques)
--   editor   : créer et modifier les contenus, les soumettre à validation
--   reviewer : valider religieusement les contenus (personne qualifiée)
-- Les rôles s'attribuent UNIQUEMENT en SQL (voir README), jamais depuis le site.
-- ---------------------------------------------------------------------
create table if not exists public.admin_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.staff_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.has_role(roles public.staff_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid() and role = any (roles)
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['admin']::public.staff_role[]);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(array['admin', 'editor', 'reviewer']::public.staff_role[]);
$$;

-- ---------------------------------------------------------------------
-- Profils (créés automatiquement à l'inscription)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  display_name          text check (char_length(display_name) <= 60),
  reminder_prefs        jsonb not null default '{}'::jsonb,
  programme_cycle       int not null default 1 check (programme_cycle >= 1),
  programme_started_at  date,
  encouragements        int not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- ---------------------------------------------------------------------
-- Contenus
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  lettre      text,
  titre       text not null,
  resume      text,
  icon        text,
  position    int not null default 0,
  status      public.content_status not null default 'draft',
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.quran_verses (
  id            text primary key check (id ~ '^[a-z0-9-]+$'),
  sourate       text not null,
  sourate_num   int not null check (sourate_num between 1 and 114),
  ayat          text not null,
  texte_ar      text,
  traduction_fr text not null,
  status        public.content_status not null default 'draft',
  review_note   text,
  validated_by  uuid references auth.users (id),
  validated_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.hadiths (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  texte_fr     text not null,
  texte_ar     text,
  reference    text not null,
  grade        text not null,
  contexte     text,
  status       public.content_status not null default 'draft',
  review_note  text,
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.invocations (
  id                text primary key check (id ~ '^[a-z0-9-]+$'),
  titre             text not null,
  theme             text,
  texte_ar          text,
  translitteration  text,
  traduction_fr     text not null,
  reference         text not null,
  status            public.content_status not null default 'draft',
  review_note       text,
  validated_by      uuid references auth.users (id),
  validated_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.articles (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category_id    text references public.categories (id) on update cascade on delete set null,
  titre          text not null,
  accroche       text,
  hukm           text,
  intro          text,
  explication    text,
  danger         text,
  comprendre     text,
  installation   text,
  consequences   text[] not null default '{}',
  signes         text[] not null default '{}',
  abandon        text[] not null default '{}',
  plan           text[] not null default '{}',
  verset_ids     text[] not null default '{}',
  hadith_ids     text[] not null default '{}',
  invocation_id  text,
  encouragement  text,
  status         public.content_status not null default 'draft',
  review_note    text,
  validated_by   uuid references auth.users (id),
  validated_at   timestamptz,
  published_at   timestamptz,
  views          int not null default 0,
  created_by     uuid references auth.users (id) default auth.uid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists articles_status_idx on public.articles (status);
create index if not exists articles_category_idx on public.articles (category_id);

-- Catalogue des comportements (un péché peut être relié à un article détaillé)
create table if not exists public.sins (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  category_id  text references public.categories (id) on update cascade on delete set null,
  nom          text not null,
  hukm         text,
  article_slug text references public.articles (slug) on update cascade on delete set null,
  status       public.content_status not null default 'draft',
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.daily_programs (
  jour          int primary key check (jour between 1 and 30),
  phase         int not null check (phase between 1 and 6),
  mission       text not null,
  enseignement  text,
  verset_id     text references public.quran_verses (id) on delete set null,
  hadith_id     text references public.hadiths (id) on delete set null,
  explication   text,
  action        text,
  invocation_id text references public.invocations (id) on delete set null,
  status        public.content_status not null default 'draft',
  review_note   text,
  validated_by  uuid references auth.users (id),
  validated_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Rappels / annonces publiés par l'équipe (programmables)
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null check (char_length(titre) <= 120),
  message      text not null check (char_length(message) <= 1000),
  lien         text check (lien is null or lien ~ '^/'),
  scheduled_at timestamptz not null default now(),
  status       public.content_status not null default 'draft',
  validated_by uuid references auth.users (id),
  validated_at timestamptz,
  created_by   uuid references auth.users (id) default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Données personnelles (privées)
-- ---------------------------------------------------------------------
-- kind : 'programme' (ref = "<cycle>:<jour>"), 'prayer' (ref = fajr|dhuhr|asr|maghrib|isha),
--        'dhikr' (ref = formule), 'goal' (ref = identifiant d'objectif)
create table if not exists public.user_progress (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  kind       text not null check (kind in ('programme', 'prayer', 'dhikr', 'goal')),
  ref        text not null check (char_length(ref) <= 80),
  day        date not null default current_date,
  value      int not null default 1 check (value >= 0 and value <= 100000),
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, ref, day)
);
create index if not exists user_progress_user_idx on public.user_progress (user_id, kind, day);

create table if not exists public.daily_reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  day        date not null default current_date,
  answers    jsonb not null default '{}'::jsonb check (pg_column_size(answers) <= 4000),
  note       text check (char_length(note) <= 2000),
  score      int check (score between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  item_type  text not null check (item_type in ('article', 'hadith', 'verset', 'invocation', 'theme')),
  item_id    text not null check (char_length(item_id) <= 120),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);

-- Messages du formulaire de contact (lisibles par les administrateurs uniquement)
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null check (char_length(nom) between 1 and 100),
  email      text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message    text not null check (char_length(message) between 5 and 3000),
  user_id    uuid references auth.users (id) on delete set null default auth.uid(),
  traite     boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Workflow de validation : brouillon → relecture → validé → publié
-- Un contenu ne peut être PUBLIÉ que s'il a été VALIDÉ par un reviewer/admin.
-- ---------------------------------------------------------------------
create or replace function public.enforce_validation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'validated' then
      if not public.has_role(array['admin', 'reviewer']::public.staff_role[]) then
        raise exception 'Seul un validateur qualifié peut valider un contenu.';
      end if;
      new.validated_by := auth.uid();
      new.validated_at := now();
    elsif new.status = 'published' then
      if not public.is_admin() then
        raise exception 'Seul un administrateur peut publier.';
      end if;
    end if;
  end if;

  if tg_op = 'INSERT' and new.status in ('validated', 'published') and auth.uid() is not null then
    raise exception 'Un nouveau contenu doit passer par la validation avant publication.';
  end if;

  if new.status = 'published' and new.validated_by is null and auth.uid() is not null then
    raise exception 'Ce contenu doit être validé par une personne qualifiée avant publication.';
  end if;

  -- toute modification du texte d'un contenu validé/publié le renvoie en relecture
  if tg_op = 'UPDATE' and old.status in ('validated', 'published') and new.status = old.status
     and auth.uid() is not null
     and (to_jsonb(new) - array['status','validated_by','validated_at','updated_at','views','published_at','review_note'])
         is distinct from
         (to_jsonb(old) - array['status','validated_by','validated_at','updated_at','views','published_at','review_note']) then
    new.status := 'review';
    new.validated_by := null;
    new.validated_at := null;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['categories','quran_verses','hadiths','invocations','articles','sins','daily_programs','notifications'] loop
    execute format('drop trigger if exists enforce_validation on public.%I', t);
    execute format('create trigger enforce_validation before insert or update on public.%I for each row execute function public.enforce_validation()', t);
  end loop;
  foreach t in array array['profiles','user_progress','daily_reviews'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

create or replace function public.set_published_at()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status = 'published' and (old is null or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists set_published_at on public.articles;
create trigger set_published_at before insert or update on public.articles
  for each row execute function public.set_published_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.admin_roles      enable row level security;
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.quran_verses     enable row level security;
alter table public.hadiths          enable row level security;
alter table public.invocations      enable row level security;
alter table public.articles         enable row level security;
alter table public.sins             enable row level security;
alter table public.daily_programs   enable row level security;
alter table public.notifications    enable row level security;
alter table public.user_progress    enable row level security;
alter table public.daily_reviews    enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.contact_messages enable row level security;

-- admin_roles : chacun voit ses propres rôles ; l'admin voit tout. Aucune écriture via l'API.
drop policy if exists "roles_select" on public.admin_roles;
create policy "roles_select" on public.admin_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- profiles : uniquement son propre profil
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Contenus : lecture publique des contenus publiés ; l'équipe voit tout ;
-- éditeurs/admins écrivent ; seuls les admins suppriment.
do $$
declare t text;
begin
  foreach t in array array['categories','quran_verses','hadiths','invocations','articles','sins','daily_programs'] loop
    execute format('drop policy if exists "read_published" on public.%I', t);
    execute format($p$create policy "read_published" on public.%I for select to anon, authenticated
                   using (status = 'published' or public.is_staff())$p$, t);
    execute format('drop policy if exists "staff_insert" on public.%I', t);
    execute format($p$create policy "staff_insert" on public.%I for insert to authenticated
                   with check (public.has_role(array['admin','editor']::public.staff_role[]))$p$, t);
    execute format('drop policy if exists "staff_update" on public.%I', t);
    execute format($p$create policy "staff_update" on public.%I for update to authenticated
                   using (public.is_staff()) with check (public.is_staff())$p$, t);
    execute format('drop policy if exists "admin_delete" on public.%I', t);
    execute format($p$create policy "admin_delete" on public.%I for delete to authenticated
                   using (public.is_admin())$p$, t);
  end loop;
end $$;

drop policy if exists "notif_read" on public.notifications;
create policy "notif_read" on public.notifications for select to anon, authenticated
  using ((status = 'published' and scheduled_at <= now()) or public.is_staff());
drop policy if exists "notif_insert" on public.notifications;
create policy "notif_insert" on public.notifications for insert to authenticated
  with check (public.has_role(array['admin','editor']::public.staff_role[]));
drop policy if exists "notif_update" on public.notifications;
create policy "notif_update" on public.notifications for update to authenticated
  using (public.is_staff()) with check (public.is_staff());
drop policy if exists "notif_delete" on public.notifications;
create policy "notif_delete" on public.notifications for delete to authenticated
  using (public.is_admin());

-- Données personnelles : propriétaire uniquement (même les admins n'y ont pas accès)
drop policy if exists "progress_own" on public.user_progress;
create policy "progress_own" on public.user_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "reviews_own" on public.daily_reviews;
create policy "reviews_own" on public.daily_reviews for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "bookmarks_own" on public.bookmarks;
create policy "bookmarks_own" on public.bookmarks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Contact : tout le monde peut écrire, seuls les admins lisent/traitent
drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages for insert to anon, authenticated
  with check (traite = false and (user_id is null or user_id = (select auth.uid())));
drop policy if exists "contact_admin" on public.contact_messages;
create policy "contact_admin" on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists "contact_admin_upd" on public.contact_messages;
create policy "contact_admin_upd" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contact_admin_del" on public.contact_messages;
create policy "contact_admin_del" on public.contact_messages for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Fonctions publiques (RPC)
-- ---------------------------------------------------------------------
-- Statut de validation de chaque contenu (identifiant + statut seulement, aucune donnée privée)
create or replace function public.content_statuses()
returns table (kind text, id text, status public.content_status, validated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select 'article', slug, status, validated_at from public.articles
  union all select 'verset', id, status, validated_at from public.quran_verses
  union all select 'hadith', id, status, validated_at from public.hadiths
  union all select 'invocation', id, status, validated_at from public.invocations
  union all select 'programme', jour::text, status, validated_at from public.daily_programs
  union all select 'categorie', id, status, validated_at from public.categories;
$$;

-- Compteur de lectures (articles publiés uniquement)
create or replace function public.increment_article_view(p_slug text)
returns void language sql security definer set search_path = public as $$
  update public.articles set views = views + 1 where slug = p_slug and status = 'published';
$$;

-- Articles les plus consultés (publics)
create or replace function public.top_articles(p_limit int default 5)
returns table (slug text, views int)
language sql stable security definer set search_path = public as $$
  select slug, views from public.articles where status = 'published' and views > 0
  order by views desc limit least(greatest(p_limit, 1), 20);
$$;

-- Statistiques générales pour l'administration : uniquement des agrégats anonymes
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then
    raise exception 'Accès refusé';
  end if;
  return jsonb_build_object(
    'utilisateurs', (select count(*) from public.profiles),
    'nouveaux_7j', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'actifs_7j', (select count(distinct user_id) from public.user_progress where day > current_date - 7),
    'missions_validees', (select count(*) from public.user_progress where kind = 'programme'),
    'prieres_suivies', (select count(*) from public.user_progress where kind = 'prayer'),
    'bilans', (select count(*) from public.daily_reviews),
    'favoris', (select count(*) from public.bookmarks),
    'messages_non_traites', (select count(*) from public.contact_messages where not traite),
    'articles', (select jsonb_object_agg(status, n) from (select status, count(*) n from public.articles group by status) s),
    'hadiths', (select count(*) from public.hadiths),
    'versets', (select count(*) from public.quran_verses),
    'vues_totales', (select coalesce(sum(views), 0) from public.articles)
  );
end;
$$;

-- Suppression de compte par l'utilisateur lui-même (RGPD)
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.content_statuses() to anon, authenticated;
grant execute on function public.increment_article_view(text) to anon, authenticated;
grant execute on function public.top_articles(int) to anon, authenticated;
