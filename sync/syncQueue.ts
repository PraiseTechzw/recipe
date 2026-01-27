// ============================================================================
// TYPES
// ============================================================================

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntityType = 'RECIPE' | 'USER_PROFILE' | 'PANTRY' | 'SHOPPING_LIST';

export interface SyncTask {
  id: string;
  type: SyncOperationType;
  entity: SyncEntityType;
  payload: any;
  createdAt: number;
  retryCount: number;
  lastAttempt?: number;
  error?: string;
}

export interface SyncQueueState {
  queue: SyncTask[];
  isProcessing: boolean;
}

export interface SyncResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1000; // 1 second

// ============================================================================
// LOGIC
// ============================================================================

/**
 * Adds a task to the sync queue.
 */
export function addToQueue(
  queue: SyncTask[], 
  type: SyncOperationType, 
  entity: SyncEntityType, 
  payload: any
): SyncTask[] {
  const newTask: SyncTask = {
    id: generateId(),
    type,
    entity,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  };
  
  return [...queue, newTask];
}

/**
 * Removes a task from the queue (e.g., after successful sync).
 */
export function removeFromQueue(queue: SyncTask[], taskId: string): SyncTask[] {
  return queue.filter(task => task.id !== taskId);
}

/**
 * Updates a task's status after a failed attempt.
 * Increments retry count and sets last attempt timestamp.
 */
export function markTaskFailed(queue: SyncTask[], taskId: string, error: string): SyncTask[] {
  return queue.map(task => {
    if (task.id !== taskId) return task;
    
    return {
      ...task,
      retryCount: task.retryCount + 1,
      lastAttempt: Date.now(),
      error
    };
  });
}

/**
 * Determines if a task is ready to be retried based on exponential backoff.
 */
export function isTaskReadyForRetry(task: SyncTask): boolean {
  if (task.retryCount >= MAX_RETRIES) return false;
  if (!task.lastAttempt) return true;

  const backoffTime = BASE_BACKOFF_MS * Math.pow(2, task.retryCount); // 1s, 2s, 4s, 8s, 16s
  const timeSinceLastAttempt = Date.now() - task.lastAttempt;

  return timeSinceLastAttempt >= backoffTime;
}

/**
 * Returns the next batch of tasks that are ready to be processed.
 * Filters out tasks that have exceeded max retries or are waiting for backoff.
 */
export function getNextBatch(queue: SyncTask[], batchSize: number = 5): SyncTask[] {
  return queue
    .filter(task => task.retryCount < MAX_RETRIES && isTaskReadyForRetry(task))
    .sort((a, b) => a.createdAt - b.createdAt) // FIFO
    .slice(0, batchSize);
}

/**
 * Simulates processing a single task (Dependency Injection pattern).
 * In a real app, 'processor' would be the function calling Supabase.
 */
export async function processTask(
  task: SyncTask, 
  processor: (task: SyncTask) => Promise<SyncResult>
): Promise<SyncResult> {
  try {
    return await processor(task);
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown error' };
  }
}

/**
 * Flushes the queue by processing eligible tasks.
 * This is a "pure" logic controller that orchestrates the flow.
 * It returns the new queue state and results.
 */
export async function flushQueue(
  queue: SyncTask[],
  processor: (task: SyncTask) => Promise<SyncResult>
): Promise<{ newQueue: SyncTask[], results: Record<string, SyncResult> }> {
  let currentQueue = [...queue];
  const results: Record<string, SyncResult> = {};
  
  const batch = getNextBatch(currentQueue);
  
  // Process sequentially to ensure order (important for CRUD)
  for (const task of batch) {
    const result = await processTask(task, processor);
    results[task.id] = result;
    
    if (result.success) {
      currentQueue = removeFromQueue(currentQueue, task.id);
    } else {
      currentQueue = markTaskFailed(currentQueue, task.id, result.error || 'Failed');
    }
  }

  return { newQueue: currentQueue, results };
}

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
