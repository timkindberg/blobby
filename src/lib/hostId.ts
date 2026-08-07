/**
 * Host identity.
 *
 * Every session stores the `hostId` of whoever created it, and all host-only
 * Convex mutations authorize against it. The id lives in localStorage, so any
 * tab in the same browser (admin view, spectator view) is the same host - which
 * is what lets the spectator screen drive the game.
 */
const HOST_ID_KEY = "blobby-host-id";

export function getHostId(): string {
  let hostId = localStorage.getItem(HOST_ID_KEY);
  if (!hostId) {
    hostId = crypto.randomUUID();
    localStorage.setItem(HOST_ID_KEY, hostId);
  }
  return hostId;
}
