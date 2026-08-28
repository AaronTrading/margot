'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  recipeCategoryLabels,
  type Recipe,
  type RecipeCategory,
} from '@/lib/recipes';

type RecipesGridProps = {
  recipes: Recipe[];
};

const filterOptions: Array<{ id: 'all' | RecipeCategory; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'petit-dejeuner', label: recipeCategoryLabels['petit-dejeuner'] },
  { id: 'dejeuner', label: recipeCategoryLabels.dejeuner },
  { id: 'diner', label: recipeCategoryLabels.diner },
  { id: 'collation', label: recipeCategoryLabels.collation },
];

export function RecipesGrid({ recipes }: RecipesGridProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | RecipeCategory>('all');

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'all') {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.category === activeFilter);
  }, [activeFilter, recipes]);

  return (
    <div className="recipes-layout">
      <div
        className="recipe-filters"
        role="tablist"
        aria-label="Filtrer les recettes"
      >
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`recipe-filter${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveFilter(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredRecipes.length === 0 ? (
        <p className="recipes-empty">
          Aucune recette publiée pour le moment. Revenez bientôt.
        </p>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map((recipe) => (
            <Link
              className="recipe-card"
              href={`/recettes/${recipe.slug ?? recipe.id}`}
              key={recipe.id}
            >
              <div className="recipe-card-media">
                <img src={recipe.image} alt={recipe.title} loading="lazy" />
                <span className="recipe-card-badge">
                  {recipeCategoryLabels[recipe.category]}
                </span>
              </div>
              <div className="recipe-card-body">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="recipe-card-meta">
                  <span>{recipe.prepTime}</span>
                  <span aria-hidden="true">·</span>
                  <span>{recipe.difficulty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
