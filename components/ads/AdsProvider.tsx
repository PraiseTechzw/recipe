import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  MobileAds,
} from 'react-native-google-mobile-ads'

type AdsContextValue = {
  adsAllowed: boolean
  privacyOptionsRequired: boolean
  showPrivacyOptions: () => Promise<void>
}

const AdsContext = createContext<AdsContextValue>({
  adsAllowed: false,
  privacyOptionsRequired: false,
  showPrivacyOptions: async () => {},
})

export function AdsProvider({ children }: { children: ReactNode }) {
  const [adsAllowed, setAdsAllowed] = useState(false)
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false)

  useEffect(() => {
    let mounted = true

    const prepareAds = async () => {
      if (Platform.OS !== 'android') return

      try {
        // Refresh UMP state on each launch, show any required message, then
        // initialize only when UMP confirms ad requests are currently allowed.
        await AdsConsent.requestInfoUpdate()
        const consentInfo = await AdsConsent.loadAndShowConsentFormIfRequired()
        if (!mounted) return

        setPrivacyOptionsRequired(
          consentInfo.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
        )
        if (!consentInfo.canRequestAds) return

        await MobileAds().initialize()
        if (mounted) setAdsAllowed(true)
      } catch (error) {
        // Fail closed if consent state cannot be refreshed or the SDK fails.
        console.warn('[Ads] Ad setup unavailable; ads remain disabled.', error)
      }
    }

    void prepareAds()
    return () => {
      mounted = false
    }
  }, [])

  const showPrivacyOptions = useCallback(async () => {
    if (Platform.OS !== 'android' || !privacyOptionsRequired) return
    try {
      const consentInfo = await AdsConsent.showPrivacyOptionsForm()
      setPrivacyOptionsRequired(
        consentInfo.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      )
      setAdsAllowed(consentInfo.canRequestAds)
    } catch (error) {
      console.warn('[Ads] Could not open privacy options.', error)
    }
  }, [privacyOptionsRequired])

  const value = useMemo(
    () => ({ adsAllowed, privacyOptionsRequired, showPrivacyOptions }),
    [adsAllowed, privacyOptionsRequired, showPrivacyOptions],
  )

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>
}

export function useAds() {
  return useContext(AdsContext)
}
