import { describe, it, expect } from 'vitest'
import { assignRoles, type GameState } from '../lib/gameLogic'

describe('gameLogic', () => {
  describe('assignRoles', () => {
    it('assigns correct number of impostors', () => {
      const roles = assignRoles(5, 2)
      const impostorCount = roles.filter((r) => r.isImpostor).length
      expect(impostorCount).toBe(2)
    })

    it('assigns correct number of non-impostors', () => {
      const roles = assignRoles(5, 2)
      const nonImpostorCount = roles.filter((r) => !r.isImpostor).length
      expect(nonImpostorCount).toBe(3)
    })

    it('creates roles for all participants', () => {
      const roles = assignRoles(6, 1)
      expect(roles).toHaveLength(6)
    })

    it('assigns player numbers correctly', () => {
      const roles = assignRoles(4, 1)
      const playerNumbers = roles.map((r) => r.playerNumber)
      expect(playerNumbers).toEqual([1, 2, 3, 4])
    })

    it('randomizes impostor positions', () => {
      // Run multiple times to check randomization
      const results = new Set<string>()
      for (let i = 0; i < 20; i++) {
        const roles = assignRoles(4, 1)
        const impostorIndex = roles.findIndex((r) => r.isImpostor)
        results.add(impostorIndex.toString())
      }
      // Should have different positions across runs
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('GameState type', () => {
    it('has correct structure', () => {
      const state: GameState = {
        roles: [
          { playerNumber: 1, isImpostor: false },
          { playerNumber: 2, isImpostor: true },
        ],
        word: 'apple',
        currentPlayerIndex: 0,
      }
      expect(state.roles).toHaveLength(2)
      expect(state.word).toBe('apple')
      expect(state.currentPlayerIndex).toBe(0)
    })
  })
})
