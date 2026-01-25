import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useStore();
  
  const [name, setName] = useState(userProfile.name);
  const [chefLevel, setChefLevel] = useState(userProfile.chefLevel);
  const [avatar, setAvatar] = useState(userProfile.avatar);

  const handleSave = () => {
    setUserProfile({
        ...userProfile,
        name,
        chefLevel,
        avatar
    });
    router.back();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.avatarSection}>
            <Image 
                source={{ uri: avatar || 'https://i.pravatar.cc/150?img=12' }} 
                style={styles.avatar} 
            />
            <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
                <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
                style={styles.input} 
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Chef Level</Text>
            <View style={styles.levelContainer}>
                {['Beginner', 'Home Cook', 'Pro'].map((level) => (
                    <TouchableOpacity 
                        key={level} 
                        style={[styles.levelChip, chefLevel === level && styles.levelChipActive]}
                        onPress={() => setChefLevel(level as any)}
                    >
                        <Text style={[styles.levelText, chefLevel === level && styles.levelTextActive]}>{level}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Write a short bio..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />
        </View>

      </ScrollView>
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
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changePhotoBtn: {
    padding: 8,
  },
  changePhotoText: {
    color: '#E65100',
    fontWeight: '600',
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },
  levelChipActive: {
    backgroundColor: '#FFF3E0',
    borderColor: '#E65100',
  },
  levelText: {
    fontSize: 14,
    color: '#666',
  },
  levelTextActive: {
    color: '#E65100',
    fontWeight: '600',
  },
});
