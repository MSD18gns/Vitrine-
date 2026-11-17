-- À exécuter UNIQUEMENT si la base a été installée avant l'ajout du parcours
-- interactif : autorise l'enregistrement des étapes (kind = 'lesson').
alter table public.ad_user_progress drop constraint if exists ad_user_progress_kind_check;
alter table public.ad_user_progress add constraint ad_user_progress_kind_check
  check (kind in ('programme', 'prayer', 'dhikr', 'goal', 'lesson'));
