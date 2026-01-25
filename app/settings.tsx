import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Preferences</Text>
            
            <View style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="moon-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Dark Mode</Text>
                </View>
                <Switch value={false} trackColor={{false: '#eee', true: '#E65100'}} thumbColor="#fff" />
            </View>

            <View style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="notifications-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Push Notifications</Text>
                </View>
                <Switch value={true} trackColor={{false: '#eee', true: '#E65100'}} thumbColor="#fff" />
            </View>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            
            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="language-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Language</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#999', marginRight: 8 }}>English</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="download-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Offline Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="information-circle-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Version</Text>
                </View>
                <Text style={{ color: '#999' }}>2.0.0</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="document-text-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.item}>
                <View style={styles.itemLeft}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#666" />
                    <Text style={styles.itemText}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
  },
  deleteText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
});
