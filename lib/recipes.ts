import {
  mapResourceToRecipe,
  type Recipe,
  type RecipeResourceRow,
} from '@/lib/resources';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type { Recipe, RecipeCategory, RecipeDifficulty } from '@/lib/resources';
export { recipeCategoryLabels } from '@/lib/resources';

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('resources')
      .select(
        'id, title, description, category, prep_time, difficulty, image, content, created_at',
      )
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
