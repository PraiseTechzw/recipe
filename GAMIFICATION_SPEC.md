# Gamification Specification: Chef's Journey

## Overview

This gamification system is designed for an **Offline-First**, **No-Auth** cooking application. It relies on local state (Zustand) for persistence and syncs to Supabase only when available for leaderboard features.

**Core Philosophy:** Reward engagement, exploration, and consistency.

---

## 1. XP Rules

Experience Points (XP) are the primary currency for progression.

| Action                | XP Awarded                 | Trigger / Condition                                                       |
| :-------------------- | :------------------------- | :------------------------------------------------------------------------ |
| **Complete Recipe**   | **50 XP**                  | Finish cooking session (all steps + complete button).                     |
| **Step Streak**       | **+2 XP per step**         | Complete a step without pausing timers or leaving the screen for > 1 min. |
| **Pantry Match Cook** | **+20 XP**                 | Complete a recipe matched via Pantry Match (>= 60%).                      |
| **Category Explorer** | **+30 XP**                 | First time cooking a recipe from a new category (e.g., "Italian").        |
| **Daily Streak**      | **50 XP + (10 \* Streak)** | Cook at least one recipe per day. Cap at +150 XP bonus.                   |
| **Rate/Review**       | **15 XP**                  | Submit a star rating and text review after cooking.                       |
| **Perfect Timing**    | **25 XP**                  | Finish cooking within ±10% of estimated time.                             |

---

## 2. Level Progression Formula

We use a **Quadratic Growth** formula to ensure early levels feel fast, while later levels require sustained engagement.

**Formula:**
$$ XP\_{required} = 100 \times (Level - 1)^{1.5} $$

_(Rounded to nearest 50 for clean numbers)_

### Level Table (1–20)

| Level  | Title               | Total XP Required | Delta (XP to next) |
| :----- | :------------------ | :---------------- | :----------------- |
| **1**  | **Novice**          | 0                 | 100                |
| **2**  | **Kitchen Helper**  | 100               | 150                |
| **3**  | **Apprentice**      | 250               | 250                |
| **4**  | **Line Cook**       | 500               | 350                |
| **5**  | **Home Cook**       | 850               | 450                |
| **6**  | **Foodie**          | 1,300             | 600                |
| **7**  | **Sous Chef**       | 1,900             | 750                |
| **8**  | **Station Chef**    | 2,650             | 900                |
| **9**  | **Head Chef**       | 3,550             | 1,100              |
| **10** | **Executive Chef**  | 4,650             | 1,350              |
| **11** | **Restaurateur**    | 6,000             | 1,600              |
| **12** | **Culinary Artist** | 7,600             | 1,900              |
| **13** | **Flavor Master**   | 9,500             | 2,200              |
| **14** | **Iron Chef**       | 11,700            | 2,550              |
| **15** | **Michelin Star**   | 14,250            | 2,950              |
| **16** | **Grand Master**    | 17,200            | 3,400              |
| **17** | **Legend**          | 20,600            | 3,900              |
| **18** | **Mythic Chef**     | 24,500            | 4,450              |
| **19** | **Divine Palate**   | 28,950            | 5,050              |
| **20** | **God of Cookery**  | 34,000            | ∞                  |

---

## 3. Achievements & Badges

Achievements are one-time milestones that award badges and bonus XP.

**Rarity Tiers:**

- **Common (C):** Easy, teaches mechanics.
- **Rare (R):** Requires dedication or skill.
- **Epic (E):** Hard to achieve, bragging rights.

| ID                 | Title             | Description                                   | Condition                | Rarity | XP   | Badge Icon     |
| :----------------- | :---------------- | :-------------------------------------------- | :----------------------- | :----- | :--- | :------------- |
| `first_steps`      | **First Steps**   | Complete your first recipe.                   | `recipes_completed >= 1` | C      | 50   | `egg-outline`  |
| `streak_week`      | **On Fire**       | Cook for 7 days in a row.                     | `streak_days >= 7`       | R      | 200  | `flame`        |
| `streak_month`     | **Unstoppable**   | Cook for 30 days in a row.                    | `streak_days >= 30`      | E      | 1000 | `flash`        |
| `early_bird`       | **Early Bird**    | Cook breakfast before 8 AM.                   | `cook_time < 08:00`      | C      | 50   | `sunny`        |
| `night_owl`        | **Night Owl**     | Cook a meal after 11 PM.                      | `cook_time > 23:00`      | C      | 50   | `moon`         |
| `pantry_hero`      | **Pantry Hero**   | Cook 10 recipes using Pantry Match.           | `pantry_matches >= 10`   | R      | 150  | `nutrition`    |
| `reviewer`         | **Critic**        | Leave 5 reviews.                              | `reviews_count >= 5`     | C      | 75   | `star`         |
| `world_traveler`   | **Traveler**      | Cook recipes from 5 different cuisines.       | `cuisines_count >= 5`    | R      | 250  | `airplane`     |
| `speed_demon`      | **Speedster**     | Finish a recipe 5 mins faster than estimated. | `time_diff <= -5`        | R      | 100  | `speedometer`  |
| `perfectionist`    | **Perfectionist** | Complete a recipe with 0 pauses.              | `pauses == 0`            | E      | 300  | `ribbon`       |
| `social_butterfly` | **Sharer**        | Share 5 recipes externally.                   | `shares >= 5`            | C      | 50   | `share-social` |
| `healthy_eater`    | **Health Nut**    | Cook 5 recipes tagged "Healthy".              | `healthy_count >= 5`     | C      | 100  | `leaf`         |
| `sugar_rush`       | **Baker**         | Cook 5 recipes tagged "Dessert".              | `dessert_count >= 5`     | C      | 100  | `ice-cream`    |
| `library`          | **Librarian**     | Save 20 recipes to favorites.                 | `favorites >= 20`        | C      | 50   | `bookmark`     |
| `completionist`    | **The 100**       | Complete 100 total recipes.                   | `total_cooks >= 100`     | E      | 2000 | `trophy`       |

---

## 4. Leaderboard Scoring

Since we don't have authentication, leaderboards use a **generated `chef_id`** (UUID) stored on the device.

### Metrics

1.  **Weekly Score:** Reset every Sunday at 00:00 UTC.
    - _Purpose:_ Allows new users to compete.
2.  **All-Time Score:** Cumulative XP since install.
    - _Purpose:_ Rewards loyalty.

### Data Structure (Supabase)

```sql
TABLE leaderboards (
  chef_id UUID PRIMARY KEY,
  display_name TEXT,
  avatar_seed TEXT, -- For deterministic avatar generation
  xp_total INTEGER,
  xp_weekly INTEGER,
  level INTEGER,
  last_active TIMESTAMP
);
```

### Sync Strategy

- **Trigger:** Sync score after every `COMPLETE_SESSION` or `ACHIEVEMENT_UNLOCK`.
- **Conflict:** Server always trusts the highest value (monotonic increase).
- **Offline:** Queue updates using `syncQueue`.

---

## 5. Implementation Notes

- **Local Persistence:** Use `userStore` to track `xp`, `level`, `badges`, and `stats` (e.g., `recipes_completed`, `streak_days`).
- **Badge Mapping:** Icons refer to `Ionicons` names used in `Expo`.
- **Security:** Since this is client-trusted, we accept that technically savvy users could "hack" their local score. For a non-competitive cooking app, this is an acceptable trade-off for offline-first simplicity.
