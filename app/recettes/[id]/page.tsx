import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import {
  getRecipeById,
  parseRecipeInstructions,
  recipeCategoryLabels,
} from '@/lib/recipes';

type RecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    return {
      title: 'Recette introuvable - Margot Atlani',
    };
  }

  return {
    title: `${recipe.title} - Margot Atlani`,
    description: recipe.description,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const steps = parseRecipeInstructions(recipe.instructions);

  return (
    <main>
      <SiteHeader active="recettes" />

      <section className="recipe-detail-hero">
        <div className="recipe-detail-media">
          <img src={recipe.image} alt={recipe.title} />
        </div>
        <div className="recipe-detail-intro">
          <p className="eyebrow">{recipeCategoryLabels[recipe.category]}</p>
          <h1>{recipe.title}</h1>
          <p className="lead">{recipe.description}</p>
          <div className="recipe-detail-meta">
            <span>{recipe.prepTime}</span>
            <span aria-hidden="true">·</span>
            <span>{recipe.difficulty}</span>
          </div>
          <Link className="secondary-button" href="/recettes">
            Retour aux recettes
          </Link>
        </div>
      </section>

      <section className="recipe-detail-instructions">
        <p className="eyebrow">Préparation</p>
        <h2>Les étapes de la recette</h2>
        {steps.length > 0 ? (
          <ol className="recipe-steps">
            {steps.map((step, index) => (
              <li key={`${index}-${step}`}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="recipe-instructions-empty">
            Les instructions de cette recette seront bientôt disponibles.
          </p>
        )}
      </section>
    </main>
  );
}
