import { Recipe } from '../models/recipe';

export const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Sadza & Beef Stew',
    description: 'A staple dish of thick cornmeal porridge served with tender beef stew and greens.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1000&auto=format&fit=crop', // Placeholder
    category: 'Dinner',
    tags: ['ZIMBABWEAN', 'Traditional'],
    time: '45 Mins',
    servings: 4,
    calories: '520 Kcal',
    isTraditional: true,
    rating: 4.8,
    ingredients: [
      {
        title: 'Beef Stew',
        data: [
          { name: 'Beef brisket', quantity: '500g', description: 'Cubed into bite-sized pieces' },
          { name: 'Onion', quantity: '1', description: 'Large, finely chopped' },
          { name: 'Tomatoes', quantity: '2', description: 'Ripe, diced' },
          { name: 'Kale (Covo)', quantity: '1 Bundle', description: 'Washed and chopped' },
          { name: 'Spices', quantity: '', description: 'Salt, Pepper, Paprika to taste' },
        ]
      },
      {
        title: 'Sadza (Pap)',
        data: [
          { name: 'Mealie-meal', quantity: '2 cups', description: 'White cornmeal (Upfu)' },
          { name: 'Water', quantity: '4 cups', description: 'Boiling' },
        ]
      }
    ],
    steps: [
      { instruction: 'In a large pot, brown the beef brisket pieces in oil until golden.' },
      { instruction: 'Add onions and sauté until soft. Add tomatoes and cook until they break down.' },
      { instruction: 'Add water/stock, cover, and simmer for 45 minutes until beef is tender.' },
      { instruction: 'Add the chopped kale and simmer for another 5 minutes.' },
      { instruction: 'For Sadza: Bring water to a boil. Whisk in half the mealie-meal to make a porridge.' },
      { instruction: 'Cover and cook for 15 mins. Gradually add remaining mealie-meal while stirring vigorously until thick.' },
    ]
  },
  {
    id: '2',
    title: 'Dovi (Peanut Butter Stew)',
    description: 'A rich and creamy peanut butter stew usually made with chicken or beef.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop',
    category: 'Stew',
    tags: ['TRENDING', 'Hearty'],
    time: '45 Mins',
    servings: 4,
    calories: '320 Kcal',
    isTraditional: true,
    rating: 4.9,
    ingredients: [
      {
        title: 'Stew',
        data: [
            { name: 'Chicken pieces', quantity: '1kg' },
            { name: 'Peanut Butter', quantity: '1 cup', description: 'Smooth' },
            { name: 'Greens', quantity: '1 bunch', description: 'Spinach or Covo' }
        ]
      }
    ],
    steps: [
        { instruction: 'Brown the chicken in a pot.' },
        { instruction: 'Add onions, garlic, and tomatoes.' },
        { instruction: 'Mix peanut butter with warm water and add to the pot.' },
        { instruction: 'Simmer until chicken is cooked and sauce is thick.' },
        { instruction: 'Add greens in the last 5 minutes.' }
    ]
  },
  {
    id: '3',
    title: 'Mopane Worms',
    description: 'A high-protein traditional delicacy, crunchy and savory.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0N-d2v6pM_iOqQZ0_xQ&s', // Placeholder
    category: 'High Protein',
    tags: ['Exotic', 'Protein'],
    time: '35 Mins',
    servings: 2,
    calories: '200 Kcal',
    isTraditional: true,
    ingredients: [
        { title: 'Main', data: [{ name: 'Mopane Worms', quantity: '2 cups', description: 'Dried' }] }
    ],
    steps: [{ instruction: 'Soak worms in hot water.' }, { instruction: 'Fry with onions and tomatoes.' }]
  },
  {
    id: '4',
    title: 'Nhopi (Pumpkin Mash)',
    description: 'Sweet pumpkin mash blended with peanut butter.',
    image: 'https://images.unsplash.com/photo-1506917728037-b6af011571e2?q=80&w=1000&auto=format&fit=crop',
    category: 'Vegetarian',
    tags: ['Vegetarian', 'Sweet'],
    time: '25 Mins',
    servings: 4,
    calories: '180 Kcal',
    isTraditional: true,
    ingredients: [],
    steps: []
  },
  {
    id: '5',
    title: 'Mutakura',
    description: 'A mixture of maize and peanuts/beans boiled together.',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?q=80&w=1000&auto=format&fit=crop',
    category: 'Traditional',
    tags: ['Grains', 'Filling'],
    time: '90 Mins',
    servings: 6,
    calories: '400 Kcal',
    isTraditional: true,
    ingredients: [],
    steps: []
  }
];

export const CATEGORIES = [
  { id: '1', name: 'Grains', subtitle: 'Zviyo', icon: 'grass' },
  { id: '2', name: 'Relishes', subtitle: 'Muriwo', icon: 'local-florist' },
  { id: '3', name: 'Meats', subtitle: 'Nyama', icon: 'restaurant' },
  { id: '4', name: 'Snacks', subtitle: 'Maheu', icon: 'cookie' },
];
