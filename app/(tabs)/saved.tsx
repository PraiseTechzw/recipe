import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favorites, isDarkMode } = useStore();
  const [supabaseRecipes, setSupabaseRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      
      if (favorites.length === 0) {
        setSupabaseRecipes([]);
        setLoading(false);
        return;
      }

      const localIds = new Set(RECIPES.map(r => r.id));
      const remoteIds = favorites.filter(id => !localIds.has(id));

      if (remoteIds.length === 0) {
        setSupabaseRecipes([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .in('id', remoteIds);

      if (error) {
        console.log('Error fetching saved recipes:', error);
        setSupabaseRecipes([]);
      } else if (data) {
        const formatted = data.map(r => ({
            id: r.id,
            title: r.title,
            image: r.image,
            time: r.time,
            category: r.category,
            description: r.description,
            ingredients: r.ingredients || [],
            steps: r.steps || [],
            calories: 'N/A',
            tags: ['Community'],
            servings: '2-4',
            rating: r.rating || 4.5
        }));
        setSupabaseRecipes(formatted);
      }
    } catch (e) {
      console.log('Supabase fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSavedRecipes();
    }, [favorites])
  );

  const filteredRecipes = useMemo(() => {
    const localSaved = RECIPES.filter(r => favorites.includes(r.id));
    const all = [...localSaved, ...supabaseRecipes];
    
    let result = all;

    if (activeCategory !== 'All') {
        result = result.filter(r => r.category === activeCategory);
    }
    
    if (searchQuery) {
        result = result.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    return result;
  }, [favorites, supabaseRecipes, searchQuery, activeCategory]);

  const CompactRecipeCard = ({ recipe, index }: { recipe: any, index: number }) => (
    <Link href={`/recipe/${recipe.id}`} asChild>
        <TouchableOpacity activeOpacity={0.9} style={{ marginBottom: 16 }}>
            <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
                <View style={[styles.card, isDarkMode && styles.cardDark]}>
                    <Image 
                        source={{ uri: recipe.image }} 
                        style={styles.cardImage} 
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.cardOverlay}>
                        <View style={styles.cardBadge}>
                            <Ionicons name="time-outline" size={12} color="#fff" />
                            <Text style={styles.cardBadgeText}>{recipe.time}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.cardContent}>
                        <Text style={[styles.cardTitle, isDarkMode && styles.textDark]} numberOfLines={2}>
                            {recipe.title}
                        </Text>
                        
                        <View style={styles.cardFooter}>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={12} color="#FFD700" />
                                <Text style={[styles.ratingText, isDarkMode && styles.textSubDark]}>
                                    {recipe.rating || 4.5}
                                </Text>
                            </View>
                            <Text style={[styles.caloriesText, isDarkMode && styles.textSubDark]}>
                               {recipe.calories !== 'N/A' ? recipe.calories : ''}
                            </Text>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    </Link>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' }]}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{i18n.t('savedRecipes')}</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && styles.textSubDark]}>
            {filteredRecipes.length} {i18n.t('items')} • {activeCategory}
          </Text>
        </View>
        <TouchableOpacity style={[styles.filterBtn, isDarkMode && styles.filterBtnDark]}>
             <Ionicons name="options-outline" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#999' : '#999'} style={styles.searchIcon} />
            <TextInput 
                style={[styles.searchInput, isDarkMode && styles.textDark]}
                placeholder={i18n.t('searchSaved')}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#ccc" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
            {['All', 'Traditional', 'Breakfast', 'Dinner', 'Snack', 'Vegetarian', 'Dessert'].map((cat, index) => (
                <Animated.View key={cat} entering={FadeInRight.delay(index * 50).springify()}>
                    <TouchableOpacity 
                        style={[
                            styles.filterChip, 
                            isDarkMode && styles.filterChipDark,
                            activeCategory === cat && styles.filterChipActive
                        ]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[
                            styles.filterText, 
                            isDarkMode && styles.textSubDark,
                            activeCategory === cat && styles.filterTextActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#E65100" />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <Animated.View entering={FadeInDown.springify()} style={{ flex: 1 }}>
            <View style={styles.emptyContainer}>
                <Image 
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2906/2906856.png' }} 
                    style={{ width: 120, height: 120, opacity: 0.5, marginBottom: 20 }}
                    contentFit="contain"
                />
                <Text style={[styles.emptyText, isDarkMode && styles.textDark]}>
                    {searchQuery ? 'No matches found' : i18n.t('noSavedRecipes')}
                </Text>
                <Text style={[styles.emptySubText, isDarkMode && styles.textSubDark]}>
                    {searchQuery ? 'Try a different search term' : i18n.t('saveRecipesMessage')}
                </Text>
                {!searchQuery && (
                    <Link href="/(tabs)/explore" asChild>
                        <TouchableOpacity style={styles.browseButton}>
                            <Text style={styles.browseButtonText}>{i18n.t('browseRecipes')}</Text>
                        </TouchableOpacity>
                    </Link>
                )}
            </View>
        </Animated.View>
      ) : (
        <ScrollView 
            contentContainerStyle={styles.gridContent} 
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.row}>
                <View style={styles.column}>
                    {filteredRecipes.filter((_, i) => i % 2 === 0).map((item, index) => (
                        <CompactRecipeCard key={item.id} recipe={item} index={index} />
                    ))}
                </View>
                <View style={styles.column}>
                    {filteredRecipes.filter((_, i) => i % 2 !== 0).map((item, index) => (
                        <CompactRecipeCard key={item.id} recipe={item} index={index} />
                    ))}
                </View>
            </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '600',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterBtnDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchContainerDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 4,
  },
  filterChipDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
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
  gridContent: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: COLUMN_WIDTH,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  cardOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  caloriesText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: -40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 32,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textDark: {
    color: '#fff',
  },
  textSubDark: {
    color: '#aaa',
  },
});