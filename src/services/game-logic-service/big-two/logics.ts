import { Effect, Option, pipe } from "effect"
import { GameState, Move, Pass, Play } from "./types"
import { GameLogicError } from "../../../utils/errors"
import { updateScores } from "./scoring"
import { Seat } from "./constants"

const isMoveByCurrentSeat = (gameState: GameState) => (move: Move): boolean => gameState.currentSeat === move.seat
const isLeadingPlayExists = (gameState: GameState): boolean => Option.isSome(gameState.leadingPlay)
const isPassingToLeadingPlayer = (pass: Pass) => (gameState: GameState): boolean => Option.match(gameState.leadingPlay, {
    onNone: () => false,
    onSome: (leadingPlay) => leadingPlay.seat === pass.seat
})

const assignCurrentSeatToNextPlayer = (gameState: GameState): GameState => ({ ...gameState, currentSeat: Seat.getNext(gameState.currentSeat) })
const clearLeadingPlay = (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.none() })
const updateLeadingPlay = (play: Play) => (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.some(play) })
const removeHandsByPlay = (play: Play) => (gameState: GameState): GameState => {
    const updatedPlayers = gameState.players.map(player => {
        if (player.seat === play.seat) {
            return {
                ...player,
                hands: player.hands.filter(card => !card.existsIn(play.cards))
            }
        } else {
            return player
        }
    })
    return {
        ...gameState,
        players: updatedPlayers,
    }
}
const updateWinner = (winner: Seat) => (gameState: GameState): GameState => ({ ...gameState, winner: Option.some(winner) })

const settleIfWinnerExists = (gameState: GameState): GameState => {
    const winner = gameState.players.find(player => player.hands.length < 1)
    if (winner) {
        return pipe(
            gameState,
            updateWinner(winner.seat),
            updateScores
        )
    } else {
        return gameState
    }
}

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
    const processPlay = pipe(
        gameState,
        removeHandsByPlay(play),
        updateLeadingPlay(play),
        assignCurrentSeatToNextPlayer,
        settleIfWinnerExists
    )

    if (isLeadingPlayExists(gameState)) {
        if (play.canBeat(Option.getOrThrow(gameState.leadingPlay))) {
            return Effect.succeed(processPlay)
        } else {
            return Effect.fail(new GameLogicError("This play cannot beat the leading play."))
        }
    } else {
        return Effect.succeed(processPlay)
    }
}

export const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
    if (Option.isNone(gameState.winner)) {
        if (isMoveByCurrentSeat(gameState)(move)) {
            if (move instanceof Pass) {
                return makePass(move)(gameState)
            } else if (move instanceof Play) {
                return makePlay(move)(gameState)
            }
        } else {
            return Effect.fail(new GameLogicError("The move is not requested by current seat."))
        }
    } else {
        return Effect.fail(new GameLogicError("Cannot make a move because a winner already exists."))
    }
}