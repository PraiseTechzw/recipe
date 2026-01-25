import { Ionicons } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeCard from '../../components/RecipeCard';
import { RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export default function SavedScreen() {
  const { favorites } = useStore();
  const [supabaseRecipes, setSupabaseRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupabaseRecipes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        // console.error('Error fetching recipes:', error);
        // Fail silently or show empty for now if table doesn't exist
        setSupabaseRecipes([]);
      } else if (data) {
        // Transform to match Recipe interface
        const formatted = data.map(r => ({
            id: r.id,
            title: r.title,
            image: r.image,
            time: r.time,
            category: r.category,
            description: r.description,
            ingredients: r.ingredients || [],
            steps: r.steps || [],
            calories: 'N/A', // Default
            tags: ['Community'], // Default
            servings: '2-4'
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
      fetchSupabaseRecipes();
    }, [])
  );

  const localFavorites = RECIPES.filter(r => favorites.includes(r.id));
  const allRecipes = [...supabaseRecipes, ...localFavorites];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('savedRecipes')}</Text>
        <Text style={styles.headerSubtitle}>{allRecipes.length} items</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#E65100" />
        </View>
      ) : allRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{i18n.t('noSavedRecipes')}</Text>
          <Text style={styles.emptySubText}>{i18n.t('saveRecipesMessage')}</Text>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={styles.browseButton}>
                <Text style={styles.browseButtonText}>{i18n.t('browseRecipes')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={allRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
