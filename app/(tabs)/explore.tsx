import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, RECIPES } from '../../data/recipes';
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
  
  const filteredRecipes = searchRecipes(searchQuery, activeCategory);
  
  const trendingRecipe = RECIPES.find(r => r.title.includes('Dovi')) || RECIPES[1];
  const otherTrending = RECIPES.find(r => r.title.includes('Muriwo')) || RECIPES[2];

  const renderContent = () => {
    if (searchQuery.length > 0 || activeCategory !== 'All') {
      return (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={styles.sectionTitle}>
                {filteredRecipes.length} Results
            </Text>
            <View style={styles.gridContainer}>
                {filteredRecipes.map(recipe => (
                    <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                        <TouchableOpacity style={styles.gridCard}>
                            <Image source={{ uri: recipe.image }} style={styles.gridImage} contentFit="cover" />
                            <TouchableOpacity style={styles.favoriteButton}>
                                <Ionicons name="heart" size={16} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.gridContent}>
                                <Text style={styles.gridTitle} numberOfLines={1}>{recipe.title}</Text>
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
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
        </View>
      );
    }

    return (
        <>
            {/* Trending Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending this week</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
                <Link href={`/recipe/${trendingRecipe.id}`} asChild>
                    <TouchableOpacity style={styles.trendingCard}>
                        <Image source={{ uri: trendingRecipe.image }} style={styles.trendingImage} contentFit="cover" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.trendingOverlay}
                        >
                            <View style={styles.trendingTag}>
                                <Ionicons name="trending-up" size={12} color="#E65100" />
                                <Text style={styles.trendingTagText}>TRENDING</Text>
                            </View>
                            <Text style={styles.trendingTitle}>{trendingRecipe.title}</Text>
                            <Text style={styles.trendingMeta}>{trendingRecipe.time} • {trendingRecipe.calories}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Link>

                <Link href={`/recipe/${otherTrending.id}`} asChild>
                    <TouchableOpacity style={styles.trendingCard}>
                        <Image source={{ uri: otherTrending.image }} style={styles.trendingImage} contentFit="cover" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.8)']}
                            style={styles.trendingOverlay}
                        >
                            <View style={[styles.trendingTag, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="leaf" size={12} color="#2E7D32" />
                                <Text style={[styles.trendingTagText, { color: '#2E7D32' }]}>HEALTHY</Text>
                            </View>
                            <Text style={styles.trendingTitle}>{otherTrending.title}</Text>
                            <Text style={styles.trendingMeta}>{otherTrending.time} • {otherTrending.calories}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Link>
            </ScrollView>

            {/* Categories Circles */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={styles.categoriesRow}>
                {CATEGORIES.map((cat) => {
                    const style = CATEGORY_STYLES[cat.name] || { bg: '#F5F5F5', color: '#666', icon: 'restaurant' };
                    return (
                        <TouchableOpacity 
                            key={cat.id} 
                            style={styles.categoryCircleItem}
                            onPress={() => setActiveCategory(cat.name)}
                        >
                            <View style={[styles.categoryCircle, { backgroundColor: style.bg }]}>
                                <MaterialIcons name={style.icon} size={28} color={style.color} />
                            </View>
                            <Text style={styles.categoryLabel}>{cat.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Popular Recipes Grid */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Text style={styles.sectionTitle}>Popular Recipes</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={20} color="#666" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.gridContainer}>
                {RECIPES.map(recipe => (
                    <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                        <TouchableOpacity style={styles.gridCard}>
                            <Image source={{ uri: recipe.image }} style={styles.gridImage} contentFit="cover" />
                            <TouchableOpacity style={styles.favoriteButton}>
                                <Ionicons name="heart" size={16} color="#fff" />
                            </TouchableOpacity>
                            <View style={styles.gridContent}>
                                <Text style={styles.gridTitle} numberOfLines={1}>{recipe.title}</Text>
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
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
        </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore Zimbabwe's Flavors</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#C26A00" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search recipes, ingredients..." 
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
            <TouchableOpacity>
                <Ionicons name="options-outline" size={20} color="#E65100" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity 
            style={[styles.filterChip, activeCategory === 'All' && styles.filterChipActive]}
            onPress={() => setActiveCategory('All')}
          >
            <Text style={[styles.filterText, activeCategory === 'All' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          
          {['Quick Meals', 'Vegetarian', 'Ceremonial'].map((filter) => (
             <TouchableOpacity 
                key={filter} 
                style={[styles.filterChip, activeCategory === filter && styles.filterChipActive]}
                onPress={() => setActiveCategory(filter)}
             >
                <Text style={[styles.filterText, activeCategory === filter && styles.filterTextActive]}>{filter}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>

        {renderContent()}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
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
    width: width * 0.75,
    height: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
    padding: 16,
    paddingTop: 40,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
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
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
