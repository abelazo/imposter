## Impostor Game Web App

A browser-based party game assistant for groups of 3–10 players. One player (or more) is secretly the **impostor** — they don't know the secret word that everyone else shares. Through open conversation, the group tries to identify the impostor before they blend in.

### How it works

1. **Setup** — Choose a topic, add 3–10 players, and set how many impostors there will be (or let the app randomize it).
2. **Role reveal** — Players take turns holding the shared device. Each player taps "Show the word" to privately see their role:
   - **Civilians** see the secret word.
   - **Impostors** see "IMPOSTOR" instead of the word — they must bluff their way through.
3. **Discussion** — Everyone gives clues or comments about the word without saying it outright. Impostors must fake familiarity with a word they don't know.
4. **Vote** — The group votes on who they think the impostor is.

### Rules

- Civilians know the word; impostors do not.
- The impostor wins by avoiding detection until the vote.
- Civilians win by correctly identifying all impostors.
- Minimum 3 players; maximum 20 players.
- Impostor count is capped at half the total player count.

### App features

- Remote word bank loaded from a YAML file and cached in memory
- Multiple topics to choose from
- Optional randomized impostor count for extra unpredictability
- Last-used word is excluded from the next draw to avoid repetition
- Game settings (player count, impostor count, topic) saved in `localStorage` and restored on the next session

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for development setup and guidelines.
