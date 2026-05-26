import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createLogger } from "../log.js";
import { findConflicts, isAlive, killProcess, type ProcessEntry } from "./registry.js";

const log = createLogger("process");

export type ConflictAction = "continue" | "kill" | "abort";

export interface ConflictResolution {
  action: ConflictAction;
  /** PIDs killed when action is "kill". */
  killed: number[];
}

/**
 * When another bridge instance is already running for the same app, ask the
 * user what to do. Non-TTY or --force skips the prompt and continues.
 */
export async function resolveConflicts(
  conflicts: ProcessEntry[],
  opts?: { force?: boolean },
): Promise<ConflictResolution> {
  if (!conflicts.length) return { action: "continue", killed: [] };
  if (opts?.force) {
    log.warn(`${conflicts.length} other bridge instance(s) running — continuing (--force)`);
    return { action: "continue", killed: [] };
  }
  if (!input.isTTY) {
    log.warn(`${conflicts.length} other bridge instance(s) running — continuing (non-interactive)`);
    return { action: "continue", killed: [] };
  }

  log.warn("Another bridge instance is already running:");
  for (const e of conflicts) {
    log.warn(`  pid=${e.pid} since=${e.startedAt} label=${e.label}`);
  }
  process.stdout.write(
    "\n[c]ontinue anyway  [k]ill old instance(s)  [a]bort startup: ",
  );

  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question("")).trim().toLowerCase();
    if (answer === "k" || answer === "kill") {
      const killed: number[] = [];
      for (const e of conflicts) {
        if (await killProcess(e.pid)) killed.push(e.pid);
      }
      // Wait for actual death before returning — otherwise the new bridge
      // races the old one's WebSocket and Feishu events bounce between them.
      // Poll up to 5s, then SIGKILL anything still alive.
      await waitForDeath(killed, 5_000);
      log.info(`killed ${killed.length} old instance(s)`);
      return { action: "kill", killed };
    }
    if (answer === "a" || answer === "abort") {
      return { action: "abort", killed: [] };
    }
    return { action: "continue", killed: [] };
  } finally {
    rl.close();
  }
}

async function waitForDeath(pids: number[], timeoutMs: number): Promise<void> {
  if (pids.length === 0) return;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (pids.every((p) => !isAlive(p))) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  // Force-kill anything that ignored SIGTERM.
  for (const pid of pids) {
    if (isAlive(pid)) {
      log.warn(`pid=${pid} still alive after ${timeoutMs}ms — sending SIGKILL`);
      await killProcess(pid, "SIGKILL");
    }
  }
  // Brief grace for the OS to release the WS port.
  await new Promise((r) => setTimeout(r, 200));
}
