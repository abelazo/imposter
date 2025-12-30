'use client'

import { useState } from 'react'
import { ImpostorCounter } from './ImpostorCounter'
import { TopicSelector } from './TopicSelector'
import type { WordBank } from '../lib/wordBank'
import { loadGameSettings, saveGameSettings } from '../lib/gameSettings'

interface GameConfig {
  participantCount: number
  impostorCount: number
  topicId: string
}

interface ParticipantSetupProps {
  onStart: (config: GameConfig) => void
  wordBank: WordBank
}

function getMaxImpostors(participantCount: number): number {
  return Math.max(1, Math.floor(participantCount / 2))
}

function getInitialState(topics: { id: string }[]) {
  const saved = loadGameSettings()
  if (saved) {
    const clampedCount = Math.min(Math.max(0, saved.participantCount), 10)
    const ids = clampedCount > 0
      ? Array.from({ length: clampedCount }, (_, i) => i + 1)
      : []
    const topicExists = topics.some((t) => t.id === saved.topicId)
    return {
      participants: ids,
      nextId: clampedCount + 1,
      impostorCount: saved.impostorCount,
      topicId: topicExists ? saved.topicId : (topics[0]?.id ?? ''),
    }
  }
  return {
    participants: [] as number[],
    nextId: 1,
    impostorCount: 1,
    topicId: topics[0]?.id ?? '',
  }
}

export function ParticipantSetup({ onStart, wordBank }: ParticipantSetupProps) {
  const topics = wordBank.topics
  const [initialState] = useState(() => getInitialState(topics))

  const [participants, setParticipants] = useState<number[]>(initialState.participants)
  const [nextId, setNextId] = useState(initialState.nextId)
  const [impostorCount, setImpostorCount] = useState(initialState.impostorCount)
  const [topicId, setTopicId] = useState(initialState.topicId)

  // Compute clamped impostor count based on current participants
  const maxImpostors = getMaxImpostors(participants.length)
  const clampedImpostorCount = Math.min(Math.max(1, impostorCount), maxImpostors)

  const addParticipant = () => {
    if (participants.length < 10) {
      setParticipants([...participants, nextId])
      setNextId(nextId + 1)
    }
  }

  const removeParticipant = (id: number) => {
    const newParticipants = participants.filter((p) => p !== id)
    setParticipants(newParticipants)

    // Clamp impostor count if it exceeds the new maximum
    const newMaxImpostors = getMaxImpostors(newParticipants.length)
    if (impostorCount > newMaxImpostors) {
      setImpostorCount(newMaxImpostors)
    }
  }

  const handleStart = () => {
    const config = {
      participantCount: participants.length,
      impostorCount: clampedImpostorCount,
      topicId,
    }
    saveGameSettings(config)
    onStart(config)
  }

  const canStart = participants.length >= 3
  const canAdd = participants.length < 10
  const showImpostorCounter = participants.length >= 2

  return (
    <div className="flex flex-col gap-4">
      <TopicSelector topics={topics} value={topicId} onChange={setTopicId} />

      <div className="flex items-center justify-between">
        <span className="text-lg">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={addParticipant}
          disabled={!canAdd}
          className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Participant
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {participants.map((id, index) => (
          <li key={id} className="flex items-center justify-between rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-800">
            <span>Player {index + 1}</span>
            <button
              onClick={() => removeParticipant(id)}
              aria-label={`Remove Player ${index + 1}`}
              className="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      {showImpostorCounter && (
        <ImpostorCounter
          participantCount={participants.length}
          value={clampedImpostorCount}
          onChange={setImpostorCount}
        />
      )}

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="rounded-full bg-green-600 px-6 py-3 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start
      </button>
    </div>
  )
}
