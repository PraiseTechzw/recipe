import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFICATIONS = [
    {
        id: '1',
        title: 'New Recipe Alert!',
        message: 'Check out the new Sadza recipe added by Chef Tinashe.',
        time: '2h ago',
        read: false,
        type: 'recipe'
    },
    {
        id: '2',
        title: 'Badge Unlocked',
        message: 'Congratulations! You unlocked the "Early Bird" badge.',
        time: '1d ago',
        read: true,
        type: 'achievement'
    },
    {
        id: '3',
        title: 'Weekly Roundup',
        message: 'See what was trending in Zimbabwean kitchens this week.',
        time: '2d ago',
        read: true,
        type: 'news'
    }
];

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('notifications')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
            <TouchableOpacity style={[styles.item, !item.read && styles.itemUnread]}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'achievement' ? '#FFF3E0' : '#E3F2FD' }]}>
                    <Ionicons 
                        name={item.type === 'achievement' ? 'trophy' : item.type === 'recipe' ? 'restaurant' : 'newspaper'} 
                        size={20} 
                        color={item.type === 'achievement' ? '#E65100' : '#1976D2'} 
                    />
                </View>
                <View style={styles.content}>
                    <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                {!item.read && <View style={styles.dot} />}
            </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 0,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'flex-start',
  },
  itemUnread: {
    backgroundColor: '#FAFAFA',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  titleUnread: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E65100',
    marginTop: 6,
  },
});
