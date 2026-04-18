"use client";

import { useState } from "react";
import { ImpostorCounter } from "./ImpostorCounter";
import { TopicSelector } from "./TopicSelector";
import type { WordBank } from "../lib/wordBank";
import { loadGameSettings, saveGameSettings } from "../lib/gameSettings";

interface GameConfig {
  participantCount: number;
  impostorCount: number;
  topicId: string;
  randomImpostorCount: boolean;
}

interface ParticipantSetupProps {
  onStart: (config: GameConfig) => void;
  wordBank: WordBank;
}

function getMaxImpostors(participantCount: number): number {
  return Math.max(1, Math.floor(participantCount / 2));
}

function getInitialState(topics: { id: string }[]) {
  const saved = loadGameSettings();
  if (saved) {
    const participantCount = Math.min(Math.max(0, saved.participantCount), 20);
    const topicExists = topics.some((t) => t.id === saved.topicId);
    return {
      participantCount,
      impostorCount: saved.impostorCount,
      topicId: topicExists ? saved.topicId : (topics[0]?.id ?? ""),
      randomImpostorCount: saved.randomImpostorCount ?? false,
    };
  }
  return {
    participantCount: 0,
    impostorCount: 1,
    topicId: topics[0]?.id ?? "",
    randomImpostorCount: false,
  };
}

export function ParticipantSetup({ onStart, wordBank }: ParticipantSetupProps) {
  const topics = wordBank.topics;
  const [initialState] = useState(() => getInitialState(topics));

  const [participantCount, setParticipantCount] = useState(
    initialState.participantCount,
  );
  const [impostorCount, setImpostorCount] = useState(
    initialState.impostorCount,
  );
  const [topicId, setTopicId] = useState(initialState.topicId);
  const [randomImpostorCount, setRandomImpostorCount] = useState(
    initialState.randomImpostorCount,
  );

  const maxImpostors = getMaxImpostors(participantCount);
  const clampedImpostorCount = Math.min(
    Math.max(1, impostorCount),
    maxImpostors,
  );

  const handleIncrease = () => {
    if (participantCount < 20) {
      setParticipantCount(participantCount + 1);
    }
  };

  const handleDecrease = () => {
    if (participantCount > 0) {
      const newCount = participantCount - 1;
      setParticipantCount(newCount);
      const newMaxImpostors = getMaxImpostors(newCount);
      if (impostorCount > newMaxImpostors) {
        setImpostorCount(newMaxImpostors);
      }
    }
  };

  const handleStart = () => {
    const config = {
      participantCount,
      impostorCount: clampedImpostorCount,
      topicId,
      randomImpostorCount,
    };
    saveGameSettings(config);
    onStart(config);
  };

  const canStart = participantCount >= 3;
  const showImpostorCounter = participantCount >= 2;

  return (
    <div className="flex flex-col gap-4">
      <TopicSelector topics={topics} value={topicId} onChange={setTopicId} />

      <div className="flex items-center justify-between">
        <label id="participants-label" className="text-lg">
          😇 {participantCount} participant{participantCount !== 1 ? "s" : ""}
        </label>
        <div
          className="flex items-center gap-3"
          aria-labelledby="participants-label"
        >
          <button
            onClick={handleDecrease}
            disabled={participantCount === 0}
            aria-label="Decrease participants"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            -
          </button>
          <span className="w-8 text-center text-xl font-semibold">
            {participantCount}
          </span>
          <button
            onClick={handleIncrease}
            disabled={participantCount === 20}
            aria-label="Increase participants"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            +
          </button>
        </div>
      </div>

      {showImpostorCounter && (
        <ImpostorCounter
          participantCount={participantCount}
          value={clampedImpostorCount}
          onChange={setImpostorCount}
          randomImpostorCount={randomImpostorCount}
          onRandomImpostorCountChange={setRandomImpostorCount}
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
  );
}
