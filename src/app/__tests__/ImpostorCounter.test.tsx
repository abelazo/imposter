import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImpostorCounter } from '../components/ImpostorCounter'

describe('ImpostorCounter', () => {
  describe('display', () => {
    it('shows impostor count selector', () => {
      render(<ImpostorCounter participantCount={4} value={1} onChange={vi.fn()} />)
      expect(screen.getByText(/impostors/i)).toBeInTheDocument()
    })

    it('displays current impostor count', () => {
      render(<ImpostorCounter participantCount={4} value={1} onChange={vi.fn()} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('defaults to 1 impostor', () => {
      render(<ImpostorCounter participantCount={4} value={1} onChange={vi.fn()} />)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('increment/decrement', () => {
    it('increments impostor count when clicking +', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ImpostorCounter participantCount={6} value={1} onChange={onChange} />)

      await user.click(screen.getByRole('button', { name: /increase/i }))

      expect(onChange).toHaveBeenCalledWith(2)
    })

    it('decrements impostor count when clicking -', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ImpostorCounter participantCount={6} value={2} onChange={onChange} />)

      await user.click(screen.getByRole('button', { name: /decrease/i }))

      expect(onChange).toHaveBeenCalledWith(1)
    })
  })

  describe('minimum constraint', () => {
    it('disables decrease button at minimum (1)', () => {
      render(<ImpostorCounter participantCount={4} value={1} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled()
    })

    it('does not allow going below 1', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<ImpostorCounter participantCount={4} value={1} onChange={onChange} />)

      await user.click(screen.getByRole('button', { name: /decrease/i }))

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('maximum constraint (participants/2 - 1, min 1)', () => {
    it('disables increase button at maximum for 4 participants (max 1)', () => {
      // max = floor(4/2) - 1 = 1
      render(<ImpostorCounter participantCount={4} value={1} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled()
    })

    it('disables increase button at maximum for 6 participants (max 2)', () => {
      // max = floor(6/2) - 1 = 2
      render(<ImpostorCounter participantCount={6} value={2} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled()
    })

    it('disables increase button at maximum for 10 participants (max 4)', () => {
      // max = floor(10/2) - 1 = 4
      render(<ImpostorCounter participantCount={10} value={4} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled()
    })

    it('allows increase when below maximum', () => {
      render(<ImpostorCounter participantCount={10} value={2} onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /increase/i })).toBeEnabled()
    })

    it('ensures minimum of 1 for max with 2 participants', () => {
      // max = floor(2/2) - 1 = 0, but clamped to 1
      render(<ImpostorCounter participantCount={2} value={1} onChange={vi.fn()} />)
      // Both buttons should be disabled (at min and max of 1)
      expect(screen.getByRole('button', { name: /decrease/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /increase/i })).toBeDisabled()
    })
  })
})
