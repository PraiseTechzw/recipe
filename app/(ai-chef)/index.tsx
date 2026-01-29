import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraType, CameraView, FlashMode } from "expo-camera";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPermissions } from "../../hooks/useCameraPermissions";
import { HapticService } from "../../services/haptics";
import { ImageCaptureService } from "../../services/imageCapture";
import { SyncService } from "../../services/syncService";

const { width } = Dimensions.get("window");

export default function CaptureScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const cameraRef = useRef<CameraView>(null);
  const { verifyCameraPermission, verifyMediaLibraryPermission } =
    useAppPermissions();

  const [isProcessing, setIsProcessing] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Animations
  const shutterScale = useSharedValue(1);
  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  useEffect(() => {
    // Check permission on mount
    checkPermissions();
  }, [checkPermissions]);

  const checkPermissions = useCallback(async () => {
    const granted = await verifyCameraPermission();
    setHasPermission(granted);
  }, [verifyCameraPermission]);

  const handleGalleryPick = async () => {
    const isOnline = await SyncService.checkConnectivity();
    if (!isOnline) {
      Alert.alert("Offline", "AI Chef requires an internet connection.");
      return;
    }

    const hasLibPermission = await verifyMediaLibraryPermission();
    if (!hasLibPermission) return;

    HapticService.selection();
    try {
      const result = await ImageCaptureService.pickFromGallery();
      if (result) {
        processAndNavigate(result.uri);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleCapture = async () => {
    const isOnline = await SyncService.checkConnectivity();
    if (!isOnline) {
      Alert.alert("Offline", "AI Chef requires an internet connection.");
      return;
    }

    if (!cameraRef.current) return;

    // Animate Shutter
    shutterScale.value = withSpring(0.8, {}, () => {
      shutterScale.value = withSpring(1);
    });
    HapticService.selection();
    setIsProcessing(true);

    try {
      // 1. Capture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1, // We compress later
        base64: false,
        skipProcessing: true, // Faster capture
      });

      if (photo) {
        HapticService.success();
        // 2. Process (Resize/Compress)
        const processed = await ImageCaptureService.processCameraPhoto(
          photo.uri,
        );
        processAndNavigate(processed.uri, processed.base64);
      }
    } catch {
      // console.error(e);
      Alert.alert("Error", "Failed to capture image.");
      HapticService.error();
      setIsProcessing(false);
    }
  };

  const processAndNavigate = (uri: string, base64?: string) => {
    // Navigate to review - AI Logic deferred
    router.push({
      pathname: "/(ai-chef)/review",
      params: {
        imageUri: uri,
        // ingredients: JSON.stringify([]) // We don't have ingredients yet, passing empty or undefined
      },
    });
    setIsProcessing(false);
  };

  const toggleFlash = () => {
    setFlash((current) => (current === "off" ? "on" : "off"));
    HapticService.selection();
  };

  const toggleCamera = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    HapticService.selection();
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Ionicons name="camera-off-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const granted = await verifyCameraPermission();
            if (!granted) {
              Linking.openSettings();
            } else {
              checkPermissions();
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.closeButtonAbsolute}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
        />
      )}

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
            <Ionicons
              name={flash === "on" ? "flash" : "flash-off"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Content (Crop Frame) */}
        <View style={styles.content}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {isProcessing ? (
              <Animated.View
                entering={FadeIn}
                style={styles.processingContainer}
              >
                <ActivityIndicator size="large" color="#E65100" />
                <Text style={styles.processingText}>Processing...</Text>
              </Animated.View>
            ) : (
              <Text style={styles.guidanceText}>
                Position ingredients within frame
              </Text>
            )}
          </View>
        </View>

        {/* Controls */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={styles.controls}
        >
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleGalleryPick}
            disabled={isProcessing}
          >
            <Ionicons name="images-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCapture}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.captureButton, shutterStyle]}>
              <View style={styles.captureInner} />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleCamera}
            disabled={isProcessing}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    fontSize: 18,
    color: "#333",
    marginVertical: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#E65100",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 25,
  },
  closeButtonAbsolute: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.8,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#E65100",
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#E65100",
    borderTopRightRadius: 16,
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#E65100",
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#E65100",
    borderBottomRightRadius: 16,
  },
  processingContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 16,
  },
  processingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  guidanceText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    opacity: 0.9,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
});
