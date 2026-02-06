/**
 * Shared constants for Blobby: Summit
 * These can be imported by both frontend (src/) and backend (convex/)
 */

/**
 * How long before a player is considered disconnected (in milliseconds)
 * Used for presence heartbeat system
 * Should be at least 2x the heartbeat interval to allow for network delays
 */
export const PRESENCE_TIMEOUT_MS = 60000;
