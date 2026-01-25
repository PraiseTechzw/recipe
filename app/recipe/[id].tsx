import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const recipe = RECIPES.find(r => r.id === id);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  
  const { isFavorite, toggleFavorite, logRecipeView, addToShoppingList } = useStore();
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
       // Check if available and maybe ask
       if (await StoreReview.hasAction()) {
           // In production, limit frequency. Here we just show it for demo.
           // StoreReview.requestReview(); 
           console.log('Requesting review...');
       }
    }
  };

  const handleAddToShoppingList = () => {
    if (!recipe) return;
    const allIngredients = recipe.ingredients.flatMap(s => s.data);
    addToShoppingList(allIngredients);
    Alert.alert("Success", "Ingredients added to your shopping list.");
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
              {recipe.tags.map((tag, i) => (
                <View key={i} style={[styles.tag, tag === 'Traditional' ? styles.tagDark : styles.tagOrange]}>
                  {tag === 'Traditional' && <Ionicons name="earth" size={12} color="#fff" style={{marginRight: 4}} />}
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.contentBody}>
            {/* Stats Card */}
            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Ionicons name="time" size={20} color="#E65100" />
                    <Text style={styles.statValue}>{recipe.time}</Text>
                    <Text style={styles.statLabel}>TIME</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Ionicons name="restaurant" size={20} color="#E65100" />
                    <Text style={styles.statValue}>{recipe.servings} Servings</Text>
                    <Text style={styles.statLabel}>YIELD</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Ionicons name="flame" size={20} color="#E65100" />
                    <Text style={styles.statValue}>{recipe.calories}</Text>
                    <Text style={styles.statLabel}>ENERGY</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
                    onPress={() => setActiveTab('ingredients')}
                >
                    <MaterialIcons name="shopping-basket" size={18} color={activeTab === 'ingredients' ? '#fff' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>Ingredients</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'steps' && styles.activeTab]}
                    onPress={() => setActiveTab('steps')}
                >
                    <MaterialIcons name="format-list-numbered" size={18} color={activeTab === 'steps' ? '#fff' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'steps' && styles.activeTabText]}>Steps</Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.listContainer}>
                {activeTab === 'ingredients' ? (
                    <View>
                        <View style={styles.listHeaderRow}>
                            <Text style={styles.listHeaderTitle}>{recipe.ingredients[0]?.title || 'Ingredients'}</Text>
                            <Text style={styles.itemCount}>{recipe.ingredients.reduce((acc, sec) => acc + sec.data.length, 0)} Items</Text>
                        </View>
                        
                        {recipe.ingredients.map((section, secIdx) => (
                            <View key={secIdx} style={{marginBottom: 16}}>
                                {recipe.ingredients.length > 1 && (
                                    <Text style={styles.sectionHeader}>{section.title}</Text>
                                )}
                                {section.data.map((item, idx) => (
                                    <TouchableOpacity 
                                        key={idx} 
                                        style={styles.ingredientRow} 
                                        onPress={() => toggleIngredient(item.name)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, checkedIngredients.has(item.name) && styles.checkboxChecked]}>
                                            {checkedIngredients.has(item.name) && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <View style={styles.ingredientInfo}>
                                            <Text style={styles.ingredientName}>
                                                <Text style={{fontWeight: 'bold'}}>{item.quantity ? `${item.quantity} ` : ''}</Text>
                                                {item.name}
                                            </Text>
                                            {item.description && <Text style={styles.ingredientDesc}>{item.description}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                        
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleAddToShoppingList}>
                            <Ionicons name="basket-outline" size={20} color="#E65100" />
                            <Text style={styles.secondaryButtonText}>Add All to Shopping List</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                         {recipe.steps.map((step, idx) => (
                             <View key={idx} style={styles.stepRow}>
                                 <View style={styles.stepNumberContainer}>
                                     <Text style={styles.stepNumber}>{idx + 1}</Text>
                                 </View>
                                 <Text style={styles.stepText}>{step.instruction}</Text>
                             </View>
                         ))}
                    </View>
                )}
            </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => router.push(`/cooking/${recipe.id}`)}
          >
              <MaterialIcons name="restaurant-menu" size={24} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.startButtonText}>Start Cooking</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageContainer: {
    width: '100%',
    height: 350,
    justifyContent: 'flex-end',
  },
  headerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  headerButtons: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)', // Works on iOS mostly
  },
  headerContent: {
    padding: 20,
    paddingBottom: 40, // Space for the overlapping card
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagOrange: {
    backgroundColor: '#E65100',
  },
  tagDark: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  contentBody: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -24,
    paddingTop: 16,
    paddingHorizontal: 16,
    minHeight: 500,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
    marginTop: -40, // Pull up to overlap
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#eee',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E65100', // Orange
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    marginBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    color: '#999',
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E65100', // Orange
    borderColor: '#E65100',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    color: '#333',
  },
  ingredientDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE0B2', // Light Orange
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff', // Transparent or gradient
    paddingTop: 16,
    paddingHorizontal: 16,
    // Shadow for footer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  startButton: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 15,
  },
});
