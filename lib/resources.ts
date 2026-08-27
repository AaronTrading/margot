import { normalizeEmpty } from '@/lib/supabaseAdmin';

export type ResourceType = 'advice' | 'recipe' | 'shopping' | 'other';
export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type RecipeDifficulty = 'Facile' | 'Intermédiaire';

export type RecipeResourceRow = {
  category: RecipeCategory | null;
  content: string | null;
  created_at: string;
  description: string | null;
  difficulty: RecipeDifficulty | null;
  id: string;
  image: string | null;
  note: string | null;
  prep_time: string | null;
  title: string;
  type: ResourceType;
  updated_at: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  prepTime: string;
  difficulty: RecipeDifficulty;
  image: string;
};

export const recipeCategoryLabels: Record<RecipeCategory, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

export const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82';

export function resourcePayload(body: Record<string, unknown>) {
  return {
    category: normalizeEmpty(body.category),
    content: normalizeEmpty(body.content),
    description: normalizeEmpty(body.description),
    difficulty: normalizeEmpty(body.difficulty),
    image: normalizeEmpty(body.image),
    note: normalizeEmpty(body.note),
    prep_time: normalizeEmpty(body.prep_time),
    title: normalizeEmpty(body.title),
    type: normalizeEmpty(body.type) ?? 'other',
  };
}

export function mapResourceToRecipe(resource: RecipeResourceRow): Recipe {
  return {
    id: resource.id,
    title: resource.title,
    description:
      resource.description?.trim() ||
      resource.content?.trim() ||
      'Recette à découvrir.',
    category: resource.category ?? 'lunch',
    prepTime: resource.prep_time?.trim() || '—',
    difficulty: resource.difficulty ?? 'Facile',
    image: resource.image?.trim() || DEFAULT_RECIPE_IMAGE,
  };
}
