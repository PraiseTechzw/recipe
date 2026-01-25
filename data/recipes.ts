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
        { 
          instruction: 'Brown the chicken pieces in a large pot with oil until golden brown.',
          description: 'Searing the chicken seals in the juices and adds flavor to the stew.',
          image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop'
        },
        { 
          instruction: 'Add onions, garlic, and tomatoes to the pot.',
          description: 'Sauté the vegetables until the onions are soft and the tomatoes have broken down into a paste.',
          tip: 'Add a pinch of salt to help the onions sweat and release their moisture faster.'
        },
        { 
           instruction: 'Stir in the peanut butter until the sauce thickens',
           highlightedWord: 'thickens',
           description: 'Ensure the peanut butter is fully incorporated into the broth to create a smooth, creamy base.',
           tip: 'Use smooth peanut butter for a velvety texture, or crunchy if you prefer a bit of texture in your Dovi.',
           image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop'
         },
        { 
          instruction: 'Simmer gently until the chicken is fully cooked.',
          description: 'Let the stew bubble on low heat. The sauce should coat the back of a spoon.',
          image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1000&auto=format&fit=crop'
        },
        { 
          instruction: 'Add the greens in the last 5 minutes of cooking.',
          description: 'This ensures the greens remain vibrant and retain their nutrients.',
          tip: 'Do not overcook the greens; they should be just wilted.'
        }
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
  { id: '4', name: 'Drinks', subtitle: 'Zvinwiwa', icon: 'local-bar' },
];
