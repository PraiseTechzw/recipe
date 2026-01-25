import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  FadeInUp,
  interpolate,
  SlideInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

const getAdjustedQuantity = (qty: string, mult: number) => {
  if (mult === 1 || !qty) return qty;
  const match = qty.match(/^([\d./]+)(.*)$/);
  if (match) {
    const numStr = match[1];
    const rest = match[2];
    let val = 0;
    if (numStr.includes('/')) {
        const [n, d] = numStr.split('/');
        val = parseFloat(n) / parseFloat(d);
    } else {
        val = parseFloat(numStr);
    }
    
    if (!isNaN(val)) {
        const newVal = val * mult;
        // Format to avoid long decimals
        const formatted = Number.isInteger(newVal) ? newVal.toString() : newVal.toFixed(1).replace(/\.0$/, '');
        return formatted + rest;
    }
  }
  return qty;
};

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [multiplier, setMultiplier] = useState(1);
  
  const { isFavorite, toggleFavorite, logRecipeView, addToShoppingList } = useStore();
  
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-400, 0, 400],
            [-200, 0, 200],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-400, 0],
            [2, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  useEffect(() => {
    const loadRecipe = async () => {
        setLoading(true);
        const localRecipe = RECIPES.find(r => r.id === id);
        if (localRecipe) {
            setRecipe(localRecipe);
            setLoading(false);
            return;
        }

        // Try Supabase
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .eq('id', id)
                .single();
            
            if (data) {
                setRecipe({
                    id: data.id,
                    title: data.title,
                    image: data.image,
                    time: data.time,
                    category: data.category,
                    description: data.description,
                    ingredients: data.ingredients || [],
                    steps: data.steps || [],
                    calories: 'N/A',
                    tags: ['Community'],
                    servings: '2-4'
                });
            } else {
                console.log('Recipe not found in Supabase or Local');
            }
        } catch (e) {
            console.log('Error loading recipe:', e);
        } finally {
            setLoading(false);
        }
    };

    loadRecipe();
  }, [id]);

  const favorite = recipe ? isFavorite(recipe.id) : false;

  useEffect(() => {
    // Analytics: Recipe View
    if (recipe) {
        logRecipeView(recipe.id, recipe.category);
    }
  }, [id, recipe]);

  const handleToggleFavorite = async () => {
    if (!recipe) return;
    toggleFavorite(recipe.id);
    
    // Smart Review Prompt Logic: If adding to favorites (positive action)
    if (!favorite) {
       if (await StoreReview.hasAction()) {
           // StoreReview.requestReview(); 
           console.log('Requesting review...');
       }
    }
  };

  const handleAddToShoppingList = () => {
    if (!recipe) return;
    const allIngredients = recipe.ingredients.flatMap((s: any) => s.data);
    addToShoppingList(allIngredients);
    Alert.alert(i18n.t('success'), i18n.t('ingredients') + " " + i18n.t('addedTo') + " " + i18n.t('shoppingList'));
  };

  const toggleIngredient = (name: string) => {
    const newSet = new Set(checkedIngredients);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setCheckedIngredients(newSet);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#E65100" /></View>;
  }

  if (!recipe) {
    return <View style={styles.center}><Text>{i18n.t('recipeNotFound')}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Animated.ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
      >
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Animated.View style={[StyleSheet.absoluteFill, headerAnimatedStyle]}>
            <Image source={{ uri: recipe.image }} style={styles.headerImage} contentFit="cover" transition={500} />
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.headerContent}>
            <View style={styles.tagsRow}>
              {recipe.tags.map((tag: string, i: number) => (
                <View key={i} style={[styles.tag, tag === 'Traditional' ? styles.tagDark : styles.tagOrange]}>
                  {tag === 'Traditional' && <Ionicons name="earth" size={12} color="#fff" style={{marginRight: 4}} />}
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.title}>{recipe.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#ddd" />
                <Text style={styles.metaText}>{recipe.time}</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#ddd" />
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <TouchableOpacity 
                        onPress={() => setMultiplier(m => Math.max(0.5, m - 0.5))}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Ionicons name="remove-circle-outline" size={20} color="#fff" style={{opacity: multiplier <= 0.5 ? 0.5 : 1}} />
                    </TouchableOpacity>
                    
                    <Text style={styles.metaText}>
                         {parseInt(recipe.servings) ? Math.round(parseInt(recipe.servings) * multiplier) : recipe.servings} 
                         {multiplier !== 1 && <Text style={{fontSize: 12, color: '#ccc'}}> ({multiplier}x)</Text>}
                    </Text>
                    
                    <TouchableOpacity 
                        onPress={() => setMultiplier(m => m + 0.5)}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color="#ddd" />
                <Text style={styles.metaText}>{recipe.calories}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Content Tabs */}
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]} 
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>{i18n.t('ingredients')}</Text>
            {activeTab === 'ingredients' && <Animated.View entering={FadeInDown} style={styles.activeIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'steps' && styles.activeTab]} 
            onPress={() => setActiveTab('steps')}
          >
            <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>{i18n.t('steps')}</Text>
            {activeTab === 'steps' && <Animated.View entering={FadeInDown} style={styles.activeIndicator} />}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.contentContainer}>
          {activeTab === 'ingredients' ? (
            <View>
              {recipe.ingredients.map((section: IngredientSection, index: number) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.map((item: any, i: number) => {
                    const name = typeof item === 'string' ? item : item.name;
<<<<<<< HEAD
                    const quantity = typeof item === 'object' && item.quantity ? getAdjustedQuantity(item.quantity, multiplier) : '';
                    const isChecked = checkedIngredients.has(name);
                    
                    return (
                    <TouchableOpacity key={i} style={styles.ingredientRow} onPress={() => toggleIngredient(name)} activeOpacity={0.7}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <View style={{flex: 1}}>
                         <Text style={[styles.ingredientText, isChecked && styles.ingredientTextChecked]}>
                            {name}
                         </Text>
                         {quantity ? <Text style={styles.ingredientQuantity}>{quantity}</Text> : null}
                      </View>
=======
                    const quantity = typeof item === 'object' && item.quantity ? item.quantity : '';
                    const isChecked = checkedIngredients.has(name);
                    
                    return (
                    <TouchableOpacity key={i} style={styles.ingredientRow} onPress={() => toggleIngredient(name)}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text style={[styles.ingredientText, isChecked && styles.ingredientTextChecked]}>
                        {quantity ? `${quantity} ` : ''}{name}
                      </Text>
>>>>>>> b6371b3 (feat(i18n): add full app internationalization with dynamic locale switching)
                    </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              
              <TouchableOpacity style={styles.shoppingButton} onPress={handleAddToShoppingList}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.shoppingButtonText}>{i18n.t('addToShoppingList')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {recipe.steps.map((item: any, index: number) => {
                const instruction = typeof item === 'string' ? item : item.instruction;
                const description = typeof item === 'object' ? item.description : null;
                
                return (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    {index < recipe.steps.length - 1 && <View style={styles.stepLine} />}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{instruction}</Text>
<<<<<<< HEAD
                    {description && <Text style={styles.stepDescription}>{description}</Text>}
=======
                    {description && <Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{description}</Text>}
>>>>>>> b6371b3 (feat(i18n): add full app internationalization with dynamic locale switching)
                  </View>
                </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>

      {/* Header Buttons (Fixed) */}
      <View style={[styles.headerButtons, { top: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton}>
          <Ionicons name={favorite ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Floating Action Button for Cooking Mode */}
      <Animated.View entering={SlideInDown.delay(800)} style={styles.fabContainer}>
         <TouchableOpacity style={styles.fab} onPress={() => router.push(`/cooking/${recipe.id}`)}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.fabText}>{i18n.t('startCooking')}</Text>
         </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageContainer: {
    height: 400, // Taller image
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagOrange: {
    backgroundColor: '#E65100',
  },
  tagDark: {
    backgroundColor: '#333',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    lineHeight: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 12,
  },
  metaText: {
    color: '#eee',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 8,
    zIndex: 100,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    // borderBottomWidth: 2,
    // borderBottomColor: '#E65100',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 3,
    backgroundColor: '#E65100',
    borderRadius: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#E65100',
    fontWeight: '700',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  ingredientTextChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shoppingButton: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  shoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 0, // Changed from 24 to handle line connectivity
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 32,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E65100',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontWeight: 'bold',
    fontSize: 14,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FFE0B2',
    marginVertical: 4,
    minHeight: 40,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 32,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontWeight: '500',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  fab: {
    flexDirection: 'row',
    backgroundColor: '#E65100',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
