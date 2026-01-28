import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationService } from '../services/notificationService';
import { useTheme } from '../theme/useTheme';

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
  const { colors, typography, spacing } = useTheme();

  const handleTestNotification = async () => {
    await NotificationService.sendLocalNotification(
        "Test Notification", 
        "This is how your notifications will look! 🍲"
    );
    Alert.alert("Sent!", "You should see a notification in a few seconds.");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.text }]}>{i18n.t('notifications')}</Text>
        <TouchableOpacity onPress={handleTestNotification} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
            <TouchableOpacity 
                activeOpacity={0.7}
                style={[
                    styles.item, 
                    { borderBottomColor: colors.border },
                    !item.read && { backgroundColor: colors.surface }
                ]}
            >
                <View style={[styles.iconBox, { backgroundColor: item.type === 'achievement' ? '#FFF3E0' : '#E3F2FD' }]}>
                    <Ionicons 
                        name={item.type === 'achievement' ? 'trophy' : item.type === 'recipe' ? 'restaurant' : 'newspaper'} 
                        size={20} 
                        color={item.type === 'achievement' ? '#E65100' : '#1976D2'} 
                    />
                </View>
                <View style={styles.content}>
                    <Text style={[typography.h4, { color: colors.text }, !item.read && { fontWeight: 'bold' }]}>{item.title}</Text>
                    <Text style={[typography.body, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
                    <Text style={[typography.caption, { color: colors.textTertiary }]}>{item.time}</Text>
                </View>
                {!item.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
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
