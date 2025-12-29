import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Home from '../page'

const mockYamlContent = `
topics:
  daily-life:
    title: "Objetos de la vida diaria"
    words:
      - "mesa"
      - "silla"
`

describe('Home', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(mockYamlContent),
      })
    ))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('renders the game title', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /impostor game/i })).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<Home />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the participant setup after loading', async () => {
    render(<Home />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add participant/i })).toBeInTheDocument()
    })
  })
})
