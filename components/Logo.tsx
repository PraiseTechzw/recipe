import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Logo({ size = 'medium', color = '#1a1a1a' }: { size?: 'small' | 'medium' | 'large', color?: string }) {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 28 : 40;
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 22 : 32;
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
         <Ionicons name="restaurant" size={iconSize} color="#E65100" />
      </View>
      <View>
        <Text style={[styles.textTop, { color: '#8D6E63', fontSize: size === 'small' ? 8 : 10 }]}>TASTE OF</Text>
        <Text style={[styles.textMain, { fontSize, color }]}>ZIMBABWE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 12,
  },
  textTop: {
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: -2,
  },
  textMain: {
    fontWeight: '900',
    letterSpacing: -0.5,
  }
});
