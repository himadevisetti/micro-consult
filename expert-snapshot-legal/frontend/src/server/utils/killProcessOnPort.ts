// src/server/utils/killProcessOnPort.ts

import { execSync } from "child_process";

/**
 * Kills all processes bound to the specified port.
 * Returns an array of killed PIDs, or throws if unable to resolve or kill.
 */
export function killProcessOnPort(port: number): number[] {
  const output = execSync(`lsof -i :${port} -t`).toString().trim();
  const pids = output
    .split("\n")
    .map((line) => parseInt(line, 10))
    .filter(Boolean);

  for (const pid of pids) {
    process.kill(pid, "SIGKILL");
  }

  return pids;
}

