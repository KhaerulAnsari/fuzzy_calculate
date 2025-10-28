import { prismaClient } from "../index.js";

/**
 * Cleanup expired tokens from blacklist
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await prismaClient.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Delete tokens that have expired
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired tokens from blacklist`);
    return result.count;
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    throw error;
  }
}

/**
 * Start periodic cleanup (runs every hour)
 */
export function startTokenCleanupSchedule() {
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  // Run immediately on start
  cleanupExpiredTokens();

  // Then run periodically
  setInterval(() => {
    cleanupExpiredTokens();
  }, CLEANUP_INTERVAL);

  console.log("Token cleanup schedule started (runs every hour)");
}
