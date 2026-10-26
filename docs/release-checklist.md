# Production release checklist

Use this checklist before each public release. Repository checks cannot confirm live Google Play, EAS, Supabase or GitHub settings.

## Repository and build

- [ ] CI passes on the release commit; review the diff and database migrations.
- [ ] Set matching `expo.version` and `package.json` version; confirm Android `versionCode` / EAS remote app versioning.
- [ ] Confirm `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exist in EAS **production** environment; these are public client configuration, not secret credentials. Keep `OPENROUTER_API_KEY` only in Supabase Function secrets.
- [ ] Build a signed production Android artifact with the intended EAS production profile.
- [ ] Validate on a physical Android device, including fresh install, upgrade, offline, account, guest, recipe, pantry, saved, AI and notification flows.
- [ ] Confirm app icon, splash screen, adaptive icon, permissions, deep links, accessibility, and target SDK on the submitted build.
- [ ] Keep signing keys and service-account JSON out of Git; rotate credentials if they were ever exposed.

## Google Play listing and policy

- [ ] Confirm the store title and developer name, screenshots, support email and privacy-policy URL.
- [ ] Replace stale Gemini release notes and review all listing claims against shipped features.
- [ ] Reconcile the Play Data safety form with actual account data, public content, Supabase synchronization, AI image/prompt processing and service-provider practices. The repository cannot update the Play Console declaration.
- [ ] Confirm the target age/audience and complete the applicable content rating, data safety, app-access and policy declarations.
- [ ] Assess the current lack of in-app account deletion/export and user-generated-content reporting/blocking against Google Play requirements before public rollout.
- [ ] Publish the Play build and verify its listing/install availability before announcing a GitHub Release for the update prompt.

## Supabase and AI

- [ ] Apply every ordered migration to the production Supabase project, including `20261026040000_secure_public_writes.sql`; inspect the project schema and policies afterward.
- [ ] Enable anonymous auth if guest cloud sync is intended; verify email confirmation and password reset configuration.
- [ ] Deploy the `openrouter-completion` Edge Function and set `OPENROUTER_API_KEY` as a Supabase secret, never as an Expo public variable.
- [ ] Test authorization, rate limits, error handling, storage bucket policies and account restore using production-like accounts.
- [ ] Verify the production OpenRouter routing, data handling terms and provider behavior.
- [ ] Decide how leaderboard writes are safely produced. The latest security migration intentionally removes untrusted client writes; confirm a trusted server-side writer or keep leaderboard contribution disabled.
- [ ] Confirm backup, retention, region, monitoring, incident response and support ownership in provider consoles.

## User protection and operations

- [ ] Decide and implement account/data deletion and public-content removal requests, including Auth, app-state rows, recipes and storage images.
- [ ] Add and operate user-content reporting/moderation workflows before treating public recipe sharing as a production community feature.
- [ ] Confirm age eligibility, legal operator/contact details, retention periods and the approved Terms/Privacy wording with qualified counsel.
- [ ] Verify in-app Privacy and Terms match the hosted policies and live processing.
- [ ] Review Google Play Data safety disclosures for EAS Observe performance/error metrics and EAS Insights cold-start/app-usage telemetry before releasing the build that contains those SDKs.
- [ ] Configure GitHub Pages (**Settings → Pages → GitHub Actions**) and ensure `https://praisetechzw.github.io/recipe/` is live.
- [ ] After the Play rollout, publish a matching GitHub Release to update `update.json` and trigger update prompts in supported app builds.
- [ ] Check crash-free installs, support inbox and store feedback after staged rollout; pause rollout if critical issues appear.

## Current known gaps from repository inspection

- No self-service account deletion, full data export or formal consent-preferences UI is present.
- No in-app user-content report, block or moderation appeal flow is present.
- Leaderboard reads are public, while direct client writes were removed for security; a trusted write path is not present in the inspected repo.
- The emulator's current home screen had missing remote recipe-card imagery; verify image URLs, storage/network access and empty-image fallbacks in a production build.
- The live Play Store Data safety and release-note copy must be reviewed in Play Console; a code change cannot update those fields.
