import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/theme/useTheme';

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useUIStore();
  const { colors, typography, radius, spacing } = useTheme();

  if (!isLoading) return null;

  return (
    <Modal transparent animationType="fade" visible={isLoading}>
      <View style={styles.container}>
        <View style={[
          styles.card, 
          { 
            backgroundColor: colors.surface, 
            borderRadius: radius.l,
            padding: spacing.l 
          }
        ]}>
          <ActivityIndicator size="large" color={colors.primary} />
          {loadingMessage && (
            <Text style={[
              typography.body, 
              { 
                color: colors.text, 
                marginTop: spacing.m, 
                textAlign: 'center' 
              }
            ]}>
              {loadingMessage}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
