export function log(message: string, ...args: unknown[]): void {
  console.log(`[SFU] ${message}`, ...args);
}

export function error(message: string, ...args: unknown[]): void {
  console.error(`[SFU ERROR] ${message}`, ...args);
}

export function warn(message: string, ...args: unknown[]): void {
  console.warn(`[SFU WARN] ${message}`, ...args);
}
