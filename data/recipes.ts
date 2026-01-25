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
    image: 'https://globalpressjournal.com/africa/zimbabwe/eats-private-homes-fine-restaurants-hotels-mopane-worms-zimbabwean-delicacy/',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIBvZ3Ih46NKreqM19seAl2sYytAHuR1XmpQ&s',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNb8GzO6KjGNhJiyypQI8qJRGTMH7sEK5oZQ&s',
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
    image: 'https://www.zimbokitchen.com/wp-content/uploads/2013/11/Mahewu-eZviyo.png',
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
    image: 'https://www.thespruceeats.com/thmb/wY9GEdS7nKMMSaECzFK99V--QEw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/peanut-butter-porridge-bota-une-dovi-39487-step-06-f1c38034579b4b6abe47c6eb65a3de73.jpg',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeb7EA9e5pon83fa-D7myMoQxOmDDjKHjoEw&s',
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
    image: 'data:image/jpeg;base64,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',
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
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjQI7gXpQxtxZz8gWvxHh2A0PJUgS4dWxWn1gGXT9ZRUuX_b3Q8M1f5sOElFR78bpxel978BOwmxrLqZK6xL2REhEQozL41ll8ViDh16DHpSMZcFchshINze7_Q_PbZqEtuhH5Yc2uPHpAy/s1600/Mupotohayi%252C+Cornmeal+Bread.jpg',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQglXdEekJXMEYiqANow0rMzhFvKa1pRc9HYQ&s',
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
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTczChzqSjpmVxirEm5YNqvq2kCxlLCfVBVOg&s',
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
    title: 'Mbambaira (Boiled Sweet Potatoes)',
    description: 'Sweet potatoes boiled or steamed until tender. A simple, healthy staple often eaten with tea.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBo01-82suOJGi9pArqYlChSvs83GH6qmUjw&s',
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