import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { CATEGORIES, RECIPES } from '../../data/recipes';
import { getRecipeOfTheDay, getRecommendedRecipes } from '../../services/recommendations';
import { useStore } from '../../store/useStore';

export default function HomeScreen() {
  const router = useRouter();
  const { viewHistory, categoryScores, hasOnboarded, shoppingList, userProfile } = useStore();
  
  // Onboarding Check
  useEffect(() => {
    if (!hasOnboarded) {
        // Redirect to Onboarding Flow instead of just Pantry Check
        const timer = setTimeout(() => {
            router.replace('/onboarding');
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [hasOnboarded]);

  // Smart Algorithms
  const [featuredRecipes, setFeaturedRecipes] = useState(RECIPES.slice(0, 3));
  const [dailyPick, setDailyPick] = useState(RECIPES[1]);

  useEffect(() => {
    // 1. Daily Rotation (Deterministic)
    setDailyPick(getRecipeOfTheDay());

    // 2. Smart Recommendations based on user history
    const smartRecs = getRecommendedRecipes(viewHistory, categoryScores);
    if (smartRecs.length > 0) {
        setFeaturedRecipes(smartRecs.slice(0, 5));
    }
  }, [viewHistory, categoryScores]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Logo size="medium" />
          <View style={styles.headerRight}>
              <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={() => router.push('/shopping-list')}
              >
                  <Ionicons name="basket-outline" size={24} color="#333" />
                  {shoppingList.length > 0 && <View style={styles.badge} />}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                  <View style={styles.avatarContainer}>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{userProfile.chefLevel.charAt(0)}</Text>
                    </View>
                  </View>
              </TouchableOpacity>
            </View>
        </View>

        {/* Greeting & Search */}
        <View style={styles.greetingSection}>
            <Text style={styles.mainGreeting}>Mhoro, {userProfile.name}!</Text>
            <Text style={styles.subGreeting}>What are we cooking today?</Text>
            
            <Link href="/(tabs)/explore" asChild>
                <TouchableOpacity style={styles.searchBar}>
                    <Ionicons name="search" size={24} color="#E65100" />
                    <Text style={styles.placeholderText}>Search for Sadza, Mopane worms...</Text>
                </TouchableOpacity>
            </Link>
        </View>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Traditional Dishes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {featuredRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`} asChild>
                    <TouchableOpacity style={styles.featuredCard}>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: recipe.image }} style={styles.featuredImage} contentFit="cover" />
                            <View style={styles.ratingBadge}>
                                <Ionicons name="star" size={12} color="#E65100" />
                                <Text style={styles.ratingText}>{recipe.rating || 4.8}</Text>
                            </View>
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle} numberOfLines={1}>{recipe.title}</Text>
                            <View style={styles.cardMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={14} color="#8D6E63" />
                                    <Text style={styles.metaText}>{recipe.time}</Text>
                                </View>
                                <View style={styles.dotSeparator} />
                                <View style={styles.metaItem}>
                                    <View style={styles.greenDot} />
                                    <Text style={styles.metaText}>Easy</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.arrowButton}>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </Link>
            ))}
        </ScrollView>

        {/* Categories Grid */}
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Explore by Category</Text>
        <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat, index) => (
                 <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: cat.name } })}>
                    <View style={[styles.iconCircle, { backgroundColor: getCategoryColor(index) }]}>
                        <MaterialIcons name={cat.icon as any} size={24} color="#E65100" />
                    </View>
                    <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{cat.name}</Text>
                        <Text style={styles.categorySubtitle}>{cat.subtitle || 'Traditional'}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getCategoryColor = (index: number) => {
    const colors = ['#FFF3E0', '#E8F5E9', '#FCE4EC', '#E3F2FD'];
    return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 100, // Space for tab bar
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E65100',
  },
  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#fff',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#E65100',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  levelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  greetingSection: {
    marginBottom: 32,
  },
  mainGreeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 18,
    color: '#8D6E63',
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 30, // Fully rounded
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  placeholderText: {
    color: '#999',
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  featuredList: {
    paddingRight: 20,
    marginBottom: 32,
  },
  featuredCard: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative', // For arrow button positioning
  },
  imageContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8D6E63',
    fontWeight: '500',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  arrowButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%', // Slightly less than 50% to account for gap
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4, // Spacing between rows if wrapped
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#8D6E63',
  },
});
