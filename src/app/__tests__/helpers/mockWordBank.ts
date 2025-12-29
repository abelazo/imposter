import type { WordBank } from '../../lib/wordBank'

export const mockTopics = [
  { id: 'daily-life', title: 'Objetos de la vida diaria' },
  { id: 'food', title: 'Comida y bebida' },
  { id: 'transportation', title: 'Medios de transporte' },
]

export const mockWords: Record<string, string[]> = {
  'daily-life': ['mesa', 'silla', 'puerta'],
  'food': ['manzana', 'pan', 'queso'],
  'transportation': ['coche', 'bicicleta', 'autobús'],
}

export function createMockWordBank(): WordBank {
  return {
    topics: mockTopics,
    getWordsForTopic: (topicId: string) => mockWords[topicId] ?? [],
    selectWordFromTopic: (topicId: string, lastWord?: string) => {
      const words = mockWords[topicId] ?? []
      if (words.length === 0) return ''
      const availableWords = lastWord && words.length > 1
        ? words.filter((w) => w !== lastWord)
        : words
      return availableWords[0]
    },
  }
}
