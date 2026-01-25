import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { CATEGORIES, RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
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
            <Text style={styles.mainGreeting}>{i18n.t('greeting')}, {userProfile.name}!</Text>
            <Text style={styles.subGreeting}>{i18n.t('subGreeting')}</Text>
            
            <Link href="/(tabs)/explore" asChild>
                <TouchableOpacity style={styles.searchBar}>
                    <Ionicons name="search" size={24} color="#E65100" />
                    <Text style={styles.placeholderText}>{i18n.t('searchPlaceholderHome')}</Text>
                </TouchableOpacity>
            </Link>
        </View>

        {/* Featured Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('featured')}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                <Text style={styles.seeAll}>{i18n.t('seeAll')}</Text>
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
                        <Text style={styles.featuredTitle} numberOfLines={2}>{recipe.title}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={14} color="#757575" />
                                <Text style={styles.metaText}>{recipe.time}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="flame-outline" size={14} color="#757575" />
                                <Text style={styles.metaText}>{recipe.calories || 'N/A'}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Link>
            ))}
        </ScrollView>

        {/* Recipe of the Day */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('recipeOfTheDay')}</Text>
        </View>
        
        <Link href={`/recipe/${dailyPick.id}`} asChild>
            <TouchableOpacity style={styles.dailyCard}>
                <Image source={{ uri: dailyPick.image }} style={styles.dailyImage} contentFit="cover" />
                <View style={styles.dailyOverlay}>
                    <View style={styles.dailyBadge}>
                        <Text style={styles.dailyBadgeText}>DAILY PICK</Text>
                    </View>
                    <Text style={styles.dailyTitle}>{dailyPick.title}</Text>
                    <Text style={styles.dailyDesc} numberOfLines={1}>{dailyPick.description}</Text>
                </View>
            </TouchableOpacity>
        </Link>

        {/* Quick Categories */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{i18n.t('categories')}</Text>
        </View>

        <View style={styles.categoriesGrid}>
            {CATEGORIES.slice(0, 4).map((cat) => (
                <Link key={cat.id} href={{ pathname: '/(tabs)/explore', params: { category: cat.name } }} asChild>
                    <TouchableOpacity style={styles.categoryCard}>
                        <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                        <Text style={styles.categoryName}>{cat.name}</Text>
                    </TouchableOpacity>
                </Link>
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
    width: 220,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  featuredImage: {
    width: '100%',
    height: 140,
    borderRadius: 16,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    height: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#757575',
  },
  dailyCard: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  dailyImage: {
    width: '100%',
    height: '100%',
  },
  dailyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dailyBadge: {
    backgroundColor: '#E65100',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  dailyBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dailyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dailyDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});
