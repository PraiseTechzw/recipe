import { ReactNode, useEffect } from 'react'
import { PostHogProvider as PostHogReactNativeProvider } from 'posthog-react-native'
import { useSegments } from 'expo-router'

import { captureAnalyticsScreen, posthog } from '@/lib/posthog'
import { useStore } from '@/store/useStore'

type PostHogProviderProps = {
  children: ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const analyticsEnabled = useStore((state) => state.analyticsEnabled)

  useEffect(() => {
    if (!posthog) return
    void (analyticsEnabled ? posthog.optIn() : posthog.optOut())
  }, [analyticsEnabled])

  if (!posthog || !analyticsEnabled) {
    return children
  }

  return (
    <PostHogReactNativeProvider client={posthog} autocapture={false}>
      <PostHogRouteTracker />
      {children}
    </PostHogReactNativeProvider>
  )
}

function PostHogRouteTracker() {
  const segments = useSegments()
  const routeName = segments.map((segment) => segment.replace(/^\[.*\]$/, ':id')).join('/')

  useEffect(() => {
    if (routeName) captureAnalyticsScreen(routeName)
  }, [routeName])

  return null
}
