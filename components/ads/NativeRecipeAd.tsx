import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads'
import { useAds } from './AdsProvider'
import { useTheme } from '../../theme/useTheme'

const PRODUCTION_NATIVE_AD_UNIT = 'ca-app-pub-4135089940496442/1502629753'

export function NativeRecipeAd() {
  const { adsAllowed } = useAds()
  if (Platform.OS !== 'android' || !adsAllowed) return null
  return <LoadedNativeRecipeAd />
}

function LoadedNativeRecipeAd() {
  const { colors } = useTheme()
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null)

  useEffect(() => {
    let active = true
    let loadedAd: NativeAd | undefined
    const adUnitId = __DEV__ ? TestIds.NATIVE : PRODUCTION_NATIVE_AD_UNIT

    void NativeAd.createForAdRequest(adUnitId)
      .then((ad) => {
        if (!active) {
          ad.destroy()
          return
        }
        loadedAd = ad
        setNativeAd(ad)
      })
      .catch((error) => {
        // No-fill is normal. Keep the recipe feed clean when inventory is empty.
        if (__DEV__) console.info('[Ads] Native ad not available.', error)
      })

    return () => {
      active = false
      loadedAd?.destroy()
    }
  }, [])

  if (!nativeAd) return null

  return (
    <NativeAdView nativeAd={nativeAd} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.adLabel, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.adLabelText, { color: colors.textSecondary }]}>Ad</Text>
        </View>
        {nativeAd.advertiser ? (
          <Text numberOfLines={1} style={[styles.advertiser, { color: colors.textSecondary }]}>
            {nativeAd.advertiser}
          </Text>
        ) : null}
      </View>

      <View style={styles.titleRow}>
        {nativeAd.icon?.url ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <Text numberOfLines={2} style={[styles.headline, { color: colors.text }]}>
            {nativeAd.headline}
          </Text>
        </NativeAsset>
      </View>

      {nativeAd.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text numberOfLines={3} style={[styles.body, { color: colors.textSecondary }]}>
            {nativeAd.body}
          </Text>
        </NativeAsset>
      ) : null}

      <NativeMediaView style={styles.media} resizeMode="cover" />

      <View style={styles.footer}>
        <Ionicons name="sparkles-outline" size={17} color={colors.primary} />
        <View style={{ flex: 1 }} />
        {nativeAd.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={[styles.cta, { backgroundColor: colors.primary, color: '#FFFFFF' }]}>
              {nativeAd.callToAction}
            </Text>
          </NativeAsset>
        ) : null}
      </View>
    </NativeAdView>
  )
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 22, borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: 14, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 },
  adLabel: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  adLabelText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  advertiser: { flex: 1, fontSize: 11, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 10 },
  headline: { flex: 1, fontSize: 16, lineHeight: 21, fontWeight: '800' },
  body: { fontSize: 13, lineHeight: 19, marginTop: 9 },
  media: { height: 150, width: '100%', marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 13, gap: 10 },
  cta: { overflow: 'hidden', borderRadius: 11, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, fontWeight: '800' },
})
