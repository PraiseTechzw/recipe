import { Recipe, Step } from "@/models/recipe";

// ============================================================================
// TYPES
// ============================================================================

export type CookingStatus = "prep" | "cooking" | "paused" | "completed";

export interface Timer {
  id: string;
  duration: number; // in seconds
  remaining: number;
  label: string;
  isRunning: boolean;
}

export interface CookingSession {
  recipeId: string;
  status: CookingStatus;
  currentStepIndex: number;
  totalSteps: number;
  startTime: number; // timestamp
  endTime?: number;
  timers: Timer[];
  completedSteps: number[]; // indices of completed steps
}

export interface CookingAction {
  type:
    | "NEXT_STEP"
    | "PREV_STEP"
    | "JUMP_TO_STEP"
    | "TOGGLE_TIMER"
    | "COMPLETE_SESSION";
  payload?: any;
}

export interface CookingResult {
  session: CookingSession;
  xpEarned: number;
  badgesEarned: string[];
  message?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const XP_PER_STEP = 10;
const XP_COMPLETION_BONUS = 50;
const XP_TIME_BONUS = 20; // If completed within estimated time

// ============================================================================
// ENGINE LOGIC
// ============================================================================

/**
 * Initializes a new cooking session for a recipe.
 */
export function startCookingSession(recipe: Recipe): CookingSession {
  return {
    recipeId: recipe.id,
    status: "prep",
    currentStepIndex: 0,
    totalSteps: recipe.steps.length,
    startTime: Date.now(),
    timers: extractTimersFromSteps(recipe.steps),
    completedSteps: [],
  };
}

/**
 * Main reducer-like function to handle cooking actions.
 * Pure function: takes current session + action -> returns new session & side effects (XP).
 */
export function processCookingAction(
  session: CookingSession,
  action: CookingAction,
  recipe?: Recipe, // Optional, needed for context like time estimation
): CookingResult {
  let newSession = { ...session };
  let xpEarned = 0;
  let badgesEarned: string[] = [];
  let message = "";

  switch (action.type) {
    case "NEXT_STEP":
      if (newSession.currentStepIndex < newSession.totalSteps - 1) {
        // Mark current step as complete if not already
        if (!newSession.completedSteps.includes(newSession.currentStepIndex)) {
          newSession.completedSteps.push(newSession.currentStepIndex);
          xpEarned += XP_PER_STEP;
        }
        newSession.currentStepIndex++;
        newSession.status = "cooking";
      } else {
        // Last step - propose completion
        return processCookingAction(
          session,
          { type: "COMPLETE_SESSION" },
          recipe,
        );
      }
      break;

    case "PREV_STEP":
      if (newSession.currentStepIndex > 0) {
        newSession.currentStepIndex--;
      }
      break;

    case "JUMP_TO_STEP":
      const targetIndex = action.payload as number;
      if (targetIndex >= 0 && targetIndex < newSession.totalSteps) {
        newSession.currentStepIndex = targetIndex;
      }
      break;

    case "TOGGLE_TIMER":
      const timerId = action.payload as string;
      newSession.timers = newSession.timers.map((t) =>
        t.id === timerId ? { ...t, isRunning: !t.isRunning } : t,
      );
      break;

    case "COMPLETE_SESSION":
      if (newSession.status !== "completed") {
        newSession.status = "completed";
        newSession.endTime = Date.now();

        // Final XP Calculation
        xpEarned += XP_COMPLETION_BONUS;

        // Check for time bonus if recipe provided
        if (recipe) {
          // Very naive parsing "45 mins" -> 45
          const estimatedMins = parseInt(recipe.time) || 60;
          const elapsedMins =
            (newSession.endTime - newSession.startTime) / 60000;

          if (elapsedMins <= estimatedMins) {
            xpEarned += XP_TIME_BONUS;
            message = "Speedy Chef Bonus!";
          }
        }

        // Check Badges (Logic would go here, simplified for now)
        badgesEarned = checkCompletionBadges(newSession);
      }
      break;
  }

  return {
    session: newSession,
    xpEarned,
    badgesEarned,
    message,
  };
}

/**
 * Voice Command Helper: Maps natural language intents to Engine Actions.
 */
export function mapVoiceCommandToAction(
  transcript: string,
): CookingAction | null {
  const t = transcript.toLowerCase();

  if (t.includes("next") || t.includes("continue") || t.includes("done")) {
    return { type: "NEXT_STEP" };
  }
  if (t.includes("back") || t.includes("previous") || t.includes("repeat")) {
    return { type: "PREV_STEP" };
  }
  if (t.includes("start timer") || t.includes("stop timer")) {
    // In a real app, we'd extract the specific timer name/duration
    // For now, we toggle the active step's timer if it exists
    return null; // Requires context of which timer
  }
  if (t.includes("finish") || t.includes("complete")) {
    return { type: "COMPLETE_SESSION" };
  }

  return null;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function extractTimersFromSteps(steps: Step[]): Timer[] {
  // Regex to find "X minutes" or "X mins"
  // This is a basic heuristic.
  const timers: Timer[] = [];

  steps.forEach((step, index) => {
    // Look for numbers followed by 'min'
    const match = step.instruction.match(/(\d+)\s*(?:min|minute)/i);
    if (match) {
      timers.push({
        id: `step-${index}`,
        duration: parseInt(match[1]) * 60,
        remaining: parseInt(match[1]) * 60,
        label: `Step ${index + 1} Timer`,
        isRunning: false,
      });
    }
  });

  return timers;
}

function checkCompletionBadges(session: CookingSession): string[] {
  const badges = [];
  // Example logic
  const hour = new Date().getHours();

  if (hour < 9) badges.push("early_bird");
  if (hour >= 22) badges.push("night_owl");

  return badges;
}
