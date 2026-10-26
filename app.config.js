const appConfig = require('./app.json')

module.exports = {
  ...appConfig.expo,
  extra: {
    ...appConfig.expo.extra,
    posthogProjectToken: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || process.env.EXPO_PUBLIC_POSTHOG_API_KEY,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
  },
}
