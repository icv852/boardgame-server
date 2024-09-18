import { Effect, Option } from "effect"
import { GameState, Move } from "./types"

const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
    return
}