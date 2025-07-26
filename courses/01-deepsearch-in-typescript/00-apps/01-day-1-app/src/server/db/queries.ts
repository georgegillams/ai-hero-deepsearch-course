import { and, count, eq, gte } from "drizzle-orm";
import { db } from "./index";
import { userRequests, users } from "./schema";

// Rate limiting configuration
const DAILY_REQUEST_LIMIT = 50; // Adjust this value as needed

/**
 * Get the number of requests made by a user today
 */
export async function getUserRequestCountToday(
  userId: string,
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: count() })
    .from(userRequests)
    .where(
      and(
        eq(userRequests.userId, userId),
        gte(userRequests.requestedAt, today),
      ),
    );

  return result[0]?.count ?? 0;
}

/**
 * Add a new request record for a user
 */
export async function addUserRequest(
  userId: string,
  endpoint: string,
): Promise<void> {
  await db.insert(userRequests).values({
    userId,
    endpoint,
  });
}

/**
 * Check if a user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const result = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0]?.isAdmin ?? false;
}

/**
 * Check if a user can make a request (not over daily limit or is admin)
 */
export async function canUserMakeRequest(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  requestCount?: number;
}> {
  const isAdmin = await isUserAdmin(userId);

  if (isAdmin) {
    return { allowed: true };
  }

  const requestCount = await getUserRequestCountToday(userId);

  if (requestCount >= DAILY_REQUEST_LIMIT) {
    return {
      allowed: false,
      reason: `Daily request limit of ${DAILY_REQUEST_LIMIT} exceeded`,
      requestCount,
    };
  }

  return { allowed: true, requestCount };
}
