import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Card } from './Card';
import { XPBadge } from './XPBadge';
import { Ionicons } from '@expo/vector-icons';

interface RecipeCardProps {
  title: string;
  imageUrl?: string;
  duration: number; // minutes
  difficulty: string;
  xp?: number;
  rating?: number;
  isFavorite?: boolean;
  onPress: () => void;
  onFavoritePress?: () => void;
}

export function RecipeCardUI({ 
  title, 
  imageUrl, 
  duration, 
  difficulty, 
  xp, 
  rating, 
  isFavorite, 
  onPress,
  onFavoritePress
}: RecipeCardProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <Card onPress={onPress} style={{ padding: 0, overflow: 'hidden' }}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/300' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        {!!xp && (
          <View style={[styles.badgeContainer, { top: spacing.s, left: spacing.s }]}>
            <XPBadge xp={xp} />
          </View>
        )}
        {!!onFavoritePress && (
          <TouchableOpacity 
            onPress={onFavoritePress}
            style={[
              styles.favoriteButton, 
              { 
                top: spacing.s, 
                right: spacing.s,
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: radius.round,
                padding: 6
              }
            ]}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? colors.error : colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={{ padding: spacing.m }}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.xs }]} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              {duration} min
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="restaurant-outline" size={14} color={colors.textSecondary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              {difficulty}
            </Text>
          </View>
          {!!rating && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
  },
  favoriteButton: {
    position: 'absolute',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
