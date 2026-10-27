# Privacy Policy

The in-app Privacy Policy is maintained as structured sections in [data/legalDocuments.ts](../../data/legalDocuments.ts) and rendered from Settings → Privacy Policy. The public, readable page is [Zimbabwe Traditional Recipes Privacy Policy](https://praisetechzw.github.io/recipe/privacy/).

**Last updated:** 26 October 2026  
**Operator/contact:** Praise Masunga, Zimbabwe Traditional Recipes (`praisetechzw`), praisetechzw@gmail.com.

The policy describes local and synced app data, account and community information, AI image and prompt processing, notifications, EAS Observe performance/error telemetry, EAS Insights app-usage reporting, service providers, retention, and user requests. The in-app structured copy is canonical; update the public page whenever it changes, and check both against actual provider configuration before release.


## PostHog analytics

Optional PostHog product analytics is disabled unless the user enables it in Settings → Privacy. Screen names and feature events use pseudonymous identifiers and limited metadata; recipe names, ingredient names, account email, prompts, and generated recipe text are not included. AI performance telemetry is gated by the same device-local preference and excludes prompt/response content. Session replay and touch autocapture are disabled. The current app sends no PostHog analytics while this preference is off.

## Android advertising

Android uses Google Mobile Ads for native advertising and Google's User Messaging Platform (UMP) for consent/privacy choices. Ad requests begin only after UMP reports that requests are allowed. Google may process device or advertising identifiers, ad requests, approximate location or other device signals, and ad impressions/interactions for ad selection and measurement. If UMP indicates that privacy options are required, the app exposes “Manage ad privacy choices” in Settings → Privacy. Ads are Android-only in this release; iOS ad requests are disabled. See Google's [Privacy Policy](https://policies.google.com/privacy).
