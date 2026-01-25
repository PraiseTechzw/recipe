import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  
  const { isFavorite, toggleFavorite, logRecipeView, addToShoppingList } = useStore();
  
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
    Alert.alert("Success", i18n.t('ingredients') + " added to " + i18n.t('shoppingList'));
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
    return <View style={styles.center}><Text>Recipe not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image source={{ uri: recipe.image }} style={styles.headerImage} contentFit="cover" transition={500} />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          <View style={[styles.headerButtons, { top: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.iconButton}>
              <Ionicons name={favorite ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerContent}>
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
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={16} color="#ddd" />
                <Text style={styles.metaText}>{recipe.servings} {i18n.t('servings')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={16} color="#ddd" />
                <Text style={styles.metaText}>{recipe.calories}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]} 
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>{i18n.t('ingredients')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'steps' && styles.activeTab]} 
            onPress={() => setActiveTab('steps')}
          >
            <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>{i18n.t('steps')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'ingredients' ? (
            <View>
              {recipe.ingredients.map((section: any, index: number) => (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.data.map((item: string, i: number) => (
                    <TouchableOpacity key={i} style={styles.ingredientRow} onPress={() => toggleIngredient(item)}>
                      <View style={[styles.checkbox, checkedIngredients.has(item) && styles.checkboxChecked]}>
                        {checkedIngredients.has(item) && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text style={[styles.ingredientText, checkedIngredients.has(item) && styles.ingredientTextChecked]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              
              <TouchableOpacity style={styles.shoppingButton} onPress={handleAddToShoppingList}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.shoppingButtonText}>{i18n.t('addToShoppingList')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {recipe.steps.map((item: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                    <View style={styles.stepLine} />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{item}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button for Cooking Mode */}
      <View style={styles.fabContainer}>
         <TouchableOpacity style={styles.fab} onPress={() => router.push(`/cooking/${recipe.id}`)}>
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.fabText}>{i18n.t('startCooking')}</Text>
         </TouchableOpacity>
      </View>
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
    height: 350,
    width: '100%',
    position: 'relative',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E65100',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  ingredientTextChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  shoppingButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  shoppingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumberContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 30,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#FFF3E0',
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 8,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
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
