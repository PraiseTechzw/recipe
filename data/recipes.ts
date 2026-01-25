import { Recipe } from '../models/recipe';

export const RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Sadza ne Nyama (Beef Stew)',
    description: 'Zimbabwe\'s staple dish: thick, smooth maize meal porridge (Sadza) served with a rich, tender beef stew and leafy greens.',
    image: 'https://www.zimbokitchen.com/wp-content/uploads/2012/12/Traditional-Zimbabwe-Beef-Stew_900pix_noseal.jpg', 
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
    image: 'https://aarven.com/cdn/shop/articles/609594e4e6dd6db5dcf51a295fdc1e74.jpg?v=1686259694',
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
        { instruction: 'Add chopped greens (Spinach/Rape) in the last 5 minutes. Serve hot with Sadza.' }
    ]
  },
  {
    id: '3',
    title: 'Madora/Macimbi (Mopane Worms)',
    description: 'A high-protein traditional delicacy, crispy-fried with tomatoes and onions. A distinct savory taste of Zimbabwe.',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop',
    category: 'High Protein',
    tags: ['Exotic', 'Protein', 'Traditional'],
    time: '40 Mins',
    servings: 3,
    calories: '280 Kcal',
    isTraditional: true,
    rating: 4.5,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
        { 
            title: 'Main Ingredients', 
            data: [
                { name: 'Dried Mopane Worms', quantity: '300g', description: 'Preserved' },
                { name: 'Cooking Oil', quantity: '3 tbsp', description: 'For frying' },
                { name: 'Onion', quantity: '1 large', description: 'Chopped' },
                { name: 'Tomato', quantity: '2 medium', description: 'Diced' },
                { name: 'Chillies', quantity: '1', description: 'Optional, for heat' },
                { name: 'Salt', quantity: '1 tsp', description: 'To taste' }
            ] 
        }
    ],
    steps: [
        { instruction: 'Rinse the dried mopane worms thoroughly in warm water to remove any dust or grit.' },
        { instruction: 'Place worms in a pot, cover with water, and boil for 15–20 minutes until tender. Drain.' },
        { instruction: 'Heat oil in a frying pan. Add chopped onions and sauté until golden brown.' },
        { instruction: 'Add the boiled mopane worms to the pan and fry for 5 minutes until slightly crispy.' },
        { instruction: 'Add tomatoes and chillies. Cook for another 5 minutes until tomatoes are soft.' },
        { instruction: 'Season with salt to taste. Serve as a snack or with Sadza.' }
    ]
  },
  {
    id: '4',
    title: 'Nhopi (Pumpkin Mash)',
    description: 'A sweet and savory dessert-like side dish made from mashed pumpkin and peanut butter.',
    image: 'https://images.unsplash.com/photo-1506917728037-b6af011571e2?q=80&w=1000&auto=format&fit=crop',
    category: 'Vegetarian',
    tags: ['Vegetarian', 'Sweet', 'Dessert'],
    time: '30 Mins',
    servings: 4,
    calories: '220 Kcal',
    isTraditional: true,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
      {
        title: 'Mash',
        data: [
          { name: 'Pumpkin/Butternut', quantity: '1kg', description: 'Peeled and cubed' },
          { name: 'Peanut Butter', quantity: '2 tbsp', description: 'Creamy' },
          { name: 'Sugar', quantity: '1 tbsp', description: 'Optional (adjust to taste)' },
          { name: 'Salt', quantity: '1 pinch', description: 'Enhances sweetness' },
          { name: 'Water/Milk', quantity: '1/4 cup', description: 'To adjust consistency' }
        ]
      }
    ],
    steps: [
      { instruction: 'Peel the pumpkin or butternut and cut it into large cubes.' },
      { instruction: 'Place the pumpkin in a pot, add enough water to cover the bottom, and boil until soft (approx 20 mins).' },
      { instruction: 'Drain excess water (if any) and mash the pumpkin thoroughly with a masher or fork.' },
      { instruction: 'Place the pot back on low heat. Add the peanut butter and sugar (if using).' },
      { instruction: 'Stir continuously until the peanut butter is fully melted and incorporated.' },
      { instruction: 'Add a splash of milk or water if it is too thick. Serve warm as a side dish or dessert.' }
    ]
  },
  {
    id: '5',
    title: 'Mutakura (Mixed Grain & Bean Stew)',
    description: 'A nutritious and filling mix of popped maize, beans, and groundnuts (peanuts).',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop',
    category: 'Grains',
    tags: ['Grains', 'Filling', 'Vegan'],
    time: '120 Mins',
    servings: 6,
    calories: '420 Kcal',
    isTraditional: true,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
      {
        title: 'Ingredients',
        data: [
          { name: 'Mapopo (Dried Maize)', quantity: '1 cup', description: 'Or Hominy corn/Samp' },
          { name: 'Nyemba (Sugar Beans)', quantity: '1 cup', description: 'Dried' },
          { name: 'Nzungu (Groundnuts)', quantity: '1/2 cup', description: 'Raw peanuts, shelled' },
          { name: 'Salt', quantity: '1 tsp', description: 'To taste' },
          { name: 'Water', quantity: '6 cups', description: 'For boiling' }
        ]
      }
    ],
    steps: [
      { instruction: 'Soak the dried maize, beans, and groundnuts separately in cold water overnight (or for at least 8 hours).' },
      { instruction: 'Rinse the soaked ingredients thoroughly.' },
      { instruction: 'Combine the maize, beans, and groundnuts in a large pot.' },
      { instruction: 'Add enough water to cover the ingredients by about 2 inches.' },
      { instruction: 'Bring to a boil, then reduce heat to low and cover. Simmer for 1.5 to 2 hours.' },
      { instruction: 'Check water levels periodically and top up with hot water if necessary to prevent burning.' },
      { instruction: 'Cook until the maize and beans are soft and tender.' },
      { instruction: 'Add salt to taste and simmer for a further 5 minutes. Serve while hot.' }
    ]
  },
  {
    id: '6',
    title: 'Mahewu (Traditional Fermented Drink)',
    description: 'A thick, sour, and non-alcoholic fermented beverage made from maize or sorghum meal.',
    image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?q=80&w=1000&auto=format&fit=crop',
    category: 'Drinks',
    tags: ['Drinks', 'Fermented', 'Traditional'],
    time: '48 Hrs',
    servings: 8,
    calories: '160 Kcal',
    isTraditional: true,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png', // Placeholder or use a real logo
    },
    ingredients: [
        { 
            title: 'Ingredients', 
            data: [
                { name: 'Mealie-meal (White)', quantity: '1 cup', description: 'Cornmeal' },
                { name: 'Water', quantity: '8 cups', description: 'Divided usage' },
                { name: 'Malt (Ruwori)', quantity: '1/2 cup', description: 'Sorghum or Barley malt flour' },
                { name: 'Sugar', quantity: '1/2 cup', description: 'Optional (to taste)' }
            ] 
        }
    ],
    steps: [
        { instruction: 'Mix 1 cup of mealie-meal with 1 cup of cold water to form a smooth paste, ensuring no lumps.' },
        { instruction: 'Bring the remaining 7 cups of water to a boil in a large pot.' },
        { instruction: 'Slowly pour the mealie-meal paste into the boiling water while stirring continuously.' },
        { instruction: 'Simmer on low heat for about 20 minutes, stirring often to prevent sticking, until it forms a thin porridge.' },
        { instruction: 'Remove the porridge from the heat and allow it to cool completely to room temperature (very important).' },
        { instruction: 'Once cool, sprinkle the malt flour over the porridge and stir well.' },
        { instruction: 'Cover the pot with a lid or cloth and leave in a warm place for 24 to 36 hours to ferment.' },
        { instruction: 'The mixture is ready when it tastes sour and has separated slightly. Stir, add sugar if desired, and serve chilled.' }
    ]
  },
  {
    id: '7',
    title: 'Bota (Breakfast Porridge)',
    description: 'A smooth and filling breakfast porridge made from mealie-meal, traditionally enjoyed with milk and peanut butter.',
    image: 'https://images.unsplash.com/photo-1530264980576-3a2a2a387433?q=80&w=1000&auto=format&fit=crop',
    category: 'Breakfast',
    tags: ['Breakfast', 'Porridge', 'Vegetarian'],
    time: '20 Mins',
    servings: 2,
    calories: '300 Kcal',
    isTraditional: true,
    rating: 4.2,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Porridge',
        data: [
          { name: 'Mealie-meal', quantity: '1/2 cup', description: 'White or Brown cornmeal' },
          { name: 'Water', quantity: '2 cups', description: 'Boiling' },
          { name: 'Milk', quantity: '1/2 cup', description: 'Fresh or Long life' },
          { name: 'Sugar', quantity: '2 tbsp', description: 'Optional' },
          { name: 'Peanut Butter', quantity: '1 tbsp', description: 'Optional' }
        ]
      }
    ],
    steps: [
      { instruction: 'Bring water to a boil in a small saucepan.' },
      { instruction: 'Mix the mealie-meal with a little cold water to make a thin paste.' },
      { instruction: 'Pour the paste into the boiling water while stirring continuously.' },
      { instruction: 'Cook for 10-15 minutes, stirring occasionally until smooth and thick.' },
      { instruction: 'Remove from heat. Stir in milk and sugar to taste.' },
      { instruction: 'Top with a dollop of peanut butter for a traditional twist. Serve warm.' }
    ]
  },
  {
    id: '8',
    title: 'Muriwo we Covo (Collard Greens)',
    description: 'Savory collard greens cooked with tomatoes and onions, often softened with baking soda for a unique texture.',
    image: 'https://images.unsplash.com/photo-1534938665420-4193effeacc4?q=80&w=1000&auto=format&fit=crop',
    category: 'Vegetarian',
    tags: ['Vegetarian', 'Side Dish', 'Greens'],
    time: '25 Mins',
    servings: 4,
    calories: '110 Kcal',
    isTraditional: true,
    rating: 4.6,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Greens',
        data: [
          { name: 'Covo (Collards)', quantity: '1 large bunch', description: 'Washed and chopped' },
          { name: 'Baking Soda', quantity: '1/2 tsp', description: 'Crucial for tenderness' },
          { name: 'Water', quantity: '1 cup', description: 'For boiling' },
          { name: 'Cooking Oil', quantity: '2 tbsp', description: '' },
          { name: 'Onion', quantity: '1 medium', description: 'Chopped' },
          { name: 'Tomato', quantity: '1 large', description: 'Diced' },
          { name: 'Salt', quantity: 'To taste', description: '' }
        ]
      }
    ],
    steps: [
      { instruction: 'Place the chopped Covo in a pot with 1 cup of water. Add the baking soda.' },
      { instruction: 'Bring to a boil and cook for 10 minutes until the leaves are very soft. Drain all water.' },
      { instruction: 'In a frying pan, heat oil and sauté the onions until translucent.' },
      { instruction: 'Add the tomatoes and cook until they form a soft mixture.' },
      { instruction: 'Add the boiled Covo to the pan. Mix well and simmer for 5 minutes.' },
      { instruction: 'Season with salt and serve as an accompaniment to Sadza.' }
    ]
  },
  {
    id: '9',
    title: 'Kapenta (Stewed Sardines)',
    description: 'Tiny dried sardines (Kapenta) stewed in a rich tomato and onion sauce. A crunchy and tangy delight.',
    image: 'https://images.unsplash.com/photo-1544025162-d76690b67f13?q=80&w=1000&auto=format&fit=crop',
    category: 'Stew',
    tags: ['Seafood', 'Stew', 'High Protein'],
    time: '30 Mins',
    servings: 3,
    calories: '350 Kcal',
    isTraditional: true,
    rating: 4.7,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Kapenta Stew',
        data: [
          { name: 'Dried Kapenta', quantity: '400g', description: 'Rinsed' },
          { name: 'Onions', quantity: '2 medium', description: 'Chopped' },
          { name: 'Tomatoes', quantity: '3 medium', description: 'Diced' },
          { name: 'Green Peppers', quantity: '1', description: 'Chopped (Optional)' },
          { name: 'Garlic', quantity: '1 tsp', description: 'Minced' },
          { name: 'Tomato Sauce', quantity: '1 tbsp', description: 'For color' },
          { name: 'Oil', quantity: '3 tbsp', description: '' },
          { name: 'Salt', quantity: 'To taste', description: '' }
        ]
      }
    ],
    steps: [
      { instruction: 'Rinse the dried Kapenta thoroughly in cold water and drain.' },
      { instruction: 'Heat oil in a pan and fry the onions and garlic until golden.' },
      { instruction: 'Add the Kapenta to the pan and fry gently for 5 minutes to crisp them slightly.' },
      { instruction: 'Add tomatoes, green pepper, and tomato sauce. Stir well.' },
      { instruction: 'Add a splash of water (about 1/4 cup), reduce heat, and simmer for 10 minutes.' },
      { instruction: 'Season with salt to taste. Serve with Sadza.' }
    ]
  },
  {
    id: '10',
    title: 'Chimodho (Savory Corn Bread)',
    description: 'A dense, savory corn bread that is a popular snack, eaten on the go or at home.',
    image: 'https://images.unsplash.com/photo-1589377838438-492406227f90?q=80&w=1000&auto=format&fit=crop',
    category: 'Snack',
    tags: ['Snack', 'Baking', 'Vegetarian'],
    time: '60 Mins',
    servings: 8,
    calories: '280 Kcal',
    isTraditional: true,
    rating: 4.3,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Bread Mix',
        data: [
          { name: 'Mealie-meal', quantity: '2 cups', description: 'Fine cornmeal' },
          { name: 'Flour', quantity: '1 cup', description: 'Self-raising' },
          { name: 'Sugar', quantity: '1 tbsp', description: 'Optional' },
          { name: 'Salt', quantity: '1 tsp', description: '' },
          { name: 'Margarine', quantity: '100g', description: 'Melted' },
          { name: 'Milk', quantity: '1.5 cups', description: 'Warmed' },
          { name: 'Baking Powder', quantity: '1 tsp', description: '' }
        ]
      }
    ],
    steps: [
      { instruction: 'Preheat oven to 180°C (350°F). Grease a baking loaf tin.' },
      { instruction: 'In a large bowl, mix mealie-meal, flour, sugar, salt, and baking powder.' },
      { instruction: 'Make a well in the center and pour in the melted margarine and warm milk.' },
      { instruction: 'Mix thoroughly to form a thick batter.' },
      { instruction: 'Pour the batter into the greased tin and smooth the top.' },
      { instruction: 'Bake for 45–50 minutes until golden brown and a skewer comes out clean.' },
      { instruction: 'Allow to cool slightly before slicing.' }
    ]
  },
  {
    id: '11',
    title: 'Roasted Roadrunner Chicken',
    description: 'Free-range (roadrunner) chicken roasted to perfection with simple herbs and spices.',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1000&auto=format&fit=crop',
    category: 'Dinner',
    tags: ['Chicken', 'Roast', 'Traditional'],
    time: '120 Mins',
    servings: 5,
    calories: '450 Kcal',
    isTraditional: true,
    rating: 4.8,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Roast',
        data: [
          { name: 'Whole Chicken', quantity: '1.5kg', description: 'Free-range preferred' },
          { name: 'Chicken Spice', quantity: '2 tbsp', description: 'Or Aromat/Paprika mix' },
          { name: 'Garlic', quantity: '1 head', description: 'Cloves separated' },
          { name: 'Lemon', quantity: '1', description: 'Juiced' },
          { name: 'Oil', quantity: '4 tbsp', description: '' },
          { name: 'Potatoes', quantity: '1kg', description: 'For roasting (Optional)' }
        ]
      }
    ],
    steps: [
      { instruction: 'Preheat oven to 200°C (400°F).' },
      { instruction: 'Clean the chicken and pat dry with paper towels.' },
      { instruction: 'Mix the chicken spice with oil and lemon juice to form a paste.' },
      { instruction: 'Rub the spice mixture all over the chicken and inside the cavity.' },
      { instruction: 'Stuff the cavity with garlic cloves. If using potatoes, coat them in oil and place around the chicken.' },
      { instruction: 'Roast in the oven for about 1 hour 15 minutes, or until the juices run clear when the thigh is pierced.' },
      { instruction: 'Rest for 10 minutes before carving. Serve with Sadza or rice.' }
    ]
  },
  {
    id: '12',
    title: 'Fried Bream Fish',
    description: 'Fresh Bream fish, deep-fried to crispy golden perfection, served with a light tomato relish.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1000&auto=format&fit=crop',
    category: 'Seafood',
    tags: ['Seafood', 'Fried', 'Lunch'],
    time: '40 Mins',
    servings: 3,
    calories: '380 Kcal',
    isTraditional: true,
    rating: 4.6,
    author: {
      name: 'Praisetechzw',
      avatar: 'https://github.com/shadcn.png',
    },
    ingredients: [
      {
        title: 'Fish & Sides',
        data: [
          { name: 'Fresh Bream Fish', quantity: '3 medium', description: 'Scaled and cleaned' },
          { name: 'Salt', quantity: '2 tsp', description: '' },
          { name: 'Oil', quantity: '500ml', description: 'For deep frying' },
          { name: 'Onion', quantity: '1', description: 'Sliced for garnish' },
          { name: 'Tomato', quantity: '1', description: 'Diced for garnish' }
        ]
      }
    ],
    steps: [
      { instruction: 'Make diagonal cuts on the sides of the fish (score) to help the heat penetrate.' },
      { instruction: 'Rub salt generously all over the fish and inside the cavity.' },
      { instruction: 'Heat oil in a deep frying pan to medium-high heat.' },
      { instruction: 'Carefully place the fish in the hot oil. Do not overcrowd the pan.' },
      { instruction: 'Fry for about 5-7 minutes on each side until the skin is crispy and the meat is flaky.' },
      { instruction: 'Remove and drain on paper towels.' },
      { instruction: 'Garnish with fresh sliced onions and tomatoes. Serve with Sadza or chips.' }
    ]
  },
  {
    id: '13',
    title: 'Mubhora (Boiled Sweet Potatoes)',
    description: 'Sweet potatoes boiled or steamed until tender. A simple, healthy staple often eaten with tea.',
    image: 'https://images.unsplash.com/photo-1596097635121-14b63d2c5445?q=80&w=1000&auto=format&fit=crop',
    category: 'Side Dish',
    tags: ['Side Dish', 'Vegetarian', 'Healthy'],
    time: '30 Mins',
    servings: 4,
    calories: '180 Kcal',
    isTraditional: true,
    rating: 4.4,
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