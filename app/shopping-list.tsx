import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../i18n';
import { useStore } from '../store/useStore';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { shoppingList, toggleShoppingItem, removeFromShoppingList, clearShoppingList } = useStore();

  const handleClear = () => {
    Alert.alert(
        i18n.t('clear'),
        i18n.t('clearListConfirm'),
        [
            { text: i18n.t('cancel'), style: "cancel" },
            { text: i18n.t('clear'), style: "destructive", onPress: clearShoppingList }
        ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{i18n.t('shoppingList')}</Text>
        <TouchableOpacity onPress={handleClear} disabled={shoppingList.length === 0}>
            <Text style={[styles.clearText, shoppingList.length === 0 && styles.disabledText]}>{i18n.t('clear')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {shoppingList.length === 0 ? (
            <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="basket-outline" size={48} color="#BDBDBD" />
                </View>
                <Text style={styles.emptyTitle}>{i18n.t('emptyList')}</Text>
                <Text style={styles.emptyText}>{i18n.t('emptyListMessage')}</Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={styles.browseButtonText}>{i18n.t('browseRecipes')}</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.list}>
                {shoppingList.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={[styles.itemRow, item.checked && styles.itemChecked]}
                        onPress={() => toggleShoppingItem(item.id)}
                    >
                        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                            {item.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, item.checked && styles.textChecked]}>{item.name}</Text>
                            {item.quantity && <Text style={styles.itemQuantity}>{item.quantity}</Text>}
                        </View>
                        <TouchableOpacity onPress={() => removeFromShoppingList(item.id)} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={20} color="#FF5252" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  clearText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: '#E0E0E0',
  },
  content: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#E65100',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemChecked: {
    backgroundColor: '#F9F9F9',
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  textChecked: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
