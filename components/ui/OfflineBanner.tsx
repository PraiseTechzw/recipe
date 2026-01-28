import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { SyncService } from "../../services/syncService";

interface OfflineBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function OfflineBanner({ 
  message = "You are offline. Some features may be unavailable.",
  onRetry 
}: OfflineBannerProps) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    checkConnection();
    // In a real app, we'd subscribe to NetInfo changes. 
    // For now, we'll check on mount and allow manual retry.
  }, []);

  const checkConnection = async () => {
    const online = await SyncService.checkConnectivity();
    setIsOffline(!online);
  };

  if (!isOffline) return null;

  return (
    <Animated.View 
      entering={FadeInUp} 
      exiting={FadeOutUp} 
      style={styles.container}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#fff" />
        <Text style={styles.text}>{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity onPress={async () => {
          await checkConnection();
          onRetry();
        }} style={styles.retryButton}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  retryText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
  },
});
