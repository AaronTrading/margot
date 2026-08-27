'use client';

import { useMemo, useState } from 'react';
import {
  recipeCategoryLabels,
  recipes,
  type RecipeCategory,
} from '@/lib/recipes';

const filterOptions: Array<{ id: 'all' | RecipeCategory; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'breakfast', label: recipeCategoryLabels.breakfast },
  { id: 'lunch', label: recipeCategoryLabels.lunch },
  { id: 'dinner', label: recipeCategoryLabels.dinner },
  { id: 'snack', label: recipeCategoryLabels.snack },
];

export function RecipesGrid() {
  const [activeFilter, setActiveFilter] = useState<'all' | RecipeCategory>('all');

  const filteredRecipes = useMemo(() => {
    if (activeFilter === 'all') {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.category === activeFilter);
  }, [activeFilter]);

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

      <div className="recipes-grid">
        {filteredRecipes.map((recipe) => (
          <article className="recipe-card" key={recipe.id}>
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
          </article>
        ))}
      </div>
    </div>
  );
}
