import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../models/recipe';
import { useTheme } from '../theme/useTheme';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { colors, typography, shadows, radius } = useTheme();

  return (
    <Link href={`/recipe/${recipe.id}`} asChild>
      <TouchableOpacity 
        style={[
          styles.card, 
          { backgroundColor: colors.card, borderRadius: radius.m },
          shadows.small
        ]}
        activeOpacity={0.8}
      >
        <Image 
          source={recipe.image ? { uri: recipe.image } : require('../assets/images/placeholder.jpg')} 
          style={styles.image} 
          contentFit="cover" 
          transition={200} 
        />
        <View style={styles.overlay}>
           <View style={styles.badgeContainer}>
             {recipe.tags && recipe.tags.slice(0, 1).map((tag, index) => (
               <View key={index} style={styles.badge}>
                 <Text style={styles.badgeText}>{tag}</Text>
               </View>
             ))}
           </View>
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
            {recipe.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{recipe.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{recipe.calories}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
