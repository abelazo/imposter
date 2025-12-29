export const STORAGE_KEY = 'imposter-game-settings'

export interface GameSettings {
  participantCount: number
  impostorCount: number
  topicId: string
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors (e.g., quota exceeded, private browsing)
  }
}

export function loadGameSettings(): GameSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored) as GameSettings
  } catch {
    return null
  }
}
