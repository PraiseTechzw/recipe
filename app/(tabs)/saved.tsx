import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecipeCard from '../../components/RecipeCard';
import { RECIPES } from '../../data/recipes';
import i18n from '../../i18n';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

export default function SavedScreen() {
  const router = useRouter();
  const { favorites } = useStore();
  const [supabaseRecipes, setSupabaseRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSavedRecipes = async () => {
    try {
      setLoading(true);
      
      // Filter local recipes immediately
      // Supabase recipes need fetching if we have favorites that aren't local
      // For simplicity, we'll just try to fetch any favorite IDs from Supabase that look like UUIDs or aren't in local
      // But actually, simpler to just query Supabase for all favorites and let it return what it finds
      
      if (favorites.length === 0) {
        setSupabaseRecipes([]);
        setLoading(false);
        return;
      }

      // Check if we have any potential Supabase IDs (assuming local IDs are simple numbers, Supabase might be UUIDs)
      // or just query all favorites. Supabase will ignore IDs that don't match UUID format if column is UUID, 
      // or return nothing if they don't exist.
      // To be safe against invalid input syntax for UUIDs, we might need to be careful.
      // Assuming 'recipes' table 'id' is uuid. Local IDs "1", "2" might cause error if sent to UUID column.
      
      // Let's filter favorites that are NOT in local RECIPES first, assuming those are the remote ones
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
      fetchSavedRecipes();
    }, [favorites])
  );

  const filteredRecipes = useMemo(() => {
    const localSaved = RECIPES.filter(r => favorites.includes(r.id));
    const all = [...localSaved, ...supabaseRecipes];
    
    if (!searchQuery) return all;
    
    return all.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, supabaseRecipes, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{i18n.t('savedRecipes')}</Text>
          <Text style={styles.headerSubtitle}>{filteredRecipes.length} {i18n.t('items')}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
            style={styles.searchInput}
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

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#E65100" />
        </View>
      ) : filteredRecipes.length === 0 ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.emptyContainer}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2906/2906856.png' }} // Fallback or use local asset if available
            style={{ width: 120, height: 120, opacity: 0.5, marginBottom: 20 }}
            contentFit="contain"
          />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matches found' : i18n.t('noSavedRecipes')}
          </Text>
          <Text style={styles.emptySubText}>
            {searchQuery ? 'Try a different search term' : i18n.t('saveRecipesMessage')}
          </Text>
          {!searchQuery && (
            <Link href="/(tabs)/explore" asChild>
                <TouchableOpacity style={styles.browseButton}>
                    <Text style={styles.browseButtonText}>{i18n.t('browseRecipes')}</Text>
                </TouchableOpacity>
            </Link>
          )}
        </Animated.View>
      ) : (
        <Animated.FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()} layout={Layout.springify()}>
                <RecipeCard recipe={item} />
            </Animated.View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
