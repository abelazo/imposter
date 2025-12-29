import YAML from 'yaml'

export interface Topic {
  id: string
  title: string
}

interface TopicData {
  title: string
  words: string[]
}

export interface WordBank {
  topics: Topic[]
  getWordsForTopic: (topicId: string) => string[]
  selectWordFromTopic: (topicId: string, lastWord?: string) => string
}

interface YamlWordBank {
  topics: Record<string, TopicData>
}

const WORD_BANK_URL = 'https://raw.githubusercontent.com/abelazo/impostor/refs/heads/main/word-bank/es.yaml'

let cachedWordBank: Record<string, TopicData> | null = null

export async function loadWordBank(): Promise<WordBank> {
  if (!cachedWordBank) {
    const response = await fetch(WORD_BANK_URL)
    const yamlText = await response.text()
    const parsed = YAML.parse(yamlText) as YamlWordBank
    cachedWordBank = parsed.topics
  }

  const wordBank = cachedWordBank

  return {
    topics: Object.entries(wordBank).map(([id, data]) => ({
      id,
      title: data.title,
    })),
    getWordsForTopic: (topicId: string) => wordBank[topicId]?.words ?? [],
    selectWordFromTopic: (topicId: string, lastWord?: string) => {
      const words = wordBank[topicId]?.words ?? []
      if (words.length === 0) return ''

      const availableWords = lastWord && words.length > 1
        ? words.filter((w) => w !== lastWord)
        : words

      const randomIndex = Math.floor(Math.random() * availableWords.length)
      return availableWords[randomIndex]
    },
  }
}
