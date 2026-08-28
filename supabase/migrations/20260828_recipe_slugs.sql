-- Add editable public URLs for recipes.

alter table public.resources
  add column if not exists slug text;

with recipe_slug_base as (
  select
    id,
    nullif(
      trim(
        both '-' from regexp_replace(
          lower(
            translate(
              title,
              'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝŸàáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
              'AAAAAACEEEEIIIINOOOOOUUUUYYaaaaaaceeeeiiiinooooouuuuyy'
            )
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        )
      ),
      ''
    ) as base_slug
  from public.resources
  where type = 'recipe'
    and slug is null
),
recipe_slug_ranked as (
  select
    id,
    coalesce(base_slug, 'recette-' || left(id::text, 8)) as base_slug,
    row_number() over (
      partition by coalesce(base_slug, 'recette-' || left(id::text, 8))
      order by id
    ) as duplicate_rank
  from recipe_slug_base
)
update public.resources
set slug = case
  when recipe_slug_ranked.duplicate_rank = 1 then recipe_slug_ranked.base_slug
  else recipe_slug_ranked.base_slug || '-' || recipe_slug_ranked.duplicate_rank
end
from recipe_slug_ranked
where public.resources.id = recipe_slug_ranked.id;

alter table public.resources drop constraint if exists resources_slug_format_check;

alter table public.resources
  add constraint resources_slug_format_check
  check (
    slug is null
    or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  );

create unique index if not exists resources_recipe_slug_unique
on public.resources(slug)
where type = 'recipe' and slug is not null;
