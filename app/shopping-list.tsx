import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

export default function ShoppingListScreen() {
  const router = useRouter();
  const { shoppingList, toggleShoppingItem, removeFromShoppingList, clearShoppingList } = useStore();

  const handleClear = () => {
    Alert.alert(
        "Clear List",
        "Are you sure you want to clear your shopping list?",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearShoppingList }
        ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity onPress={handleClear} disabled={shoppingList.length === 0}>
            <Text style={[styles.clearText, shoppingList.length === 0 && styles.disabledText]}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {shoppingList.length === 0 ? (
            <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="basket-outline" size={48} color="#BDBDBD" />
                </View>
                <Text style={styles.emptyTitle}>Your list is empty</Text>
                <Text style={styles.emptyText}>Add ingredients from recipes to help you shop for your next meal.</Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/explore')}>
                    <Text style={styles.browseButtonText}>Browse Recipes</Text>
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
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 24,
    lineHeight: 20,
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
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemChecked: {
    backgroundColor: '#FAFAFA',
    borderColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxChecked: {
    backgroundColor: '#E65100',
    borderColor: '#E65100',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textChecked: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
});
