import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ParticipantSetup } from '../components/ParticipantSetup'

describe('ParticipantSetup', () => {
  describe('adding participants', () => {
    it('shows add participant button', () => {
      render(<ParticipantSetup onStart={vi.fn()} />)
      expect(screen.getByRole('button', { name: /add participant/i })).toBeInTheDocument()
    })

    it('adds a participant when clicking add button', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText('Player 1')).toBeInTheDocument()
    })

    it('shows participant count', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText(/2 participants/i)).toBeInTheDocument()
    })

    it('limits maximum participants to 10', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

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
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      expect(screen.getByText('Player 1')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /remove player 1/i }))
      expect(screen.queryByText('Player 1')).not.toBeInTheDocument()
    })
  })

  describe('start button', () => {
    it('disables start button with less than 2 participants', () => {
      render(<ParticipantSetup onStart={vi.fn()} />)
      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('disables start button with only 1 participant', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    })

    it('enables start button with 2 or more participants', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByRole('button', { name: /start/i })).toBeEnabled()
    })

    it('calls onStart with participant count and impostor count when clicked', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith({ participantCount: 2, impostorCount: 1 })
    })
  })

  describe('impostor counter integration', () => {
    it('shows impostor counter when there are 2+ participants', async () => {
      const user = userEvent.setup()
      render(<ParticipantSetup onStart={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: /add participant/i }))
      await user.click(screen.getByRole('button', { name: /add participant/i }))

      expect(screen.getByText(/impostors/i)).toBeInTheDocument()
    })

    it('does not show impostor counter with less than 2 participants', () => {
      render(<ParticipantSetup onStart={vi.fn()} />)
      expect(screen.queryByText(/impostors/i)).not.toBeInTheDocument()
    })

    it('passes correct impostor count to onStart', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      render(<ParticipantSetup onStart={onStart} />)

      // Add 6 participants (max impostors = 2)
      for (let i = 0; i < 6; i++) {
        await user.click(screen.getByRole('button', { name: /add participant/i }))
      }

      // Increase impostor count to 2
      await user.click(screen.getByRole('button', { name: /increase/i }))
      await user.click(screen.getByRole('button', { name: /start/i }))

      expect(onStart).toHaveBeenCalledWith({ participantCount: 6, impostorCount: 2 })
    })
  })
})
