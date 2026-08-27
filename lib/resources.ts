import { normalizeEmpty } from '@/lib/supabaseAdmin';

export type ResourceType = 'advice' | 'recipe' | 'shopping' | 'other';
export type RecipeCategory =
  | 'petit-dejeuner'
  | 'dejeuner'
  | 'diner'
  | 'collation';
export type RecipeDifficulty = 'Facile' | 'Intermédiaire' | 'Difficile';

export type RecipeResourceRow = {
  category: string | null;
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
  instructions: string;
  category: RecipeCategory;
  prepTime: string;
  difficulty: RecipeDifficulty;
  image: string;
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  advice: 'Fiche conseil',
  recipe: 'Recette',
  shopping: 'Liste de courses',
  other: 'Autre',
};

export const recipeCategoryLabels: Record<RecipeCategory, string> = {
  'petit-dejeuner': 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  diner: 'Dîner',
  collation: 'Collation',
};

const legacyCategoryMap: Record<string, RecipeCategory> = {
  breakfast: 'petit-dejeuner',
  lunch: 'dejeuner',
  dinner: 'diner',
  snack: 'collation',
  'petit-dejeuner': 'petit-dejeuner',
  dejeuner: 'dejeuner',
  diner: 'diner',
  collation: 'collation',
};

export const DEFAULT_RECIPE_IMAGE =
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=82';

export function normalizeRecipeCategory(
  category: string | null | undefined,
): RecipeCategory {
  if (!category) {
    return 'dejeuner';
  }

  return legacyCategoryMap[category] ?? 'dejeuner';
}

export function getRecipeCategoryLabel(category: string | null | undefined) {
  return recipeCategoryLabels[normalizeRecipeCategory(category)];
}

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
    description: resource.description?.trim() || 'Recette à découvrir.',
    instructions: resource.content?.trim() || '',
    category: normalizeRecipeCategory(resource.category),
    prepTime: resource.prep_time?.trim() || '—',
    difficulty: resource.difficulty ?? 'Facile',
    image: resource.image?.trim() || DEFAULT_RECIPE_IMAGE,
  };
}

export function parseRecipeInstructions(content: string): string[] {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^(\d+[\.\)]\s*|[-•*]\s*)/, '').trim())
    .filter(Boolean);
}
