// src/server/utils/checkPortAvailability.ts

import net from "net";

/**
 * Checks whether a given port is available on the specified host.
 * Resolves to true if the port is free, false if it's already bound.
 */
export async function checkPortAvailability(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once("error", () => resolve(false))
      .once("listening", () => {
        tester.close(() => resolve(true));
      })
      .listen(port, host);
  });
}

