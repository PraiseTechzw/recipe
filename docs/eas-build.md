# EAS Android builds

The production profile explicitly uses the EAS `production` environment and creates an Android App Bundle (`.aab`). `npm run eas-build:local` runs the EAS production build on this machine; `npm run eas-build` starts an EAS cloud build. The app version comes from `app.json` and is mirrored in `package.json`.

## Required app configuration

Set these variables for EAS **production** and in your local ignored `.env` when making local builds:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (the legacy `EXPO_PUBLIC_SUPABASE_ANON_KEY` is also supported)

They are public app configuration and will be included in the mobile bundle. They must not be treated as private credentials. The OpenRouter key is not needed in the app build: configure it as `OPENROUTER_API_KEY` in the Supabase project's Edge Function secrets.

In an Expo account that has access to the linked EAS project, configure production variables using the dashboard or:

```bash
eas env:set --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --environment production --visibility plaintext
eas env:set --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "YOUR_SUPABASE_PUBLISHABLE_KEY" --environment production --visibility sensitive
```

Confirm the variable names in EAS without printing the values:

```bash
eas env:list production --format short
```

For local builds, make sure the local `.env` has both variables and uses the production Supabase project. Local EAS builds need an authenticated Expo account with access to the project ID in `app.json`, Android SDK/NDK tools, and usable Android signing credentials. Local builds do not support EAS environment variables with Secret visibility; those values must be set in the local environment. Do not put any service-role or AI provider key in the app bundle.

## Increment version and build

The patch-version command increments `expo.version` in `app.json` and syncs `package.json`:

```bash
npm run bump-version
npm run eas-build:local
```

EAS also manages Android's internal `versionCode` remotely because `appVersionSource` is set to `remote` and production `autoIncrement` is enabled. Avoid incrementing a version repeatedly for retries of the same release; bump once for a release, then rerun the build if needed.

The current shell account must be authorized for the EAS project. If EAS returns `Entity Not Authorized` for the project ID, log in to the Expo account that owns the project or have its owner grant the current account project access. Do not replace the project ID to work around an access denial: doing so can disconnect existing builds, credentials and updates.

For Play Store submission, first review the generated `.aab`, then use the established EAS submission profile only after confirming the Play service account and desired track.
