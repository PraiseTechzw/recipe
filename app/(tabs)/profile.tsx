import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import { Alert, Dimensions, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BADGES, getLevel, getNextLevel } from '../../constants/gamification';
import i18n from '../../i18n';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { favorites, userProfile, isDarkMode, toggleDarkMode, setLocale, locale, myRecipes } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      i18n.t('logOut'),
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: () => {
             // In a real app, clear auth tokens here
             router.replace('/onboarding');
          }
        }
      ]
    );
  };

  const handleRateUs = async () => {
    if (await StoreReview.hasAction()) {
      StoreReview.requestReview();
    } else {
      Alert.alert('Rate Us', 'Please rate us on the App Store!');
    }
  };

  const handleHelpCenter = () => {
    Alert.alert(i18n.t('helpCenter'), 'Contact support at support@tasteofzimbabwe.com');
  };

  const handleLanguage = () => {
    Alert.alert(
        'Language', 
        'Select Language', 
        [
            { text: 'English', onPress: () => setLocale('en') },
            { text: 'Shona', onPress: () => setLocale('sn') },
            { text: 'Ndebele', onPress: () => setLocale('nd') },
            { text: 'Cancel', style: 'cancel' }
        ]
    );
  };

  const currentLevel = getLevel(userProfile.xp);
  const nextLevel = getNextLevel(userProfile.xp);
  
  const xpProgress = nextLevel 
    ? ((userProfile.xp - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 
    : 100;

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Modern Header Section */}
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={['#FF6B6B', '#E65100']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.gradientHeader, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.profileContent}>
                        <View style={styles.avatarWrapper}>
                            <Image 
                                source={{ uri: userProfile.avatar || 'https://i.pravatar.cc/150?img=12' }} 
                                style={styles.avatar} 
                            />
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>{currentLevel.level}</Text>
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/edit-profile')}>
                                <Ionicons name="pencil" size={16} color="#E65100" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.name}>{userProfile.name}</Text>
                        <Text style={styles.title}>{currentLevel.title}</Text>
                        
                        {/* XP Progress Bar */}
                        <View style={styles.xpContainer}>
                            <View style={styles.xpInfo}>
                                <Text style={styles.xpText}>{userProfile.xp} XP</Text>
                                <Text style={styles.xpText}>{nextLevel ? `${nextLevel.minXP} XP` : 'MAX'}</Text>
                            </View>
                            <View style={styles.xpTrack}>
                                <LinearGradient
                                    colors={['#FFD700', '#FFA000']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.xpFill, { width: `${Math.min(xpProgress, 100)}%` }]}
                                />
                            </View>
                            <Text style={styles.xpNext}>
                                {nextLevel ? `${nextLevel.minXP - userProfile.xp} XP to ${nextLevel.title}` : 'Max Level Reached!'}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </LinearGradient>
            
            {/* Decorative Curve */}
            <View style={[styles.curveLayer, { backgroundColor: isDarkMode ? '#121212' : '#F8F9FA' }]} />
        </View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                    <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="restaurant" size={22} color="#2196F3" />
                    </View>
                    <Text style={[styles.statValue, isDarkMode && styles.textDark]}>{favorites.length}</Text>
                    <Text style={styles.statLabel}>{i18n.t('saved')}</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                    <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
                        <Ionicons name="trophy" size={22} color="#9C27B0" />
                    </View>
                    <Text style={[styles.statValue, isDarkMode && styles.textDark]}>
                        #{Math.max(1, 1000 - Math.floor(userProfile.xp / 10))}
                    </Text>
                    <Text style={styles.statLabel}>{i18n.t('rank')}</Text>
                </View>
                <View style={[styles.statCard, isDarkMode && styles.statCardDark]}>
                    <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="flame" size={22} color="#E65100" />
                    </View>
                    <Text style={[styles.statValue, isDarkMode && styles.textDark]}>3</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </View>
        </Animated.View>

        {/* My Recipes Section */}
        {myRecipes.length > 0 && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>My Recipes</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>{myRecipes.length}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.badgesList}
                    >
                        {myRecipes.map((recipe, i) => (
                            <TouchableOpacity 
                                key={recipe.id} 
                                style={[styles.recipeCard, isDarkMode && styles.recipeCardDark]}
                                // onPress={() => router.push(`/cooking/${recipe.id}`)} 
                            >
                                <Image 
                                    source={recipe.image} 
                                    style={styles.recipeImage} 
                                    contentFit="cover"
                                />
                                <View style={styles.recipeInfo}>
                                    <Text style={[styles.recipeTitle, isDarkMode && styles.textDark]} numberOfLines={1}>{recipe.title}</Text>
                                    <View style={styles.recipeMeta}>
                                        <Ionicons name="time-outline" size={12} color="#999" />
                                        <Text style={styles.recipeTime}>{recipe.time}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Animated.View>
        )}

        {/* Badges Section (Trophy Case) */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>{i18n.t('achievements')}</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>{userProfile.badges.length}/{BADGES.length}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.badgesList}
                decelerationRate="fast"
                snapToInterval={100}
            >
                {BADGES.map((badge, i) => {
                    const isUnlocked = userProfile.badges.includes(badge.id);
                    return (
                        <Animated.View 
                            entering={FadeInRight.delay(400 + (i * 100)).springify()} 
                            key={badge.id} 
                        >
                            <View style={[
                                styles.badgeCard, 
                                isDarkMode && styles.badgeCardDark,
                                !isUnlocked && styles.badgeLocked
                            ]}>
                                <View style={[styles.badgeIconContainer, !isUnlocked && styles.badgeIconLocked]}>
                                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                                    {isUnlocked && (
                                        <View style={styles.checkBadge}>
                                            <Ionicons name="checkmark" size={10} color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.badgeName, isDarkMode && styles.textDark]} numberOfLines={1}>
                                    {badge.name}
                                </Text>
                                <Text style={styles.badgeReward}>+{badge.xpReward} XP</Text>
                            </View>
                        </Animated.View>
                    );
                })}
            </ScrollView>
        </View>

        {/* Menu Actions */}
        <View style={styles.menuContainer}>
            <Text style={styles.menuHeader}>PREFERENCES</Text>
            <View style={[styles.menuGroup, isDarkMode && styles.menuGroupDark]}>
                <MenuOption 
                    icon="person-outline" 
                    label={i18n.t('personalInfo')} 
                    onPress={() => router.push('/edit-profile')} 
                    isDark={isDarkMode}
                />
                <View style={[styles.menuItem, isDarkMode && styles.menuItemDark]}>
                    <View style={[styles.menuIconBox, { backgroundColor: isDarkMode ? '#333' : '#F3E5F5' }]}>
                        <Ionicons name="moon-outline" size={20} color="#7B1FA2" />
                    </View>
                    <Text style={[styles.menuText, isDarkMode && styles.textDark]}>{i18n.t('darkMode')}</Text>
                    <Switch 
                        value={isDarkMode} 
                        onValueChange={toggleDarkMode} 
                        trackColor={{false: '#eee', true: '#E65100'}} 
                        thumbColor="#fff" 
                    />
                </View>
                <MenuOption 
                    icon="language-outline" 
                    label="Language" 
                    color="#009688" 
                    bg={isDarkMode ? '#333' : '#E0F2F1'} 
                    isDark={isDarkMode}
                    onPress={handleLanguage}
                />
            </View>

            <Text style={styles.menuHeader}>SUPPORT</Text>
            <View style={[styles.menuGroup, isDarkMode && styles.menuGroupDark]}>
                <MenuOption icon="help-circle-outline" label={i18n.t('helpCenter')} isDark={isDarkMode} onPress={handleHelpCenter} />
                <MenuOption icon="star-outline" label={i18n.t('rateUs')} isDark={isDarkMode} onPress={handleRateUs} />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#D32F2F" style={{ marginRight: 8 }} />
                <Text style={styles.logoutText}>{i18n.t('logOut')}</Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function MenuOption({ icon, label, color = '#E65100', bg = '#FFF3E0', onPress, isDark }: { icon: any, label: string, color?: string, bg?: string, onPress?: () => void, isDark?: boolean }) {
    return (
        <TouchableOpacity style={[styles.menuItem, isDark && styles.menuItemDark]} onPress={onPress}>
            <View style={[styles.menuIconBox, { backgroundColor: isDark ? '#333' : bg }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.menuText, isDark && styles.textDark]}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#666' : '#ccc'} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  gradientHeader: {
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
  },
  curveLayer: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  levelBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#FFD700',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    fontWeight: '500',
  },
  xpContainer: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  xpText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xpTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpNext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: -20,
    zIndex: 1,
  },
  statCard: {
    backgroundColor: '#fff',
    width: width / 3 - 20,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardDark: {
    backgroundColor: '#1E1E1E',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
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
    gap: 12,
  },
  badgeCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    width: 100,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeCardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  badgeLocked: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badgeIconLocked: {
    backgroundColor: '#EEE',
  },
  badgeEmoji: {
    fontSize: 24,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  recipeCardDark: {
    backgroundColor: '#1E1E1E',
  },
  recipeImage: {
    width: '100%',
    height: 100,
  },
  recipeInfo: {
    padding: 10,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: '#999',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    height: 32, // limit lines
  },
  badgeReward: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 1.2,
  },
  menuGroup: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  menuGroupDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemDark: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
  textDark: {
    color: '#fff',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    marginBottom: 20,
  },
  logoutText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
});