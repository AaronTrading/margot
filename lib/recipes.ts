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
  'id, title, description, category, prep_time, difficulty, image, content, created_at';

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
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('resources')
      .select(recipeSelect)
      .eq('type', 'recipe')
      .eq('id', id)
      .maybeSingle();

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
