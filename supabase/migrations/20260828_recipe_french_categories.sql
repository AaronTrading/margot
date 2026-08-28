-- Migrate recipe categories to French values and add "Difficile" difficulty.

update public.resources
set category = 'petit-dejeuner'
where category = 'breakfast';

update public.resources
set category = 'dejeuner'
where category = 'lunch';

update public.resources
set category = 'diner'
where category = 'dinner';

update public.resources
set category = 'collation'
where category = 'snack';

alter table public.resources drop constraint if exists resources_category_check;

alter table public.resources
  add constraint resources_category_check
  check (
    category is null
    or category in ('petit-dejeuner', 'dejeuner', 'diner', 'collation')
  );

alter table public.resources drop constraint if exists resources_difficulty_check;

alter table public.resources
  add constraint resources_difficulty_check
  check (
    difficulty is null
    or difficulty in ('Facile', 'Intermédiaire', 'Difficile')
  );
