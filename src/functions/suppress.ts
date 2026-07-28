export async function suppress<T>(fn: () => Promise<T>): Promise<T | undefined>
export function suppress<T>(fn: () => T): T | undefined
export function suppress<T>(fn: () => T | Promise<T>): T | undefined | Promise<T | undefined> {
  try {
    const result = fn()

    if (result instanceof Promise) {
      return result.catch(() => undefined)
    }

    return result
  } catch {
    return undefined
  }
}
