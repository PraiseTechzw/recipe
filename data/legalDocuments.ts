export type LegalSection = { heading: string; body: string };

export const LEGAL_UPDATED = "26 October 2026";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "1. About the service and acceptance",
    body: "Zimbabwe Traditional Recipes is a mobile application for discovering Zimbabwean recipes, creating and saving recipes, organizing pantry ingredients and shopping lists, following cooking steps, and using optional AI-assisted ingredient recognition and recipe suggestions. By accessing or using the app, you agree to these Terms. If you do not agree, do not use the app. These Terms are between you and Praise Masunga, operating as Zimbabwe Traditional Recipes (praisetechzw).",
  },
  {
    heading: "2. Eligibility and accounts",
    body: "You may use the app as a guest or create an account using an email address and password. Use the app only if you are legally able to accept these Terms or with permission from a parent or legal guardian. The app does not currently ask for or verify your age.\n\nYou are responsible for providing accurate account information, protecting your credentials, and activity conducted through your account. Contact praisetechzw@gmail.com if you believe your account has been accessed without permission. Guest and locally stored information may remain only on the device and may not be recoverable after the app is removed or device data is lost. Account sign-in can synchronize certain app state, as described in the Privacy Policy.",
  },
  {
    heading: "3. Acceptable use",
    body: "Use the app lawfully and do not use it to upload or share content that you do not have rights to use, that violates another person's rights, or that is unlawful, harmful, deceptive, or malicious. Do not interfere with the service, attempt unauthorized access, or misuse another person's account.\n\nThe current app does not implement content reporting, user blocking, or a moderation appeal workflow. Contact praisetechzw@gmail.com to raise a concern.",
  },
  {
    heading: "4. Your content and public sharing",
    body: "You retain whatever rights you hold in recipes, text, and images that you submit. When you submit content for cloud publication, you allow Praise Masunga to host, store, display, and share it as needed to operate the recipe and sharing features and make it available to other app users.\n\nOnly submit content you are entitled to share. Publicly uploaded recipes, profile information, and images may be visible to other users or people with access to their public URLs. Do not include private or sensitive information in a public recipe or profile.",
  },
  {
    heading: "5. AI features and recipe information",
    body: "If you choose to use ingredient recognition, the app sends the selected image to OpenRouter for processing. If you request an AI recipe, the app may send ingredient names, pantry items, and preferences you provide, including diet, allergies, time limit, and servings. OpenRouter may route the request to third-party model providers under their applicable terms and data practices.\n\nAI-generated recipes, ingredient recognition, nutrition estimates, and warnings may be inaccurate, incomplete, or unsuitable for your needs. They are suggestions, not professional, medical, dietary, food-safety, or allergy advice. Review all ingredients, quantities, cooking temperatures, preparation steps, and allergen information yourself before cooking or serving food.\n\nThe app currently uses the `openrouter/free` model router. Availability and provider terms may change. See OpenRouter's Terms at https://openrouter.ai/terms.",
  },
  {
    heading: "6. Third-party services",
    body: "The app relies on third-party services, including Supabase for authentication, database, storage and realtime features; OpenRouter and underlying model providers for AI; Expo services for app delivery, device features, performance monitoring and app-usage insights; and Google Mobile Ads for advertising on Android. Their services are subject to their own terms and policies. We do not control third-party services, and their availability and practices may change.",
  },
  {
    heading: "7. Fees",
    body: "The app currently has no in-app purchases, subscriptions, or payment flow.",
  },
  {
    heading: "8. Our intellectual property",
    body: "The app's software, branding, design, and content supplied by us are owned by or licensed to Praise Masunga and are protected by applicable intellectual-property laws. These Terms give you a limited, personal, non-transferable right to use the app for its intended purpose, subject to these Terms and any applicable app-store conditions. They do not transfer ownership of the app or our materials to you.",
  },
  {
    heading: "9. Availability, changes, and ending access",
    body: "We may update, modify, or discontinue parts of the app. We do not promise that every recipe, AI model, sync function, or third-party service will always be available. Updated Terms will be made available in the app.\n\nYou may stop using the app at any time. The current app does not implement account deletion or a self-service termination workflow. Ending use or signing out should not be understood to delete cloud records. Contact praisetechzw@gmail.com for account or data requests.",
  },
  {
    heading: "10. Disclaimers and legal rights",
    body: "To the extent permitted by applicable law, the app and its content are provided “as is” and “as available”. We do not warrant that the app will be uninterrupted, error-free, secure, or that recipes or AI-generated content will be accurate or suitable. Nothing in these Terms excludes a right or liability that cannot lawfully be excluded.",
  },
  {
    heading: "11. Governing law and contact",
    body: "These Terms are subject to the laws that apply to you, including any mandatory consumer protections. Disputes may be brought before a court with jurisdiction under those laws.\n\nQuestions about these Terms: Praise Masunga, Zimbabwe Traditional Recipes, email praisetechzw@gmail.com.",
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "1. Information this app handles",
    body: "Depending on the features you use, the app may handle:\n\n• Account information: email address, password credentials processed by Supabase Auth, and the display name supplied at signup.\n• Profile and community information: profile name, avatar URL/image, biography, dietary preferences, XP, level, badges, cooking statistics, and public leaderboard information such as chef name, avatar seed/country, XP, level, and achievement count.\n• Recipe and cooking information: recipes and images you create or upload, favorites, pantry ingredients, shopping-list items, cooking progress, and achievements.\n• Preferences and interaction history: app language, theme, notification preferences, viewed recipe IDs, and category interaction scores.\n• AI request information: selected/captured ingredient images, ingredient names, pantry items, and preferences such as dietary restrictions, allergies, time limits, and servings.\n• Notification information: on supported native devices, notification permission and an Expo push token. A local daily cooking reminder may be scheduled on-device.\n• Advertising information (Android): Google Mobile Ads and its consent SDK may process device and advertising identifiers, ad requests, approximate location or other device signals, and ad impressions/interactions as described by Google's policies and your consent choices. Advertising is requested only after the Google consent flow reports that requests are allowed.\n• Performance and usage telemetry: EAS Observe records app startup, first-render, interactive and route timing metrics, app version, device/OS details, and a pseudonymous installation ID. Expo Insights records app cold-start usage events for aggregated app-version and platform reporting. Observe may also report JavaScript errors and stack traces. Sensitive route parameters are filtered before route metrics are sent.\n• Optional PostHog analytics: only if enabled in Settings, PostHog receives pseudonymous screen names, broad feature events, and limited counts or categories (for example, recipe category and ingredient/step counts). It does not receive account email, recipe names, ingredient names, AI prompts or generated recipe text. AI performance telemetry is also sent only when enabled and contains metadata, not prompt or response content. Session replay and touch autocapture are disabled.\n• Other technical/service information generated through Supabase, OpenRouter, Expo, Google Mobile Ads, and platform requests; provider-side logs and retention depend on their configurations.",
  },
  {
    heading: "2. Where information is stored",
    body: "Some app state is stored locally in AsyncStorage on your device. If Supabase is configured, the app may create an anonymous Auth session and sync selected state to Supabase. Signing in may restore account-linked app state across devices. Locally stored guest data may be lost if app data is cleared or the app is removed.\n\nSupabase is also used for account authentication, public recipe/profile data, leaderboard records, and image storage. Recipe and avatar buckets allow public reads. Database policies restrict profile, recipe, leaderboard, and image writes to authenticated owners; private app-state rows are restricted to the signed-in user. Publicly published recipes, profiles, leaderboard information, and their images may be visible to other people.\n\nIngredient images and AI prompts are sent through our Supabase Edge Function to OpenRouter and may be processed by a model provider selected through its routing. The OpenRouter key is kept server-side. See OpenRouter's Privacy Policy at https://openrouter.ai/privacy/.",
  },
  {
    heading: "3. How information is used",
    body: "Information is used to provide recipes, accounts, local and cloud sync, recipe sharing, pantry/shopping features, cooking progress, leaderboard/achievement features, preferences, notifications, and AI ingredient/recipe assistance; and to maintain and troubleshoot the service. Recipe views and category interactions are stored for product personalization. The repository does not show that this interaction history is used to train an AI model.",
  },
  {
    heading: "4. Service providers and disclosures",
    body: "Information may be processed by Supabase for authentication, database, storage, and realtime features; OpenRouter and model providers for AI requests; Expo/platform services for app infrastructure, device capabilities, EAS Observe performance and error telemetry, and EAS Insights app-usage reporting; PostHog for optional product analytics and AI performance telemetry when enabled in Settings; and Google Mobile Ads for Android advertising and consent management. Google's advertising services may use device or advertising identifiers and other signals to select and measure ads under Google's policies. The app uses Google's User Messaging Platform (UMP) consent flow; where privacy choices are required, you can reopen them in Settings → Privacy. See Google's Privacy Policy at https://policies.google.com/privacy and Expo's at https://expo.dev/privacy. PostHog's Privacy Policy is at https://posthog.com/privacy. Information may also be disclosed when required by law or necessary to protect rights and safety.",
  },
  {
    heading: "5. Retention",
    body: "Local data remains on your device until removed or overwritten. The app does not set a fixed retention period for account data, public recipes, profiles, leaderboard records, storage images, AI provider requests, Supabase logs, backups, or push tokens. Expo currently documents 90-day retention for EAS Observe metrics, with monthly deletion processing that can leave records for up to 120 days. EAS Insights and other provider-side retention depend on provider policies and configuration. Contact praisetechzw@gmail.com with a data request.",
  },
  {
    heading: "6. Your choices and requests",
    body: "You can use the app as a guest without creating an email/password account. You can enable or disable optional PostHog analytics at any time in Settings → Privacy. When disabled, app analytics and AI performance telemetry are not sent to PostHog. On Android, Google's User Messaging Platform presents privacy choices when required; if the app indicates that choices are required, reopen them using Settings → Privacy → Manage ad privacy choices. You can choose whether to use camera/gallery and notification features by granting or withholding device permissions, and edit some profile/preferences and local app data in the app. The profile “Log out” action signs out of the current Supabase session; it does not delete local or cloud data.\n\nThe app does not provide self-service account deletion, complete data deletion, or data export. You may contact praisetechzw@gmail.com to ask about your information or submit a privacy request. We will handle requests under applicable law and may ask for information needed to verify your request.",
  },
  {
    heading: "7. Security",
    body: "Supabase Auth sessions are configured to persist in AsyncStorage. Database policies restrict private app-state rows to the signed-in user and public profile, recipe, leaderboard, and image writes to authenticated owners. AI requests pass through a Supabase Edge Function, which keeps the OpenRouter key out of the mobile app bundle. These code details do not establish the security of deployed providers or operational practices.",
  },
  {
    heading: "8. Children and international processing",
    body: "The app does not implement an age gate. If you are not legally able to use the app independently, use it only with permission from a parent or legal guardian.\n\nSupabase, OpenRouter/model providers, and Expo may process information in locations outside your country. The precise processing location depends on provider configuration and routing.",
  },
  {
    heading: "9. Changes and contact",
    body: "We may update this policy and will make the current version available in the app. The date above shows when it was last updated.\n\nPrivacy questions or requests: Praise Masunga, Zimbabwe Traditional Recipes, email praisetechzw@gmail.com. You may also contact the data protection authority responsible for your location.",
  },
];
