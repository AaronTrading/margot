import {
  mapResourceToRecipe,
  type Recipe,
  type RecipeResourceRow,
} from '@/lib/resources';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type { Recipe, RecipeCategory, RecipeDifficulty } from '@/lib/resources';
export {
  getRecipeCategoryLabel,
  parseRecipeInstructions,
  recipeCategoryLabels,
  resourceTypeLabels,
} from '@/lib/resources';

const recipeSelect =
  'id, slug, title, description, category, prep_time, difficulty, image, content, created_at';

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('resources')
      .select(recipeSelect)
      .eq('type', 'recipe')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[recipes]', error);
      return [];
    }

    return ((data ?? []) as RecipeResourceRow[]).map(mapResourceToRecipe);
  } catch (error) {
    console.error('[recipes]', error);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    );

  try {
    let query = getSupabaseAdmin()
      .from('resources')
      .select(recipeSelect)
      .eq('type', 'recipe')
      .limit(1);

    query = isUuid ? query.eq('id', id) : query.eq('slug', id);

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('[recipes]', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return mapResourceToRecipe(data as RecipeResourceRow);
  } catch (error) {
    console.error('[recipes]', error);
    return null;
  }
}
