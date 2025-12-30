import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ParticipantSetup } from '../components/ParticipantSetup'
import { createMockWordBank, mockTopics } from './helpers/mockWordBank'

describe('ParticipantSetup', () => {
  const mockWordBank = createMockWordBank()

  beforeEach(() => {
    localStorage.clear()
  })

  describe('adding participants', () => {
    it('shows add participant button', () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)
      expect(screen.getByRole('button', { name: /add participant/i })).toBeInTheDocument()
    })

    it('adds a participant when clicking add button', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText('Player 1')).toBeInTheDocument()
    })

    it('shows participant count', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText(/2 participants/i)).toBeInTheDocument()
    })

    it('limits maximum participants to 10', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Add 10 participants
      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Add button should be disabled or hidden
      expect(screen.queryByRole('button', { name: /add participant/i })).toBeDisabled()
    })
  })

  describe('removing participants', () => {
    it('allows removing a participant', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      expect(screen.getByText('Player 1')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /remove player 1/i }))
      expect(screen.queryByText('Player 1')).not.toBeInTheDocument()
    })
  })

  describe('start button', () => {
    it('disables start button with no participants', () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('disables start button with only 1 participant', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('disables start button with only 2 participants', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('enables start button with 3 or more participants', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeEnabled()
    })

    it('calls onStart with participant count, impostor count, and topic when clicked', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith({
        participantCount: 3,
        impostorCount: 1,
        topicId: expect.any(String),
      })
    })
  })

  describe('topic selection', () => {
    it('shows topic selector', () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument()
    })

    it('allows changing topic', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Add participants to enable start
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Change topic
      await user.selectOptions(screen.getByRole('combobox'), 'transportation')
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ topicId: 'transportation' })
      )
    })

    it('displays all available topics from word bank', () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      mockTopics.forEach((topic) => {
        expect(screen.getByRole('option', { name: topic.title })).toBeInTheDocument()
      })
    })
  })

  describe('impostor counter integration', () => {
    it('shows impostor counter when there are 2+ participants', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText(/impostors/i)).toBeInTheDocument()
    })

    it('does not show impostor counter with less than 2 participants', () => {
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)
      expect(screen.queryByText(/impostors/i)).not.toBeInTheDocument()
    })

    it('passes correct impostor count to onStart', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Add 6 participants (max impostors = 2)
      for (let i = 0; i < 6; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Increase impostor count to 2
      await user.click(screen.getByRole('button', { name: /increase/i }))
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 6, impostorCount: 2 })
      )
    })

    it('auto-adjusts impostor count when removing participants makes it invalid', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} wordBank={mockWordBank} />)

      // Add 6 participants (max impostors = 3)
      for (let i = 0; i < 6; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Set impostors to 3
      await user.click(screen.getByRole('button', { name: /increase/i }))
      await user.click(screen.getByRole('button', { name: /increase/i }))

      // Remove 2 participants (now 4 participants, max impostors = 2)
      await user.click(screen.getByRole('button', { name: /remove player 6/i }))
      await user.click(screen.getByRole('button', { name: /remove player 5/i }))

      // Start game - impostor count should be auto-adjusted to 2
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith(
        expect.objectContaining({ participantCount: 4, impostorCount: 2 })
      )
    })

    it('disables start button when removing participants below minimum', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Add 3 participants
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      expect(screen.getByRole('button', { name: /start/i })).toBeEnabled()

      // Remove 1 participant (now 2 participants, below minimum)
      await user.click(screen.getByRole('button', { name: /remove player 3/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('clamps impostor count to valid range when participants change', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} wordBank={mockWordBank} />)

      // Add 6 participants and set impostors to 2
      for (let i = 0; i < 6; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }
      await user.click(screen.getByRole('button', { name: /increase/i }))

      // Remove participants until only 2 remain
      await user.click(screen.getByRole('button', { name: /remove player 6/i }))
      await user.click(screen.getByRole('button', { name: /remove player 5/i }))
      await user.click(screen.getByRole('button', { name: /remove player 4/i }))
      await user.click(screen.getByRole('button', { name: /remove player 3/i }))

      // With 2 participants, max is 1, so counter should show 1
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })
})
