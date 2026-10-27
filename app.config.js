const appConfig = require('./app.json')

module.exports = {
  ...appConfig.expo,
  plugins: [
    ...(appConfig.expo.plugins || []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: 'ca-app-pub-4135089940496442~1850763865',
        // Android ads are enabled first. Keep iOS on Google's sample ID until
        // the owner creates an iOS AdMob app; the app does not request iOS ads.
        iosAppId: 'ca-app-pub-3940256099942544~1458002511',
      },
    ],
  ],
  extra: {
    ...appConfig.expo.extra,
    posthogProjectToken: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  },
}
