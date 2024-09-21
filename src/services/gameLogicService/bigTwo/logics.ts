import { Effect, Option, pipe } from "effect"
import { GameState, Move, Pass, Play, Seat } from "./types"
import { GameLogicError } from "../../../utils/errors"

const isMoveByCurrentSeat = (gameState: GameState) => (move: Move): boolean => gameState.currentSeat === move.seat
const isLeadingPlayExists = (gameState: GameState): boolean => Option.isSome(gameState.leadingPlay)
const isPassingToLeadingPlayer = (pass: Pass) => (gameState: GameState): boolean => Option.match(gameState.leadingPlay, {
    onNone: () => false,
    onSome: (leadingPlay) => leadingPlay.seat === pass.seat
})

const assignCurrentSeatToNextPlayer = (gameState: GameState): GameState => ({ ...gameState, currentSeat: gameState.currentSeat.next })
const clearLeadingPlay = (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.none() })

const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, Error> => {
    if (isLeadingPlayExists(gameState)) {
        if (isPassingToLeadingPlayer(pass)(gameState)) {
            return Effect.succeed(pipe(
                gameState,
                clearLeadingPlay,
                assignCurrentSeatToNextPlayer
            ))
        } else {
            return Effect.succeed(assignCurrentSeatToNextPlayer(gameState))
        }
    } else {
        return Effect.fail(new GameLogicError("Cannot pass when leading play not exists."))
    }
}

const makePlay = (play: Play) => (gameState: GameState): Effect.Effect<GameState, Error> => {
    return
}

export const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
    if (isMoveByCurrentSeat(gameState)(move)) {
        if (move instanceof Pass) {
            return makePass(move)(gameState)
        } else if (move instanceof Play) {
            return makePlay(move)(gameState)
        }
    } else {
        return Effect.fail(new GameLogicError("The move is not requested by current seat."))
    }
}