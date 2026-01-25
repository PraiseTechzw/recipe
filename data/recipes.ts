import { Recipe } from '../models/recipe';

export const CATEGORIES = [
  { id: '1', name: 'Grains' },
  { id: '2', name: 'Relishes' },
  { id: '3', name: 'Meats' },
  { id: '4', name: 'Drinks' },
  { id: '5', name: 'Stews' },
  { id: '6', name: 'Vegetarian' },
];

export const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Sadza ne Nyama (Beef Stew)',
    description: 'Zimbabwe\'s staple dish: thick, smooth maize meal porridge (Sadza) served with a rich, tender beef stew and leafy greens.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1000&auto=format&fit=crop', 
    category: 'Dinner',
    tags: ['ZIMBABWEAN', 'Traditional', 'Staple'],
    time: '90 Mins',
    servings: 4,
    calories: '650 Kcal',
    isTraditional: true,
    rating: 4.9,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
      {
        title: 'Beef Stew',
        data: [
          { name: 'Beef stewing meat', quantity: '500g', description: 'Cut into bite-sized chunks' },
          { name: 'Cooking oil', quantity: '3 tbsp', description: 'Vegetable or Sunflower' },
          { name: 'Onion', quantity: '1 large', description: 'Finely chopped' },
          { name: 'Tomato', quantity: '2 medium', description: 'Diced' },
          { name: 'Mixed Veggies', quantity: '1 pack', description: 'Carrots, green beans, and peas (optional)' },
          { name: 'Beef Stock', quantity: '2 cups', description: 'Hot water mixed with beef stock cube' },
          { name: 'Garlic & Ginger', quantity: '1 tsp', description: 'minced' },
          { name: 'Salt & Pepper', quantity: 'To taste', description: '' },
          { name: 'Covo/Suza', quantity: '1 bunch', description: 'Washed and chopped (Optional)' }
        ]
      },
      {
        title: 'Sadza (Pap)',
        data: [
          { name: 'Mealie-meal', quantity: '2 cups', description: 'Refined white cornmeal' },
          { name: 'Water', quantity: '5 cups', description: 'Cold and boiling water' },
        ]
      }
    ],
    steps: [
      { instruction: 'Season beef with salt and pepper. In a large pot, heat oil and brown the beef pieces on high heat until golden.' },
      { instruction: 'Reduce heat, add chopped onions, garlic, and ginger. Sauté until onions are translucent.' },
      { instruction: 'Add tomatoes and mixed veggies. Cook for 5 minutes until tomatoes soften.' },
      { instruction: 'Add the hot beef stock, cover, and simmer on low heat for 45–60 minutes until meat is tender.' },
      { instruction: 'Optional: Add chopped Covo in the last 10 minutes and simmer.' },
      { instruction: 'For Sadza: Bring 4 cups of water to a boil in a separate pot. Reduce heat to medium.' },
      { instruction: 'Mix the remaining cup of water with 1 cup of mealie-meal to make a thin paste.' },
      { instruction: 'Pour the paste into the boiling water while stirring continuously. Cover and cook for 10 minutes.' },
      { instruction: 'Add the remaining mealie-meal, a little at a time, stirring vigorously with a wooden spoon (muwovi) to remove lumps.' },
      { instruction: 'Cook for another 15 minutes, stirring occasionally and pressing against the pot sides to ensure thorough cooking.' }
    ]
  },
  {
    id: '2',
    title: 'Dovi (Peanut Butter Stew)',
    description: 'A rich, creamy, and nutty stew made with peanut butter (dovi) and chicken or beef. A true Zimbabwean favorite.',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1000&auto=format&fit=crop',
    category: 'Stew',
    tags: ['TRENDING', 'Hearty', 'Creamy'],
    time: '60 Mins',
    servings: 4,
    calories: '580 Kcal',
    isTraditional: true,
    rating: 4.8,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
      {
        title: 'Stew Base',
        data: [
            { name: 'Chicken portions', quantity: '1kg', description: 'Mixed pieces (drumsticks, thighs)' },
            { name: 'Cooking Oil', quantity: '2 tbsp', description: '' },
            { name: 'Onions', quantity: '2 medium', description: 'Chopped' },
            { name: 'Tomatoes', quantity: '3 medium', description: 'Diced' },
            { name: 'Garlic', quantity: '1 clove', description: 'Crushed' },
            { name: 'Salt & Curry Powder', quantity: '1 tsp', description: 'To taste' }
        ]
      },
      {
        title: 'The Dovi Mix',
        data: [
            { name: 'Peanut Butter', quantity: '3/4 cup', description: 'Creamy or Chunky' },
            { name: 'Water', quantity: '1 cup', description: 'Warm' },
            { name: 'Spinach/Rape', quantity: '1 bunch', description: 'Optional' }
        ]
      }
    ],
    steps: [
        { instruction: 'Wash and season chicken with salt and curry powder.', description: 'For better flavor, let the chicken marinate for 20 minutes before cooking.' },
        { instruction: 'Brown the chicken pieces in a large pot with oil until golden brown on all sides.', tip: 'Do not overcrowd the pot; brown in batches if necessary.' },
        { instruction: 'Add onions and garlic to the pot. Sauté until fragrant and soft.' },
        { instruction: 'Add diced tomatoes and cook until they form a thick gravy.', description: 'You can add a splash of water to help the tomatoes break down faster.' },
        { instruction: 'Mix the peanut butter with warm water in a separate bowl to make a smooth paste.', highlightedWord: 'smooth paste', tip: 'Mixing with water first prevents the peanut butter from burning or becoming lumps in the pot.' },
        { instruction: 'Pour the peanut butter mixture into the pot with the chicken. Stir well.' },
        { instruction: 'Cover and simmer on low heat for 30 minutes, stirring occasionally to prevent sticking.', description: 'The stew is ready when the oil rises to the top and the sauce thickens.' },
        { instruction: 'Add the chopped spinach (if using) in the last 5 minutes.' },
        { instruction: 'Serve hot with Sadza or Rice.' }
    ]
  },
  {
    id: '3',
    title: 'Muriwo Une Dovi (Greens in Peanut Butter)',
    description: 'Fresh leafy greens (kale, pumpkin leaves, or covo) cooked in a savory peanut butter sauce.',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=1000&auto=format&fit=crop',
    category: 'Relishes',
    tags: ['Vegetarian', 'Healthy', 'Quick'],
    time: '25 Mins',
    servings: 4,
    calories: '180 Kcal',
    isTraditional: true,
    rating: 4.7,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Greens',
        data: [
            { name: 'Kale/Covo/Pumpkin Leaves', quantity: '1 large bunch', description: 'Washed and finely chopped' },
            { name: 'Water', quantity: '1/2 cup', description: 'For steaming' },
            { name: 'Salt', quantity: 'To taste', description: '' }
        ]
      },
      {
        title: 'Sauce',
        data: [
            { name: 'Peanut Butter', quantity: '3 tbsp', description: '' },
            { name: 'Tomato', quantity: '1 medium', description: 'Diced (Optional)' },
            { name: 'Onion', quantity: '1 small', description: 'Finely chopped' }
        ]
      }
    ],
    steps: [
        { instruction: 'In a pot, bring a little water to a boil and add the chopped greens.', tip: 'Do not add too much water; the greens release their own water.' },
        { instruction: 'Steam for 5–7 minutes until the greens are soft.' },
        { instruction: 'Add the onions and tomatoes on top of the greens (do not stir yet) and let them steam for another 2 minutes.' },
        { instruction: 'Add the peanut butter and salt. Lower the heat.' },
        { instruction: 'Simmer for 5 minutes to allow the peanut butter to melt and cook.' },
        { instruction: 'Stir everything together until the greens are coated in a creamy sauce.' },
        { instruction: 'Simmer for another 2 minutes and serve.' }
    ]
  },
  {
    id: '4',
    title: 'Maheu (Traditional Drink)',
    description: 'A refreshing and nutritious traditional drink made from leftover sadza (cornmeal porridge), fermented with millet malt (chimera).',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=1000&auto=format&fit=crop',
    category: 'Drinks',
    tags: ['Drink', 'Probiotic', 'Traditional'],
    time: '24 Hours',
    servings: 6,
    calories: '120 Kcal',
    isTraditional: true,
    rating: 4.6,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Base',
        data: [
            { name: 'Leftover Sadza', quantity: '2 cups', description: 'Or fresh thick porridge' },
            { name: 'Water', quantity: '1 liter', description: '' },
            { name: 'Sugar', quantity: '1/2 cup', description: 'To taste' }
        ]
      },
      {
        title: 'Fermentation',
        data: [
            { name: 'Millet Malt (Chimera)', quantity: '3 tbsp', description: 'Sorghum or Rapoko malt' },
            { name: 'Flour', quantity: '1 tbsp', description: 'Optional (if malt is unavailable)' }
        ]
      }
    ],
    steps: [
        { instruction: 'Break the sadza into small pieces and place it in a large container or clay pot.' },
        { instruction: 'Add water and mash the sadza until it forms a smooth, thin porridge.', tip: 'You can use a blender for a smoother consistency.' },
        { instruction: 'Add the millet malt (chimera) and stir well.', description: 'The malt acts as the fermentation agent.' },
        { instruction: 'Cover the container loosely with a cloth and place it in a warm spot.' },
        { instruction: 'Let it ferment for 24 to 48 hours, depending on how sour you want it.' },
        { instruction: 'Once fermented, stir in sugar to taste. Serve chilled.' }
    ]
  },
  {
    id: '5',
    title: 'Madora (Mopane Worms)',
    description: 'A crunchy, high-protein snack or relish. Fried mopane worms seasoned with spices.',
    image: 'https://pbs.twimg.com/media/F_z9q0aXIAAlXy_.jpg', 
    category: 'Relishes',
    tags: ['Exotic', 'High Protein', 'Snack'],
    time: '45 Mins',
    servings: 4,
    calories: '300 Kcal',
    isTraditional: true,
    rating: 4.5,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Main',
        data: [
            { name: 'Dried Mopane Worms', quantity: '2 cups', description: 'Soaked in hot water' },
            { name: 'Oil', quantity: '3 tbsp', description: 'For frying' },
            { name: 'Salt', quantity: '1 tsp', description: '' },
            { name: 'Paprika/Chili', quantity: '1 tsp', description: 'Optional' },
            { name: 'Onion', quantity: '1 small', description: 'Chopped' }
        ]
      }
    ],
    steps: [
        { instruction: 'Soak the dried mopane worms in hot water for 20 minutes to rehydrate.', description: 'Drain and rinse them thoroughly.' },
        { instruction: 'Place them in a pot with a cup of water and boil for 20 minutes until the water evaporates.' },
        { instruction: 'Add oil to the pot and fry the worms on medium heat.' },
        { instruction: 'Add onions and spices (salt, paprika). Fry until the onions are soft and the worms are crispy.' },
        { instruction: 'Serve as a snack or with Sadza.' }
    ]
  },
  {
    id: '6',
    title: 'Mhunga (Millet Sadza)',
    description: 'A darker, nuttier variation of Sadza made from pearl millet flour. Highly nutritious.',
    image: 'https://images.unsplash.com/photo-1606756623098-50854c8680e6?q=80&w=1000&auto=format&fit=crop',
    category: 'Dinner',
    tags: ['Healthy', 'Gluten-Free', 'Traditional'],
    time: '30 Mins',
    servings: 4,
    calories: '400 Kcal',
    isTraditional: true,
    rating: 4.7,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Ingredients',
        data: [
            { name: 'Millet Flour (Upfu hweMhunga)', quantity: '2 cups', description: '' },
            { name: 'Water', quantity: '4 cups', description: 'Boiling' }
        ]
      }
    ],
    steps: [
        { instruction: 'Bring water to a boil in a pot.' },
        { instruction: 'Mix 1/2 cup of millet flour with cold water to make a paste.' },
        { instruction: 'Stir the paste into the boiling water to make a porridge. Cook for 10 minutes.' },
        { instruction: 'Gradually add the remaining flour while stirring vigorously to prevent lumps.' },
        { instruction: 'Cover and steam on low heat for 10 minutes.' },
        { instruction: 'Stir again and serve hot with your favorite relish.' }
    ]
  },
  {
    id: '7',
    title: 'Boiled Sweet Potatoes (Mbambaira)',
    description: 'Simple, sweet, and filling. Often eaten for breakfast or tea time.',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63b8448f6?q=80&w=1000&auto=format&fit=crop',
    category: 'Snacks',
    tags: ['Breakfast', 'Vegan', 'Simple'],
    time: '25 Mins',
    servings: 4,
    calories: '250 Kcal',
    isTraditional: true,
    rating: 4.8,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Ingredients',
        data: [
          { name: 'Sweet Potatoes', quantity: '1kg', description: 'Peeled or washed' },
          { name: 'Water', quantity: '3 cups', description: 'For boiling' },
          { name: 'Salt', quantity: '1 pinch', description: 'Optional' }
        ]
      }
    ],
    steps: [
      { instruction: 'Wash the sweet potatoes thoroughly. You can peel them or boil with the skin on.' },
      { instruction: 'Cut large potatoes into large chunks for even cooking.' },
      { instruction: 'Place the potatoes in a pot and add enough water to just cover them.' },
      { instruction: 'Add a pinch of salt (optional).' },
      { instruction: 'Bring to a boil, then reduce heat and cover. Simmer for 20-25 minutes.' },
      { instruction: 'Check tenderness with a fork. They should be soft but not mushy.' },
      { instruction: 'Drain water and serve hot or warm.' }
    ]
  }
];
