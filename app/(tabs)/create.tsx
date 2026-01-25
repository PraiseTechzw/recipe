import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

export default function CreateScreen() {
  const router = useRouter();
  const { addXP } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!title || !description) {
        Alert.alert('Missing Info', 'Please provide at least a title and description.');
        return;
    }

    setIsSubmitting(true);

    try {
        // Insert into Supabase
        const { error } = await supabase
            .from('recipes')
            .insert([
                { 
                    title, 
                    description, 
                    time, 
                    servings,
                    // In a real app, handle image upload to Storage and save URL
                    // image: '...' 
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }
        
        Alert.alert('Success', 'Your recipe has been created and synced!', [
            { 
                text: 'OK', 
                onPress: () => {
                    addXP(50); // Reward user
                    setTitle('');
                    setDescription('');
                    setTime('');
                    setServings('');
                    router.push('/(tabs)/profile');
                }
            }
        ]);
    } catch (error) {
        Alert.alert('Error', 'Failed to create recipe. Please ensure Supabase is configured.');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share Your Recipe</Text>
          <Text style={styles.headerSubtitle}>Join the community of Zimbabwean chefs</Text>
        </View>

        {/* Image Upload Placeholder */}
        <TouchableOpacity style={styles.imageUpload}>
          <View style={styles.uploadIconContainer}>
            <Ionicons name="camera" size={32} color="#E65100" />
          </View>
          <Text style={styles.uploadText}>Add Cover Photo</Text>
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Recipe Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Grandma's Sadza"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Prep Time</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 30 mins"
              placeholderTextColor="#999"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Servings</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 4 people"
              placeholderTextColor="#999"
              value={servings}
              onChangeText={setServings}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Tell us about this dish..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Ingredients Placeholder */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <TouchableOpacity>
                <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.placeholderList}>
            <Text style={styles.placeholderText}>No ingredients added yet</Text>
        </View>

        {/* Steps Placeholder */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <TouchableOpacity>
                <Text style={styles.addButton}>+ Add Step</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.placeholderList}>
            <Text style={styles.placeholderText}>No instructions added yet</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Recipe</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  imageUpload: {
    height: 200,
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E65100',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadText: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    color: '#E65100',
    fontWeight: '600',
  },
  placeholderList: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#E65100',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#E65100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
