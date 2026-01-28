import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { useStore } from '../store/useStore';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useStore();
  
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState(true);
  const [newBadges, setNewBadges] = useState(true);
  const [newRecipes, setNewRecipes] = useState(false);

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top']}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>{i18n.t('notificationSettings') || 'Notification Settings'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
            {i18n.t('notificationSettingsDesc') || 'Manage which notifications you want to receive.'}
        </Text>

        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
            <View style={styles.item}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isDarkMode && styles.textDark]}>{i18n.t('dailyReminder') || 'Daily Reminder'}</Text>
                    <Text style={styles.itemSubtitle}>{i18n.t('dailyReminderDesc') || 'Get reminded to cook something new every day.'}</Text>
                </View>
                <Switch 
                    value={dailyReminder} 
                    onValueChange={setDailyReminder}
                    trackColor={{false: '#eee', true: '#E65100'}} 
                    thumbColor="#fff" 
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isDarkMode && styles.textDark]}>{i18n.t('weeklyLeaderboard') || 'Weekly Leaderboard'}</Text>
                    <Text style={styles.itemSubtitle}>{i18n.t('weeklyLeaderboardDesc') || 'Updates on the weekly chef leaderboard.'}</Text>
                </View>
                <Switch 
                    value={weeklyLeaderboard} 
                    onValueChange={setWeeklyLeaderboard}
                    trackColor={{false: '#eee', true: '#E65100'}} 
                    thumbColor="#fff" 
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.item}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isDarkMode && styles.textDark]}>{i18n.t('newBadges') || 'New Badges'}</Text>
                    <Text style={styles.itemSubtitle}>{i18n.t('newBadgesDesc') || 'Get notified when you unlock a new badge.'}</Text>
                </View>
                <Switch 
                    value={newBadges} 
                    onValueChange={setNewBadges}
                    trackColor={{false: '#eee', true: '#E65100'}} 
                    thumbColor="#fff" 
                />
            </View>

             <View style={styles.divider} />

            <View style={styles.item}>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, isDarkMode && styles.textDark]}>{i18n.t('newRecipes') || 'New Recipes'}</Text>
                    <Text style={styles.itemSubtitle}>{i18n.t('newRecipesDesc') || 'When new recipes are added to the community.'}</Text>
                </View>
                <Switch 
                    value={newRecipes} 
                    onValueChange={setNewRecipes}
                    trackColor={{false: '#eee', true: '#E65100'}} 
                    thumbColor="#fff" 
                />
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  textDark: {
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  sectionDark: {
    backgroundColor: '#1E1E1E',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 16,
  },
});
