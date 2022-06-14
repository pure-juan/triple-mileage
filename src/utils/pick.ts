export function pick<T = any>(...args: T[]): T | null {
  for (const item of args) {
    if (item) return item;
  }

  return null;
}
