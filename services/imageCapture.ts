import * as ImagePicker from 'expo-image-picker';
import { prepareImageForAI, ProcessedImage } from '../utils/imagePrep';

/**
 * Service to handle image picking and normalization.
 */
export const ImageCaptureService = {
  /**
   * Launches the system gallery to pick an image.
   * Returns the processed (resized, compressed, base64) image.
   */
  async pickFromGallery(): Promise<ProcessedImage | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Allow user to crop if they want
        quality: 1, // We control quality in prepareImageForAI
        base64: false, // We read it later
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      // Normalize
      return await prepareImageForAI(result.assets[0].uri);
    } catch (error) {
      console.error("Gallery pick error:", error);
      throw error;
    }
  },

  /**
   * Processes a photo captured from Expo Camera.
   * @param uri - URI of the captured photo
   */
  async processCameraPhoto(uri: string): Promise<ProcessedImage> {
    try {
      return await prepareImageForAI(uri);
    } catch (error) {
      console.error("Camera process error:", error);
      throw error;
    }
  }
};
