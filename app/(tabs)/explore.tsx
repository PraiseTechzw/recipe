import { StyleSheet, ScrollView, View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { RECIPES, CATEGORIES } from '../../data/recipes';
import RecipeCard from '../../components/RecipeCard';
import { Colors } from '../../constants/theme';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { searchRecipes } from '../../services/recommendations';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredRecipes = searchRecipes(searchQuery, activeCategory);
  
  const trendingRecipe = RECIPES[1]; // Dovi

  const renderContent = () => {
    if (searchQuery.length > 0 || activeCategory !== 'All') {
        return (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
                <Text style={styles.sectionTitle}>
                    {filteredRecipes.length} Results
                </Text>
                {filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
                {filteredRecipes.length === 0 && (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Ionicons name="search-outline" size={48} color="#ccc" />
                        <Text style={{ marginTop: 10, color: '#666' }}>No recipes found.</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <>
            {/* Trending */}
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
                <View style={styles.trendingOverlay}>
                    <Text style={styles.trendingLabel}>↗ TRENDING</Text>
                    <Text style={styles.trendingTitle}>{trendingRecipe.title}</Text>
                    <Text style={styles.trendingMeta}>{trendingRecipe.time} • {trendingRecipe.calories}</Text>
                </View>
                </TouchableOpacity>
            </Link>
            {/* Duplicate for demo scroll */}
            <Link href={`/recipe/${RECIPES[2].id}`} asChild>
                <TouchableOpacity style={[styles.trendingCard, { marginLeft: 16 }]}>
                <Image source={{ uri: RECIPES[2].image }} style={styles.trendingImage} contentFit="cover" />
                <View style={styles.trendingOverlay}>
                    <Text style={styles.trendingLabel}>↗ HEALTHY</Text>
                    <Text style={styles.trendingTitle}>{RECIPES[2].title}</Text>
                    <Text style={styles.trendingMeta}>{RECIPES[2].time} • {RECIPES[2].calories}</Text>
                </View>
                </TouchableOpacity>
            </Link>
            </ScrollView>

            {/* Categories Grid */}
            <Text style={[styles.sectionTitle, { marginTop: 24, paddingHorizontal: 16 }]}>Categories</Text>
            <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                    key={cat.id} 
                    style={styles.categoryItem}
                    onPress={() => setActiveCategory(cat.name)}
                >
                <View style={styles.categoryIconContainer}>
                    <MaterialIcons name={cat.icon as any} size={24} color="#E65100" />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
            ))}
            </View>

            {/* Popular Recipes */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Popular Recipes</Text>
            <TouchableOpacity>
                <MaterialIcons name="filter-list" size={24} color="#666" />
            </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 16 }}>
                {RECIPES.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
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
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search recipes, ingredients..." 
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
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
          
          {CATEGORIES.map(cat => (
             <TouchableOpacity 
                key={cat.id} 
                style={[styles.filterChip, activeCategory === cat.name && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat.name)}
             >
                <Text style={[styles.filterText, activeCategory === cat.name && styles.filterTextActive]}>{cat.name}</Text>
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
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersScroll: {
    marginTop: 16,
    paddingLeft: 16,
  },
  filtersContent: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterChipActive: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  filterText: {
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
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#E65100',
    fontWeight: '600',
  },
  trendingContainer: {
    paddingHorizontal: 16,
  },
  trendingCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)', // Gradient simulation
  },
  trendingLabel: {
    color: '#FFA726',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendingTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendingMeta: {
    color: '#eee',
    fontSize: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0', // Light orange
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  popularList: {
    paddingHorizontal: 16,
  },
});
