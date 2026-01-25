import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from '../../i18n';
import { Recipe } from '../../models/recipe';
import { useStore } from '../../store/useStore';

export default function CreateScreen() {
  const router = useRouter();
  const { addXP, addRecipe, userProfile } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const handleSubmit = async () => {
    if (!title || !description || !ingredients || !steps) {
        Alert.alert(i18n.t('missingInfo'), i18n.t('missingInfoDesc'));
        return;
    }

    setIsSubmitting(true);

    try {
        const newRecipe: Recipe = {
            id: Date.now().toString(), // Simple ID generation
            title,
            description,
            image: image ? { uri: image } : { uri: 'https://via.placeholder.com/400x200?text=No+Image' },
            category: 'User Recipe',
            tags: [],
            time,
            servings: parseInt(servings) || 2,
            calories: 'N/A',
            ingredients: [{
                title: 'Ingredients',
                data: ingredients.split('\n').filter(i => i.trim()).map(i => ({ name: i }))
            }],
            steps: steps.split('\n').filter(s => s.trim()).map(s => ({ instruction: s })),
            isTraditional: false,
            author: {
                name: userProfile.name,
                avatar: userProfile.avatar || ''
            },
            rating: 0,
            reviews: 0
        };

        // Save to local store (Offline support)
        addRecipe(newRecipe);
        
        // Reward user
        addXP(50);
        
        Alert.alert(i18n.t('success'), i18n.t('recipeCreated'), [
            { 
                text: 'OK', 
                onPress: () => {
                    setTitle('');
                    setDescription('');
                    setTime('');
                    setServings('');
                    setIngredients('');
                    setSteps('');
                    setImage(null);
                    router.push('/(tabs)/profile');
                }
            }
        ]);
    } catch (error) {
        console.error(error);
        Alert.alert(i18n.t('error'), i18n.t('createError'));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{i18n.t('createTitle')}</Text>
          <Text style={styles.headerSubtitle}>{i18n.t('createSubtitle')}</Text>
        </View>

        {/* Image Upload */}
        <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
          {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} contentFit="cover" />
          ) : (
              <View style={styles.uploadIconContainer}>
                <Ionicons name="camera" size={32} color="#E65100" />
              </View>
          )}
          {!image && <Text style={styles.uploadText}>{i18n.t('addPhoto')}</Text>}
          {image && (
              <View style={styles.editBadge}>
                  <Ionicons name="pencil" size={16} color="#fff" />
              </View>
          )}
        </TouchableOpacity>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t('recipeTitle')}</Text>
          <TextInput 
            style={styles.input} 
            placeholder={i18n.t('recipeTitlePlaceholder')}
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{i18n.t('prepTime')}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={i18n.t('prepTimePlaceholder')}
              placeholderTextColor="#999"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>{i18n.t('servings')}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={i18n.t('servingsPlaceholder')}
              placeholderTextColor="#999"
              value={servings}
              onChangeText={setServings}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t('description')}</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder={i18n.t('descriptionPlaceholder')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Ingredients */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t('ingredients')}</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder={i18n.t('ingredientsPlaceholder')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={ingredients}
            onChangeText={setIngredients}
          />
        </View>

        {/* Steps */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{i18n.t('steps')}</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder={i18n.t('stepsPlaceholder')}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={steps}
            onChangeText={setSteps}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            <Text style={styles.submitButtonText}>{isSubmitting ? i18n.t('publishing') : i18n.t('publish')}</Text>
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
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#E65100',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
