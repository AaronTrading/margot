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

const legacyDifficultyMap: Record<string, RecipeDifficulty> = {
  easy: 'Facile',
  facile: 'Facile',
  Facile: 'Facile',
  medium: 'Intermédiaire',
  intermediate: 'Intermédiaire',
  intermediaire: 'Intermédiaire',
  'intermédiaire': 'Intermédiaire',
  Intermédiaire: 'Intermédiaire',
  hard: 'Difficile',
  difficile: 'Difficile',
  Difficile: 'Difficile',
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

export function normalizeRecipeDifficulty(
  difficulty: string | null | undefined,
): RecipeDifficulty {
  if (!difficulty) {
    return 'Facile';
  }

  return legacyDifficultyMap[difficulty] ?? 'Facile';
}

export function getRecipeDifficultyLabel(
  difficulty: string | null | undefined,
) {
  return normalizeRecipeDifficulty(difficulty);
}

function normalizeText(value: unknown) {
  const normalized = normalizeEmpty(value);

  return typeof normalized === 'string' ? normalized : null;
}

function normalizeResourceType(value: unknown): ResourceType {
  const type = normalizeText(value);

  if (
    type === 'advice' ||
    type === 'recipe' ||
    type === 'shopping' ||
    type === 'other'
  ) {
    return type;
  }

  return 'other';
}

export function resourcePayload(body: Record<string, unknown>) {
  const type = normalizeResourceType(body.type);

  return {
    category:
      type === 'recipe'
        ? normalizeRecipeCategory(normalizeText(body.category))
        : null,
    content: normalizeText(body.content),
    description: type === 'recipe' ? normalizeText(body.description) : null,
    difficulty:
      type === 'recipe'
        ? normalizeRecipeDifficulty(normalizeText(body.difficulty))
        : null,
    image: type === 'recipe' ? normalizeText(body.image) : null,
    note: normalizeText(body.note),
    prep_time: type === 'recipe' ? normalizeText(body.prep_time) : null,
    title: normalizeText(body.title),
    type,
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
    difficulty: normalizeRecipeDifficulty(resource.difficulty),
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
