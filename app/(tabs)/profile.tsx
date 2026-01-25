import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BADGES, getLevel, getNextLevel } from '../../constants/gamification';
import i18n from '../../i18n';
import { useStore } from '../../store/useStore';

export default function ProfileScreen() {
  const { favorites, userProfile, isDarkMode, toggleDarkMode } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentLevel = getLevel(userProfile.xp);
  const nextLevel = getNextLevel(userProfile.xp);
  
  const xpProgress = nextLevel 
    ? ((userProfile.xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header with Gradient */}
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={['#FF8C00', '#E65100']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientHeader, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>{i18n.t('profile')}</Text>
                    <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: userProfile.avatar || 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editBadge} onPress={() => router.push('/edit-profile')}>
                            <Ionicons name="camera" size={14} color="#E65100" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{userProfile.name}</Text>
                    <Text style={styles.bio}>{currentLevel.title} • Zimbabwe</Text>
                </View>
            </LinearGradient>

            {/* XP Bar Floating */}
            <View style={styles.xpWrapper}>
                <View style={styles.xpRow}>
                    <Text style={styles.xpLabel}>{i18n.t('level')} {currentLevel.level}</Text>
                    <Text style={styles.xpValue}>{userProfile.xp} / {nextLevel ? nextLevel.minXP : 'Max'} XP</Text>
                </View>
                <View style={styles.xpTrack}>
                    <LinearGradient
                        colors={['#FFB74D', '#FB8C00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.xpFill, { width: `${Math.min(xpProgress, 100)}%` }]}
                    />
                </View>
            </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{favorites.length}</Text>
                <Text style={styles.statLabel}>{i18n.t('saved')}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>#{Math.max(1, 1000 - Math.floor(userProfile.xp / 10))}</Text>
                <Text style={styles.statLabel}>{i18n.t('rank')}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.badges.length}</Text>
                <Text style={styles.statLabel}>{i18n.t('badges')}</Text>
            </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{i18n.t('achievements')}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>{i18n.t('viewAll')}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesList}>
                {BADGES.map((badge, i) => {
                    const isUnlocked = userProfile.badges.includes(badge.id);
                    return (
                        <View key={badge.id} style={[styles.badgeItem, !isUnlocked && styles.badgeLocked]}>
                            <View style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
                                <Text style={{ fontSize: 24 }}>{badge.icon}</Text>
                            </View>
                            <Text style={styles.badgeName}>{badge.name}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
            <Text style={styles.menuHeader}>{i18n.t('account')}</Text>
            <View style={styles.menuGroup}>
                <MenuOption icon="person-outline" label={i18n.t('personalInfo')} onPress={() => router.push('/edit-profile')} />
                <MenuOption icon="notifications-outline" label={i18n.t('notifications')} onPress={() => router.push('/notifications')} />
                <View style={styles.menuItem}>
                    <View style={[styles.menuIconBox, { backgroundColor: '#F3E5F5' }]}>
                        <Ionicons name="moon-outline" size={20} color="#7B1FA2" />
                    </View>
                    <Text style={styles.menuText}>{i18n.t('darkMode')}</Text>
                <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{false: '#eee', true: '#E65100'}} thumbColor="#fff" />
            </View>
        </View>

            <Text style={styles.menuHeader}>{i18n.t('support')}</Text>
            <View style={styles.menuGroup}>
                <MenuOption icon="help-circle-outline" label={i18n.t('helpCenter')} />
                <MenuOption icon="star-outline" label={i18n.t('rateUs')} />
            </View>
        </View>

        <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>{i18n.t('logOut')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function MenuOption({ icon, label, color = '#E65100', bg = '#FFF3E0', onPress }: { icon: any, label: string, color?: string, bg?: string, onPress?: () => void }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIconBox, { backgroundColor: bg }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.menuText}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    marginBottom: 60, // Space for the floating stats card
  },
  gradientHeader: {
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  xpWrapper: {
    marginHorizontal: 24,
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  xpTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: -40, // Pull up to overlap header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#eee',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 14,
  },
  badgesList: {
    paddingRight: 20,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  badgeLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  badgeIconLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  badgeName: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 12,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuGroup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  logoutText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
