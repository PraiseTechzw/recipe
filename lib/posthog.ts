import Constants from 'expo-constants'
import PostHog from 'posthog-react-native'
import type { PostHogEventProperties } from '@posthog/core'
import { useStore } from '../store/useStore'

const extra = Constants.expoConfig?.extra
const projectToken = extra?.posthogProjectToken as string | undefined
const host = extra?.posthogHost as string | undefined

export const posthog = projectToken && host
  ? new PostHog(projectToken, {
      host,
      // Events are sent only through captureAnalytics after device-local consent.
      captureAppLifecycleEvents: false,
      preloadFeatureFlags: false,
      enableSessionReplay: false,
      logs: {
        serviceName: 'recipe-mobile',
        environment: __DEV__ ? 'development' : 'production',
        serviceVersion: Constants.expoConfig?.version,
      },
    })
  : undefined

export function captureAnalytics(event: string, properties?: PostHogEventProperties) {
  if (!useStore.getState().analyticsEnabled || !posthog) return
  void posthog.capture(event, properties)
}

export function captureAnalyticsScreen(name: string) {
  if (!useStore.getState().analyticsEnabled || !posthog) return
  void posthog.screen(name)
}
