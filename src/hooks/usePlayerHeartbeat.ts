import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// Heartbeat interval - send every 30 seconds (reduced from 5s to minimize function calls)
const HEARTBEAT_INTERVAL_MS = 30000;

/**
 * Get the Convex site URL for HTTP endpoints.
 * Converts the Convex cloud URL to the site URL format.
 * e.g., "https://xyz.convex.cloud" -> "https://xyz.convex.site"
 */
function getConvexSiteUrl(): string {
  const convexUrl = import.meta.env.VITE_CONVEX_URL;
  if (!convexUrl) {
    console.warn("VITE_CONVEX_URL not set, player disconnect may not work");
    return "";
  }
  // Convert .convex.cloud to .convex.site for HTTP endpoints
  return convexUrl.replace(".convex.cloud", ".convex.site");
}

/**
 * Hook that sends periodic heartbeats to track player presence.
 * When the player's tab is open and visible, heartbeats are sent every 30 seconds.
 * When the tab is hidden, heartbeats are paused to save resources.
 * When the tab is closed (or component unmounts), heartbeats stop.
 *
 * Also sets up unload listeners for immediate disconnect detection
 * when the player closes their tab or navigates away.
 *
 * The backend considers a player "active" if their lastSeenAt is within 60 seconds.
 */
export function usePlayerHeartbeat(playerId: Id<"players"> | null) {
  const heartbeat = useMutation(api.players.heartbeat);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Memoize the heartbeat sender to avoid recreating on every render
  const sendHeartbeat = useCallback(() => {
    if (playerId) {
      heartbeat({ playerId });
    }
  }, [playerId, heartbeat]);

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Send immediately when starting/resuming
    sendHeartbeat();
    // Then send every 30 seconds
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
  }, [sendHeartbeat]);

  // Stop heartbeat interval
  const stopHeartbeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Periodic heartbeat effect with visibility API optimization
  useEffect(() => {
    if (!playerId) return;

    // Handle visibility changes - pause heartbeat when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        startHeartbeat();
      }
    };

    // Start heartbeat if tab is visible
    if (!document.hidden) {
      startHeartbeat();
    }

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up on unmount
    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [playerId, startHeartbeat, stopHeartbeat]);

  // Unload listener effect for immediate disconnect detection
  useEffect(() => {
    if (!playerId) return;

    const handleUnload = () => {
      const siteUrl = getConvexSiteUrl();
      if (!siteUrl) return;

      // Use sendBeacon for reliable delivery on page close
      // This is fire-and-forget but designed to survive page unload
      navigator.sendBeacon(
        `${siteUrl}/api/player-disconnect`,
        JSON.stringify({ playerId })
      );
    };

    // Listen for both events for maximum browser compatibility
    // - beforeunload: fires before the page is unloaded
    // - pagehide: fires when the page is hidden (better for mobile Safari)
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [playerId]);
}
