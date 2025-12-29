export interface PlayerRole {
  playerNumber: number
  isImpostor: boolean
}

export interface GameState {
  roles: PlayerRole[]
  word: string
  currentPlayerIndex: number
}

export function assignRoles(participantCount: number, impostorCount: number): PlayerRole[] {
  // Create array of indices and shuffle to randomize impostor positions
  const indices = Array.from({ length: participantCount }, (_, i) => i)
  shuffleArray(indices)

  // First `impostorCount` shuffled indices are impostors
  const impostorIndices = new Set(indices.slice(0, impostorCount))

  return Array.from({ length: participantCount }, (_, i) => ({
    playerNumber: i + 1,
    isImpostor: impostorIndices.has(i),
  }))
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
