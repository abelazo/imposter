'use client'

interface ImpostorCounterProps {
  participantCount: number
  value: number
  onChange: (count: number) => void
}

export function ImpostorCounter({ participantCount, value, onChange }: ImpostorCounterProps) {
  // Max = floor(participants/2) - 1, but at least 1
  const maxImpostors = Math.max(1, Math.floor(participantCount / 2) - 1)
  const minImpostors = 1

  const canDecrease = value > minImpostors
  const canIncrease = value < maxImpostors

  const handleDecrease = () => {
    if (canDecrease) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (canIncrease) {
      onChange(value + 1)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <label id="impostor-label" className="text-lg">
        Impostors
      </label>
      <div className="flex items-center gap-3" aria-labelledby="impostor-label">
        <button
          onClick={handleDecrease}
          disabled={!canDecrease}
          aria-label="Decrease impostors"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-700 dark:hover:bg-zinc-600"
        >
          -
        </button>
        <span className="w-8 text-center text-xl font-semibold">{value}</span>
        <button
          onClick={handleIncrease}
          disabled={!canIncrease}
          aria-label="Increase impostors"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold hover:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-700 dark:hover:bg-zinc-600"
        >
          +
        </button>
      </div>
    </div>
  )
}
