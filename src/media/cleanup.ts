import fs from "node:fs/promises";
import path from "node:path";
import { createLogger } from "../log.js";
import { MEDIA_DIR } from "../paths.js";

const log = createLogger("media.cleanup");

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6h

/**
 * Remove message attachment dirs under MEDIA_DIR older than maxAgeMs
 * (default 24h). Best-effort; never throws.
 */
export async function pruneOldMedia(maxAgeMs = DEFAULT_MAX_AGE_MS): Promise<number> {
  let removed = 0;
  try {
    const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
    const cutoff = Date.now() - maxAgeMs;
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const dir = path.join(MEDIA_DIR, ent.name);
      try {
        const stat = await fs.stat(dir);
        if (stat.mtimeMs < cutoff) {
          await fs.rm(dir, { recursive: true, force: true });
          removed++;
        }
      } catch {
        // skip
      }
    }
    if (removed) log.info(`pruned ${removed} media dir(s) older than ${maxAgeMs / 3600000}h`);
  } catch {
    // MEDIA_DIR may not exist yet
  }
  return removed;
}

/**
 * Start a periodic media-cleanup loop. Runs once immediately, then every
 * `intervalMs` (default 6h). Returns a stop function. Designed for the
 * long-running daemon mode where startup-only pruning lets the dir grow
 * unbounded between restarts.
 */
export function startMediaCleanupLoop(opts?: {
  intervalMs?: number;
  maxAgeMs?: number;
}): () => void {
  const intervalMs = opts?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const maxAgeMs = opts?.maxAgeMs ?? DEFAULT_MAX_AGE_MS;
  void pruneOldMedia(maxAgeMs);
  const timer = setInterval(() => void pruneOldMedia(maxAgeMs), intervalMs);
  // Don't keep the event loop alive purely for cleanup.
  if (typeof timer.unref === "function") timer.unref();
  return () => clearInterval(timer);
}
