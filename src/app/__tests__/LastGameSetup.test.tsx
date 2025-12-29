import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ParticipantSetup } from '../components/ParticipantSetup'
import { createMockWordBank } from './helpers/mockWordBank'
import {
  saveGameSettings,
  loadGameSettings,
  STORAGE_KEY,
  type GameSettings,
} from '../lib/gameSettings'

describe('Last Game Setup Persistence', () => {
  const mockWordBank = createMockWordBank()

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('gameSettings utility', () => {
    it('saves game settings to localStorage', () => {
      const settings: GameSettings = {
        participantCount: 5,
        impostorCount: 2,
        topicId: 'food',
      }

      saveGameSettings(settings)

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(settings)
    })

    it('loads game settings from localStorage', () => {
      const settings: GameSettings = {
        participantCount: 4,
        impostorCount: 1,
        topicId: 'transportation',
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

      const loaded = loadGameSettings()

      expect(loaded).toEqual(settings)
    })

    it('returns null when no settings are stored', () => {
      const loaded = loadGameSettings()
      expect(loaded).toBeNull()
    })

    it('returns null for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json')
      const loaded = loadGameSettings()
      expect(loaded).toBeNull()
    })
  })

  describe('ParticipantSetup with persistence', () => {
    it('saves settings to localStorage when game starts', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Add 5 participants
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Select a different topic
      await user.selectOptions(screen.getByRole('combobox'), 'food')

      // Start the game
      await user.click(screen.getByRole('button', { name: /start/i }))

      // Verify settings were saved
      const saved = loadGameSettings()
      expect(saved).toEqual({
        participantCount: 5,
        impostorCount: 1,
        topicId: 'food',
      })
    })

    it('loads saved participant count on mount', async () => {
      // Save settings first
      saveGameSettings({
        participantCount: 4,
        impostorCount: 1,
        topicId: 'daily-life',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Should show 4 participants loaded
      expect(screen.getByText(/4 participants/i)).toBeInTheDocument()
      expect(screen.getByText('Player 1')).toBeInTheDocument()
      expect(screen.getByText('Player 2')).toBeInTheDocument()
      expect(screen.getByText('Player 3')).toBeInTheDocument()
      expect(screen.getByText('Player 4')).toBeInTheDocument()
    })

    it('loads saved topic on mount', async () => {
      saveGameSettings({
        participantCount: 3,
        impostorCount: 1,
        topicId: 'transportation',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('transportation')
    })

    it('loads saved impostor count on mount', async () => {
      saveGameSettings({
        participantCount: 6,
        impostorCount: 2,
        topicId: 'daily-life',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // With 6 participants, max impostors is 2
      // Should show the saved impostor count of 2
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('clamps loaded impostor count to valid range', async () => {
      // Save with high impostor count
      saveGameSettings({
        participantCount: 4,
        impostorCount: 5, // Invalid for 4 participants (max is 1)
        topicId: 'daily-life',
      })

      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Start the game to verify clamped value
      await userEvent.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ impostorCount: 1 })
      )
    })

    it('defaults to first topic if saved topic is invalid', async () => {
      saveGameSettings({
        participantCount: 3,
        impostorCount: 1,
        topicId: 'nonexistent-topic',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('daily-life') // First topic
    })

    it('clamps loaded participant count to valid range', async () => {
      // Save with too many participants
      saveGameSettings({
        participantCount: 15, // Max is 10
        impostorCount: 1,
        topicId: 'daily-life',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Should show max 10 participants
      expect(screen.getByText(/10 participants/i)).toBeInTheDocument()
    })

    it('handles zero participant count gracefully', async () => {
      saveGameSettings({
        participantCount: 0,
        impostorCount: 1,
        topicId: 'daily-life',
      })

      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Should start with 0 participants (empty state)
      expect(screen.getByText(/0 participants/i)).toBeInTheDocument()
    })

    it('preserves settings across multiple game rounds', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()

      // First round
      const { unmount } = render(
        <ParticipantSetup onStart={onStart} wordBank={mockWordBank} />
      )

      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }
      await user.selectOptions(screen.getByRole('combobox'), 'food')
      await user.click(screen.getByRole('button', { name: /start/i }))

      unmount()

      // Second round - simulate returning to setup
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Settings should be preserved
      expect(screen.getByText(/5 participants/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toHaveValue('food')
    })
  })
})
