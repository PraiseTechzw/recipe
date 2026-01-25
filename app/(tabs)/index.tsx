import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RECIPES } from '../../data/recipes';
import { getRandomRecipe, getRecipeOfTheDay, getRecommendedRecipes } from '../../services/recommendations';
import { useStore } from '../../store/useStore';

export default function HomeScreen() {
  const router = useRouter();
  const { viewHistory, categoryScores } = useStore();
  
  // Smart Algorithms
  const [featuredRecipe, setFeaturedRecipe] = useState(RECIPES[0]);
  const [dailyPick, setDailyPick] = useState(RECIPES[1]);
  const [recommendations, setRecommendations] = useState(RECIPES.slice(0, 3));

  useEffect(() => {
    // 1. Daily Rotation (Deterministic)
    setDailyPick(getRecipeOfTheDay());

    // 2. Smart Recommendations based on user history
    const smartRecs = getRecommendedRecipes(viewHistory, categoryScores);
    setRecommendations(smartRecs);
    
    // 3. Featured is the top recommendation or a fallback
    if (smartRecs.length > 0) {
        setFeaturedRecipe(smartRecs[0]);
    }
  }, [viewHistory, categoryScores]);

  const handleSurpriseMe = () => {
    const random = getRandomRecipe();
    router.push(`/recipe/${random.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.subGreeting}>Ready to cook something delicious?</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
          </TouchableOpacity>
        </View>

        {/* Featured Card */}
        <Text style={styles.sectionTitle}>Featured Recipe</Text>
        <Link href={`/recipe/${featuredRecipe.id}`} asChild>
          <TouchableOpacity style={styles.featuredCard}>
            <Image source={{ uri: featuredRecipe.image }} style={styles.featuredImage} contentFit="cover" />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.featuredOverlay}>
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>Recipe of the Day</Text>
              </View>
              <Text style={styles.featuredTitle}>{featuredRecipe.title}</Text>
              <Text style={styles.featuredMeta}>{featuredRecipe.time} • {featuredRecipe.calories}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="search" size={24} color="#E65100" />
              </View>
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/saved" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="bookmark" size={24} color="#D32F2F" />
              </View>
              <Text style={styles.actionText}>Saved</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.actionButton} onPress={handleSurpriseMe}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="shuffle" size={24} color="#1976D2" />
            </View>
            <Text style={styles.actionText}>Surprise Me</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
             <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="nutrition" size={24} color="#388E3C" />
            </View>
            <Text style={styles.actionText}>Diet</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Pick */}
        <Text style={styles.sectionTitle}>Daily Inspiration</Text>
        <Link href={`/recipe/${dailyPick.id}`} asChild>
           <TouchableOpacity style={styles.dailyCard}>
             <View style={styles.dailyContent}>
               <Text style={styles.dailyTitle}>{dailyPick.title}</Text>
               <Text style={styles.dailyDesc} numberOfLines={2}>{dailyPick.description}</Text>
               <View style={styles.dailyMeta}>
                 <Ionicons name="time-outline" size={14} color="#666" />
                 <Text style={styles.dailyMetaText}>{dailyPick.time}</Text>
               </View>
             </View>
             <Image source={{ uri: dailyPick.image }} style={styles.dailyImage} contentFit="cover" />
           </TouchableOpacity>
        </Link>

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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  subGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  avatarButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  featuredCard: {
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredBadge: {
    backgroundColor: '#E65100',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  dailyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dailyContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dailyDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  dailyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dailyMetaText: {
    fontSize: 12,
    color: '#666',
  },
  dailyImage: {
    width: 120,
    height: '100%',
  },
});
