export type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  prepTime: string;
  difficulty: 'Facile' | 'Intermédiaire';
  image: string;
};

export const recipeCategoryLabels: Record<RecipeCategory, string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
  snack: 'Collation',
};

export const recipes: Recipe[] = [
  {
    id: 'bowl-yaourt-granola',
    title: 'Bowl yaourt et granola maison',
    description:
      'Un petit-déjeuner équilibré, riche en protéines et en fibres pour tenir jusqu’au déjeuner.',
    category: 'breakfast',
    prepTime: '10 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1511690743698-d9d85f65fbe8?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'pancakes-avoine-banane',
    title: 'Pancakes avoine et banane',
    description:
      'Une version gourmande sans sucre ajouté, parfaite pour un brunch du week-end.',
    category: 'breakfast',
    prepTime: '15 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'salade-quinoa-avocat',
    title: 'Salade quinoa, avocat et légumes croquants',
    description:
      'Un déjeuner complet, coloré et facile à emporter au bureau.',
    category: 'lunch',
    prepTime: '20 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'soupe-lentilles-corail',
    title: 'Soupe de lentilles corail au cumin',
    description:
      'Réconfortante et rassasiante, idéale pour les soirs pressés.',
    category: 'lunch',
    prepTime: '25 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'poulet-citron-courgettes',
    title: 'Poulet citron et courgettes rôties',
    description:
      'Un dîner léger, riche en protéines et en légumes de saison.',
    category: 'dinner',
    prepTime: '35 min',
    difficulty: 'Intermédiaire',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'saumon-papillote',
    title: 'Saumon en papillote et légumes verts',
    description:
      'Une cuisson douce qui préserve les nutriments et les saveurs.',
    category: 'dinner',
    prepTime: '30 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'energy-balls-dattes',
    title: 'Energy balls dattes et cacao',
    description:
      'Une collation pratique avant ou après le sport, sans cuisson.',
    category: 'snack',
    prepTime: '12 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'houmous-maison',
    title: 'Houmous maison et bâtonnets de légumes',
    description:
      'Une collation savoureuse pour grignoter sans culpabiliser.',
    category: 'snack',
    prepTime: '15 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1571068316347-75bc76f77890?auto=format&fit=crop&w=900&q=82',
  },
  {
    id: 'omelette-aux-herbes',
    title: 'Omelette aux herbes fraîches',
    description:
      'Rapide, protéinée et adaptable selon ce que vous avez au frigo.',
    category: 'breakfast',
    prepTime: '8 min',
    difficulty: 'Facile',
    image:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=82',
  },
];
