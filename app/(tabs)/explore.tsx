import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../../components/AdBanner';
import { CATEGORIES, RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { generateRecipeFromImage } from '../../services/ai';
import { searchRecipes } from '../../services/recommendations';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORY_STYLES: Record<string, { bg: string; color: string; icon: any }> = {
  'Grains': { bg: '#FFF3E0', color: '#E65100', icon: 'grain' },
  'Relishes': { bg: '#E8F5E9', color: '#2E7D32', icon: 'grass' },
  'Meats': { bg: '#FFEBEE', color: '#C62828', icon: 'restaurant-menu' },
  'Drinks': { bg: '#FFFDE7', color: '#F9A825', icon: 'local-bar' },
};

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<any>(null);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const filteredRecipes = searchRecipes(searchQuery, activeCategory).sort((a, b) => {
    if (sortBy === 'time') {
      return parseInt(a.time) - parseInt(b.time);
    } else if (sortBy === 'calories') {
      return parseInt(a.calories) - parseInt(b.calories);
    }
    return 0;
  });
  
  const trendingRecipe = RECIPES.find(r => r.title.includes('Dovi')) || RECIPES[1];
  const otherTrending = RECIPES.find(r => r.title.includes('Muriwo')) || RECIPES[2];

  const handleScanIngredients = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to scan ingredients.');
        return;
    }

    try {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
            quality: 0.5,
        });

        if (!result.canceled && result.assets[0].base64) {
            setAiModalVisible(true);
            setIsGenerating(true);
            setAiRecipe(null);
            
            try {
                const recipe = await generateRecipeFromImage(result.assets[0].base64);
                setAiRecipe(recipe);
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to generate recipe. Please try again.');
                setAiModalVisible(false);
            } finally {
                setIsGenerating(false);
            }
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Something went wrong launching the camera.');
    }
  };

  const handleSaveAiRecipe = async () => {
    if (!aiRecipe) return;

    try {
        const { error } = await supabase
            .from('recipes')
            .insert([
                { 
                    title: aiRecipe.title, 
                    description: aiRecipe.description, 
                    time: aiRecipe.time, 
                    category: aiRecipe.category || 'Other',
                    image: 'https://via.placeholder.com/600x400?text=AI+Generated+Recipe',
                    ingredients: aiRecipe.ingredients,
                    steps: aiRecipe.steps
                }
            ]);

        if (error) throw error;
        Alert.alert('Success', 'Recipe saved to your collection!');
        setAiModalVisible(false);
    } catch (error) {
        console.error(error);
        Alert.alert('Note', 'Recipe generated! Configure Supabase to save it permanently.');
    }
  };

  const renderAiModal = () => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={aiModalVisible}
        onRequestClose={() => setAiModalVisible(false)}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setAiModalVisible(false)}
                >
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>

                {isGenerating ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E65100" />
                        <Text style={styles.loadingText}>{i18n.t('analyzing')}</Text>
                        <Text style={styles.loadingSubText}>{i18n.t('poweredBy')}</Text>
                    </View>
                ) : aiRecipe ? (
                    <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.aiTitle}>{aiRecipe.title}</Text>
                        <Text style={styles.aiDescription}>{aiRecipe.description}</Text>
                        
                        <View style={styles.aiMetaRow}>
                            <View style={styles.aiMetaItem}>
                                <Ionicons name="time-outline" size={16} color="#E65100" />
                                <Text style={styles.aiMetaText}>{aiRecipe.time}</Text>
                            </View>
                            <View style={styles.aiMetaItem}>
                                <Ionicons name="flame-outline" size={16} color="#E65100" />
                                <Text style={styles.aiMetaText}>{aiRecipe.calories}</Text>
                            </View>
                        </View>

                        <Text style={styles.aiSectionTitle}>Ingredients</Text>
                        {aiRecipe.ingredients?.map((ing: any, i: number) => (
                            <Text key={i} style={styles.aiListItem}>• {ing.quantity} {ing.name}</Text>
                        ))}

                        <Text style={styles.aiSectionTitle}>Steps</Text>
                        {aiRecipe.steps?.map((step: string, i: number) => (
                            <View key={i} style={styles.stepItem}>
                                <Text style={styles.stepNumber}>{i + 1}</Text>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                        
                        <View style={{ height: 80 }} /> 
                    </ScrollView>
                    
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAiRecipe}>
                            <Ionicons name="save-outline" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>{i18n.t('saveRecipe')}</Text>
                        </TouchableOpacity>
                    </View>
                    </>
                ) : null}
            </View>
        </View>
    </Modal>
  );

  const renderRecipeGrid = (recipes: typeof RECIPES, delayBase: number = 0) => (
    <View style={styles.gridContainer}>
        {recipes.map((recipe, index) => (
            <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                    <Animated.View entering={FadeInDown.delay(delayBase + (index * 100)).springify()} style={styles.gridCard}>
                        <Image source={{ uri: recipe.image }} style={styles.gridImage} contentFit="cover" transition={200} />
                        <TouchableOpacity style={styles.favoriteButton}>
                            <Ionicons name="heart" size={18} color="#FF5252" />
                        </TouchableOpacity>
                        <View style={styles.gridContent}>
                            <Text style={styles.gridTitle} numberOfLines={2}>{recipe.title}</Text>
                            <View style={styles.gridMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={14} color="#888" />
                                    <Text style={styles.metaText}>{recipe.time.replace(' Mins', 'm')}</Text>
                                </View>
                                <View style={[styles.tagBadge, { backgroundColor: recipe.category === 'Vegetarian' ? '#E8F5E9' : '#FFF3E0' }]}>
                                    <Text style={[styles.tagText, { color: recipe.category === 'Vegetarian' ? '#2E7D32' : '#E65100' }]}>
                                        {recipe.category}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Link>
        ))}
    </View>
  );

  const renderContent = () => {
    if (searchQuery.length > 0 || activeCategory !== 'All') {
      return (
        <Animated.View entering={FadeInDown.duration(400)} style={{ paddingTop: 16 }}>
            <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                <Text style={styles.sectionTitle}>
                    {filteredRecipes.length} {i18n.t('results')}
                </Text>
            </View>
            {renderRecipeGrid(filteredRecipes, 100)}
        </Animated.View>
      );
    }

    return (
        <>
            {/* Trending Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{i18n.t('trending')}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>{i18n.t('seeAll')}</Text>
                </TouchableOpacity>
            </Animated.View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
                <Link href={`/recipe/${trendingRecipe.id}`} asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <Animated.View entering={FadeInRight.delay(200).springify()} style={styles.trendingCard}>
                            <Image source={{ uri: trendingRecipe.image }} style={styles.trendingImage} contentFit="cover" transition={300} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                                style={styles.trendingOverlay}
                            >
                                <View style={styles.trendingTag}>
                                    <Ionicons name="trending-up" size={12} color="#E65100" />
                                    <Text style={styles.trendingTagText}>{i18n.t('trendingTag')}</Text>
                                </View>
                                <Text style={styles.trendingTitle}>{trendingRecipe.title}</Text>
                                <Text style={styles.trendingMeta}>{trendingRecipe.time} • {trendingRecipe.calories}</Text>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </Link>

                <Link href={`/recipe/${otherTrending.id}`} asChild>
                    <TouchableOpacity activeOpacity={0.9}>
                        <Animated.View entering={FadeInRight.delay(300).springify()} style={styles.trendingCard}>
                            <Image source={{ uri: otherTrending.image }} style={styles.trendingImage} contentFit="cover" transition={300} />
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                                style={styles.trendingOverlay}
                            >
                                <View style={[styles.trendingTag, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="leaf" size={12} color="#2E7D32" />
                                    <Text style={[styles.trendingTagText, { color: '#2E7D32' }]}>{i18n.t('healthy')}</Text>
                                </View>
                                <Text style={styles.trendingTitle}>{otherTrending.title}</Text>
                                <Text style={styles.trendingMeta}>{otherTrending.time} • {otherTrending.calories}</Text>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </Link>
            </ScrollView>

            <AdBanner />

            {/* Categories Circles */}
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{i18n.t('categories')}</Text>
                </View>
                <View style={styles.categoriesRow}>
                    {CATEGORIES.map((cat, index) => {
                        const style = CATEGORY_STYLES[cat.name] || { bg: '#F5F5F5', color: '#666', icon: 'restaurant' };
                        return (
                            <TouchableOpacity 
                                key={cat.id} 
                                style={styles.categoryCircleItem}
                                onPress={() => setActiveCategory(cat.name)}
                                activeOpacity={0.7}
                            >
                                <Animated.View entering={FadeInDown.delay(500 + (index * 100)).springify()} style={[styles.categoryCircle, { backgroundColor: style.bg }]}>
                                    <MaterialIcons name={style.icon} size={28} color={style.color} />
                                </Animated.View>
                                <Text style={styles.categoryLabel}>{cat.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </Animated.View>

            {/* Popular Recipes Grid */}
            <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>{i18n.t('popularRecipes')}</Text>
                    <TouchableOpacity>
                        <Ionicons name="filter" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
                
                {renderRecipeGrid(RECIPES, 700)}
            </Animated.View>
        </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerSubtitle}>{i18n.t('exploreSubtitle') || 'Discover'}</Text>
            <Text style={styles.headerTitle}>{i18n.t('exploreTitle')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#C26A00" style={styles.searchIcon} />
          <TextInput 
            placeholder={i18n.t('searchPlaceholder')}
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
             </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleScanIngredients}>
                <LinearGradient
                    colors={['#FF8C00', '#E65100']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.aiScanButton}
                >
                    <Ionicons name="scan-outline" size={20} color="#fff" />
                    <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity 
            style={[styles.filterChip, activeCategory === 'All' && styles.filterChipActive]}
            onPress={() => setActiveCategory('All')}
          >
            <Text style={[styles.filterText, activeCategory === 'All' && styles.filterTextActive]}>{i18n.t('all')}</Text>
          </TouchableOpacity>
          
          {['Traditional', 'Dinner', 'Stew', 'Vegetarian', 'High Protein'].map((filter) => {
             return (
                <TouchableOpacity 
                    key={filter} 
                    style={[styles.filterChip, activeCategory === filter && styles.filterChipActive]}
                    onPress={() => setActiveCategory(filter)}
                >
                    <Text style={[styles.filterText, activeCategory === filter && styles.filterTextActive]}>
                        {filter}
                    </Text>
                </TouchableOpacity>
             );
          })}
        </ScrollView>

        {renderContent()}

      </ScrollView>
      {renderAiModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // AI Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  aiDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  aiMetaRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  aiMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  aiMetaText: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '500',
  },
  aiSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 8,
  },
  aiListItem: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    paddingLeft: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modalActions: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  saveButton: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65100',
  },
  scanButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
    lineHeight: 32,
  },
  aiScanButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#2962FF',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  aiBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14, // Slightly taller
    borderRadius: 24, // More rounded like Home
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 12,
    opacity: 0.7, // Darker icon
  },
  searchInput: {
    flex: 1,
    fontSize: 16, // Larger text
    color: '#1a1a1a',
    fontWeight: '500',
  },
  filtersScroll: {
    marginTop: 16,
    paddingLeft: 16,
    maxHeight: 50,
  },
  filtersContent: {
    paddingRight: 32,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
  },
  trendingContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  trendingCard: {
    width: width * 0.85, // Wider card
    height: 240, // Taller for more impact
    marginRight: 20,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 60,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  trendingTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E65100',
    marginLeft: 4,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  trendingMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryCircleItem: {
    alignItems: 'center',
    width: (width - 32) / 4,
  },
  categoryCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    letterSpacing: -0.2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  gridImage: {
    width: '100%',
    height: CARD_WIDTH * 1.25, // Slightly less tall than before for better balance
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 20,
  },
  gridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
