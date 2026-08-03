const activeUsers = new Set<string>()

export function isActivityActive(userId: string): boolean {
  return activeUsers.has(userId)
}

export function markActivityActive(userId: string): void {
  activeUsers.add(userId)
}

export function clearActivityActive(userId: string): void {
  activeUsers.delete(userId)
}

export function clearAllActivities(): void {
  activeUsers.clear()
}
