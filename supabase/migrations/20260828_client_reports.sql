-- Add long client reports saved from the private admin panel.

alter table public.clients
  add column if not exists report text;

update public.resources
set difficulty = 'Facile'
where lower(difficulty) = 'easy';

update public.resources
set difficulty = 'Intermédiaire'
where lower(difficulty) in ('medium', 'intermediate', 'intermediaire');

update public.resources
set difficulty = 'Difficile'
where lower(difficulty) = 'hard';
