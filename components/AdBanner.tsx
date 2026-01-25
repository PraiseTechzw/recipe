import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

// Safely import AdMob to avoid crashes in Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  // We use require() inside a try-catch because the library initializes native modules on import
  // which causes a crash in Expo Go
  const mobileAds = require('react-native-google-mobile-ads');
  BannerAd = mobileAds.BannerAd;
  BannerAdSize = mobileAds.BannerAdSize;
  TestIds = mobileAds.TestIds;
} catch (error) {
  // Fallback for Expo Go or when native module is missing
  console.log('AdMob module not found (running in Expo Go?)');
}

// TODO: Replace with your actual Ad Unit ID
const adUnitId = (TestIds && __DEV__) ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy';

export function AdBanner() {
  if (Platform.OS === 'web') {
      return null; 
  }

  // If AdMob failed to load (Expo Go), show placeholder
  if (!BannerAd || !BannerAdSize) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.text}>AdMob Placeholder (Expo Go)</Text>
          <Text style={styles.subText}>Create a Dev Build to see real ads</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
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
    height: 60,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  text: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  }
});
