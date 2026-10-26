# Store update notices

The mobile app checks the public GitHub Pages feed at `https://praisetechzw.github.io/recipe/update.json` on launch and when it returns to the foreground, no more often than every six hours. When the feed version is newer than the installed app, it offers an update prompt that opens the official Google Play listing. The prompt is shown once per published version. The check is best-effort and does not block app startup.

## Publishing a Play Store update

1. Build and submit the new Android version through EAS/Google Play as usual. Increase `expo.version` in `app.json` and keep `package.json` in sync.
2. Wait until the release is available to users on Google Play.
3. Create and publish a GitHub Release in `PraiseTechzw/recipe` using the matching version tag, for example `v2.0.3`.
4. The `Deploy GitHub Pages` workflow runs on the published release, reads the newest release tag, and regenerates `docs/update.json` with that version and the Play Store URL.

This sequence avoids prompting existing users before the Play Store release is actually available. A Play Console change alone cannot trigger the feed: Google Play does not provide a public, unauthenticated endpoint for the app to poll for a new release. The GitHub Release is the publish signal.

## One-time GitHub setup

In repository **Settings → Pages**, set the build and deployment source to **GitHub Actions**. Confirm that GitHub Actions can deploy to Pages. The repository must be publicly reachable at `https://praisetechzw.github.io/recipe/` for the in-app checker and public documentation to work. The app needs to include the update-check code in a Play Store build before existing installs can receive prompts.

The current app already uses Expo Updates package, but this store version check is separate: Expo OTA updates do not install a new Google Play binary or replace Play's review/update process.
