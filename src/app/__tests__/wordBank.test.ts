import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockYamlContent = `
topics:
  daily-life:
    title: "Objetos de la vida diaria"
    words:
      - "mesa"
      - "silla"
      - "puerta"
  food:
    title: "Comida y bebida"
    words:
      - "manzana"
      - "pan"
  transportation:
    title: "Medios de transporte"
    words:
      - "coche"
      - "bicicleta"
`

describe('wordBank', () => {
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

  describe('loadWordBank', () => {
    it('fetches and parses word bank from URL', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      expect(fetch).toHaveBeenCalled()
      expect(wordBank.topics).toBeDefined()
    })

    it('returns topics with id and title', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      expect(wordBank.topics).toContainEqual({
        id: 'daily-life',
        title: 'Objetos de la vida diaria',
      })
    })

    it('returns all topics from yaml', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      expect(wordBank.topics).toHaveLength(3)
      const ids = wordBank.topics.map((t) => t.id)
      expect(ids).toContain('daily-life')
      expect(ids).toContain('food')
      expect(ids).toContain('transportation')
    })
  })

  describe('getWordsForTopic', () => {
    it('returns words for a valid topic', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      const words = wordBank.getWordsForTopic('daily-life')
      expect(words).toContain('mesa')
      expect(words).toContain('silla')
    })

    it('returns empty array for invalid topic', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      const words = wordBank.getWordsForTopic('nonexistent')
      expect(words).toEqual([])
    })
  })

  describe('selectWordFromTopic', () => {
    it('returns a word from the specified topic', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      const word = wordBank.selectWordFromTopic('food')
      expect(['manzana', 'pan']).toContain(word)
    })

    it('returns empty string for invalid topic', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      const word = wordBank.selectWordFromTopic('nonexistent')
      expect(word).toBe('')
    })

    it('avoids returning lastWord when possible', async () => {
      const { loadWordBank } = await import('../lib/wordBank')
      const wordBank = await loadWordBank()
      // With only 2 words in food topic, avoiding 'manzana' should give 'pan'
      const results = new Set<string>()
      for (let i = 0; i < 10; i++) {
        const word = wordBank.selectWordFromTopic('food', 'manzana')
        results.add(word)
      }
      expect(results.has('pan')).toBe(true)
      expect(results.size).toBe(1)
    })
  })
})
