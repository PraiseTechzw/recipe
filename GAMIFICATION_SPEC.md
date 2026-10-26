# Cooking progress and achievements

## Active implementation

The app has one active gamification store: `store/useStore.ts`, persisted under `recipe-app-storage`. It awards 50 XP for creating a recipe and completing a cook, 5 XP the first time a recipe is favorited, and the configured XP reward when a badge unlocks. XP, level, cooking statistics, badges, and weekly XP are included in the user's private `chef_app_state` sync.

Cooking streaks use the device's local calendar day. The first completed cook on a day increments the streak once; additional cooks that day do not. Cooking progress is guarded against repeat completion callbacks. Weekly XP uses a Monday-start UTC week key so it matches the server leaderboard sync.

## Achievements

Every badge in `constants/gamification.ts` is connected to an event:

- First Cook: complete a recipe.
- Week Streak: cook on seven consecutive local calendar days.
- Flavor Explorer: cook in three different recipe categories.
- Early Bird: complete a breakfast recipe before 09:00 local time.
- Night Owl: complete a recipe from 22:00 local time onward.
- Healthy Habit: complete five recipes tagged Healthy.
- Sweet Tooth: complete three recipes tagged Dessert or categorized as dessert.
- Master Chef: reach level 10.
- Collector: save 20 recipes.
- Sharer: share a recipe through the native share sheet.

Badge unlocks are idempotent and grant their configured XP reward.

## Leaderboard synchronization

Client writes to public leaderboard tables remain disabled. After private app state syncs, the authenticated `sync-leaderboard` Edge Function reads only that caller's saved state using the service role and updates the corresponding chef and leaderboard rows. The function derives level from XP and validates score fields. Deploy it with `supabase functions deploy sync-leaderboard --project-ref <project-ref>` after applying the ordered migrations.

This protects other users' rows and prevents direct public table writes. App progress is still generated on the device, so leaderboard scores are motivational and must not be used for prizes or other valuable rewards.
