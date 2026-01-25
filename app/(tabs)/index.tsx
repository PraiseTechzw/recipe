import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import { RECIPES } from '../../data/recipes';
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
      <View style={styles.contentContainer}>
        
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

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Greeting & Search */}
        <View style={styles.greetingSection}>
            <Text style={styles.mainGreeting}>{i18n.t('greeting')}, {userProfile.name}!</Text>
            <Text style={styles.subGreeting}>{i18n.t('subGreeting')}</Text>
            
            <Link href="/(tabs)/explore" asChild>
                <TouchableOpacity style={styles.searchBar}>
                    <Ionicons name="search" size={24} color="#E65100" />
                    <Text style={styles.placeholderText}>{i18n.t('searchPlaceholderHome')}</Text>
                    <LinearGradient
                        colors={['#FF8C00', '#E65100']}
                        style={styles.aiButtonHome}
                    >
                        <Ionicons name="scan-outline" size={18} color="#fff" />
                    </LinearGradient>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={styles.featuredList}>
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
                            <View style={styles.authorRow}>
                                <Image source={{ uri: recipe.author?.avatar }} style={styles.smallAvatar} />
                                <Text style={styles.authorName} numberOfLines={1}>{recipe.author?.name}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={14} color="#757575" />
                                <Text style={styles.metaText}>{recipe.time}</Text>
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
                <Image source={{ uri: dailyPick.image }} style={styles.dailyImage} contentFit="cover" transition={1000} />
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} 
                    style={styles.dailyOverlay}
                >
                    <View style={styles.dailyHeader}>
                        <View style={styles.dailyBadge}>
                            <Text style={styles.dailyBadgeText}>DAILY PICK</Text>
                        </View>
                        <View style={styles.authorContainer}>
                            <Image source={{ uri: dailyPick.author?.avatar }} style={styles.mediumAvatar} />
                            <Text style={styles.authorNameLight}>{dailyPick.author?.name}</Text>
                        </View>
                    </View>
                    <Text style={styles.dailyTitle}>{dailyPick.title}</Text>
                    <Text style={styles.dailyDesc} numberOfLines={1}>{dailyPick.description}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Link>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  mainGreeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: '#8D6E63',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  placeholderText: {
    flex: 1,
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  aiButtonHome: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
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
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 24, // Increased for shadow visibility
  },
  featuredCard: {
    width: 260, // Slightly wider for better layout
    marginRight: 20, // More space between cards
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 150,
    borderRadius: 20,
  },
  ratingBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    height: 44,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  smallAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  authorName: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
    flex: 1,
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
    flex: 1,
    width: '100%',
    borderRadius: 30,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F5F5F5',
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
    padding: 24,
    paddingTop: 80, // Extended gradient area
    justifyContent: 'flex-end',
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mediumAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  authorNameLight: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dailyBadge: {
    backgroundColor: '#E65100',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dailyBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dailyDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 20,
  },
});
