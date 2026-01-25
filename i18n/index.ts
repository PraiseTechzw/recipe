import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js/src';

const i18n = new I18n({
  en: {
    exploreTitle: "Explore Zimbabwe's Flavors",
    searchPlaceholder: "Search recipes, ingredients...",
    trending: "Trending this week",
    seeAll: "See All",
    categories: "Categories",
    popularRecipes: "Popular Recipes",
    results: "Results",
    grains: "Grains",
    relishes: "Relishes",
    meats: "Meats",
    drinks: "Drinks",
    quickMeals: "Quick Meals",
    vegetarian: "Vegetarian",
    ceremonial: "Ceremonial",
    all: "All",
    healthy: "HEALTHY",
    trendingTag: "TRENDING",
    createRecipe: "Create Recipe",
    aiGenerate: "Generate with AI",
    scanIngredients: "Scan Ingredients",
  },
  sn: {
    exploreTitle: "Tsvaga Zvinonaka zveZimbabwe",
    searchPlaceholder: "Tsvaga mabikirwo, zvinoshandiswa...",
    trending: "Zvirikutaurwa svondo rino",
    seeAll: "Ona Zvese",
    categories: "Mhando",
    popularRecipes: "Mabikirwo Akakurumbira",
    results: "Zvakawanikwa",
    grains: "Zviyo",
    relishes: "Muriwo",
    meats: "Nyama",
    drinks: "Zvinwiwa",
    quickMeals: "Chikafu Chekukasira",
    vegetarian: "Zvemuriwo",
    ceremonial: "Zvemitambo",
    all: "Zvese",
    healthy: "ZVINOVAKA",
    trendingTag: "ZVIRIKUPISA",
    createRecipe: "Gadzira Resipi",
    aiGenerate: "Gadzira ne AI",
    scanIngredients: "Tora Mufananidzo Wezvinoshandiswa",
  },
  nd: {
    exploreTitle: "Hlola Nambitha zeZimbabwe",
    searchPlaceholder: "Dingisisa amaresiphi...",
    trending: "Okutrendayo iviki leli",
    seeAll: "Bona Konke",
    categories: "Imikhakha",
    popularRecipes: "Amaresiphi Adumileyo",
    results: "Imiphumela",
    grains: "Izinhlamvu",
    relishes: "Imibhida",
    meats: "Inyama",
    drinks: "Iziphuzo",
    quickMeals: "Ukudla Kokushesha",
    vegetarian: "Okwemibhida",
    ceremonial: "Okwemikhosi",
    all: "Konke",
    healthy: "KUYAKHA",
    trendingTag: "OKUTRENDAYO",
    createRecipe: "Dala Iresiphi",
    aiGenerate: "Dala nge AI",
    scanIngredients: "Thatha Isithombe Sezithako",
  }
});

// Set the locale once at the beginning of your app.
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale;
i18n.enableFallback = true;

export default i18n;
