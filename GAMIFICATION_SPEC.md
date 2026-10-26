# Cooking progress and achievements

This document describes the current implementation, not a guarantee that every scoring path is enabled in every app flow. Source of truth: `engines/gamificationEngine.ts`, `stores/gamificationStore.ts`, and `types/gamification.ts`.

## Persistence and identity

Gamification state is persisted locally in AsyncStorage under `gamification-storage`. It includes a generated chef ID, display name, avatar seed, XP, level, unlocked achievement IDs, weekly XP and cooking statistics. This local state is not authoritative server state. Public leaderboard rows are readable, but the latest security migration removes direct client writes; a trusted leaderboard writer is not currently included in the repository.

## XP rules in the engine

| Event | Current award |
|---|---:|
| Complete a recipe | 50 XP |
| Step streak | 2 XP per reported step |
| Pantry match recipe | 20 XP |
| First recipe in a category | 30 XP |
| Recipe completion streak bonus | 50 + 10 × current streak days, capped at 150 XP |
| Completion within 10% of estimated time | 25 XP |
| Add a review | 15 XP |
| Unlock an achievement | Achievement-specific award |

Streak and bonus calculation are client-side. The current logic can award the completion streak bonus for each completion event; it does not enforce once-per-calendar-day bonus eligibility. Treat XP as a motivational display, not as a secure reward or financial value.

## Levels

The engine uses fixed XP thresholds from level 1 through 20: `0, 100, 250, 500, 850, 1300, 1900, 2650, 3550, 4650, 6000, 7600, 9500, 11700, 14250, 17200, 20600, 24500, 28950, 34000`. Above level 20, it estimates levels using `floor((XP / 100)^(1 / 1.5)) + 1`.

## Achievement catalogue

The engine defines achievements for first recipe, 7/30-day streaks, ten pantry matches, five reviews, five cuisine categories, speed, no-pause completion, sharing, healthy and dessert recipes, saving 20 favourites, and 100 completed recipes. Each definition and award is maintained in `engines/gamificationEngine.ts`.

Some counters or events may not be connected to a user-facing action in every current route. Check event dispatch call sites before presenting a particular achievement as obtainable in a release.

## Weekly score

The store calculates a Monday-start week in local device time and resets local weekly XP when the stored week changes. This is a device-local display and is not a trusted global competition score.

## Production constraints

- State is stored on-device and may not follow a guest to another device.
- Client-side score updates can be altered and must not be used for prizes or other valuable rewards.
- Do not restore public client writes to leaderboard tables. Add an authenticated, validated server-side scoring flow before enabling synced competition.
- Update this specification after the code and event dispatch have changed; do not use it as a roadmap or claim for unimplemented behavior.
