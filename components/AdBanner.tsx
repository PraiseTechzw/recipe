import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// TODO: Replace with your actual Ad Unit ID
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

export function AdBanner() {
  // In Expo Go or web, native ads won't work easily without a dev build.
  // We'll show a placeholder in development or if not on native.
  
  if (Platform.OS === 'web') {
      return null; 
  }

  // Safety check for Expo Go (Constants.appOwnership is deprecated but simple check)
  // For now, we return the real component but wrapped in Error Boundary logic implied by usage
  // However, react-native-google-mobile-ads crashes in Expo Go.
  // So we will just render a placeholder text if we are likely in a managed env without native code.
  // Since we can't easily detect "Expo Go" vs "Dev Client" perfectly without extra libs, 
  // and the user might be using Expo Go, we'll return a placeholder to prevent crashes for now.
  // To enable real ads, uncomment the BannerAd component below when running a development build.

  return (
    <View style={styles.container}>
      {/* 
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      /> 
      */}
      <View style={styles.placeholder}>
        <Text style={styles.text}>Advertisement (AdMob Configured)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  placeholder: {
    width: 320,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    color: '#999',
  }
});
