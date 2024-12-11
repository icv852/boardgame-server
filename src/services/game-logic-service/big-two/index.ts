import { Effect, pipe } from "effect";
import { GameState, Move, Play } from "./types";
import { GameLogicError } from "../../../utils/errors";
import { Validation, Mutation, makePass, makePlay, getFreshGameState } from "./functions";

export const makeMove = (move: Move) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    Effect.succeed(gameState),
    Effect.flatMap(Validation.failIfWinnerExists),
    Effect.flatMap(move instanceof Play ? makePlay(move) : makePass(move))
)

export const startNewGame = (gameState: GameState): GameState => pipe(
    gameState,
    Mutation.resetLead,
    Mutation.resetSuspectAssistance,
    Mutation.deliverHands,
    Mutation.assignCurrentToDiamond3Holder,
)

export const initiateGameState = (playerIds: string[]): GameState => getFreshGameState(playerIds)