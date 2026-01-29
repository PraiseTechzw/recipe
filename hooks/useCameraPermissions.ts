import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";

export function useAppPermissions() {
  const [cameraStatus, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryStatus, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [isLoading, setIsLoading] = useState(false);

  const verifyCameraPermission = useCallback(
    async (shouldAlert: boolean = true) => {
      if (!cameraStatus) {
        // Status not loaded yet
        return false;
      }

      if (cameraStatus.granted) {
        return true;
      }

      if (cameraStatus.canAskAgain) {
        // setIsLoading(true); // Let the hook handle loading state if needed, or remove local loading
        const response = await requestCameraPermission();
        // setIsLoading(false);
        return response.granted;
      }

      // If we can't ask again, guide user to settings
      if (shouldAlert) {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to scan ingredients. Please enable it in system settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    },
    [cameraStatus, requestCameraPermission],
  );

  const verifyMediaLibraryPermission = useCallback(
    async (shouldAlert: boolean = true) => {
      if (!mediaLibraryStatus) return false;

      if (mediaLibraryStatus.granted) {
        return true;
      }

      if (mediaLibraryStatus.canAskAgain) {
        // setIsLoading(true);
        const response = await requestMediaLibraryPermission();
        // setIsLoading(false);
        return response.granted;
      }

      if (shouldAlert) {
        Alert.alert(
          "Permission Required",
          "Photo library access is needed to select ingredients. Please enable it in system settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
      return false;
    },
    [mediaLibraryStatus, requestMediaLibraryPermission],
  );

  return {
    cameraStatus,
    mediaLibraryStatus,
    verifyCameraPermission,
    verifyMediaLibraryPermission,
    isLoading: !cameraStatus || !mediaLibraryStatus,
  };
}
