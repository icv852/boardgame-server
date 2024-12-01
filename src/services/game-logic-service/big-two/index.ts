import { Effect, Either, Option, pipe } from "effect";
import { Card, GameState, Move, Pass, Play } from "./types";
import { GameLogicError } from "../../../utils/errors";
import { Seat } from "./constants";

const assignCurrentToNextPlayer = (gameState: GameState): GameState =>({ ...gameState, current: Seat.getNext(gameState.current) })

const isLeadExists = (gameState: GameState): boolean => Option.isSome(gameState.lead)

const failIfLeadNotExists = (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    Effect.succeed(gameState),
    Effect.andThen(gs => isLeadExists(gs) ? Effect.succeed(gs) : Effect.fail(new GameLogicError("Can't make a pass when lead doesn't exist.")))
)

const resetLeadIfPassingToLead = (pass: Pass) => (gameState: GameState): GameState => pipe(
    gameState.lead,
    Option.andThen(lead => Seat.getNext(pass.seat) === lead.seat),
    Option.getOrElse(() => false),
    isPassingToLead => isPassingToLead ? ({ ...gameState, lead: Option.none() }) : gameState
)

const checkIfPassSuspectAssistance = (pass: Pass) => (gameState: GameState): GameState => {
    // const nextPlayerHands = gameState.players.find(player => player.seat === Seat.getNext(gameState.current)).hands
    // if (nextPlayerHands.length === 1) {

    // } else {
    //     return gameState
    // }
    const result = pipe(
        gameState.players.find(player => player.seat === Seat.getNext(gameState.current)).hands.length === 1,
        isNextPlayerLastCard => isNextPlayerLastCard ? Either.right(gameState) : Either.left(false),
        Either.andThen(gs => isLeadExists(gs) ? Either.right(gs) : Either.left(false)),
        Either.andThen(gs => Option.getOrThrow(gs.lead).cards.length === 1 ? Either.right(gs) : Either.left(false)),
        Either.andThen(gs => {
            const leadCard = Option.getOrThrow(gs.lead).cards[0]
            gs.players.find(player => player.seat === pass.seat).hands.reduce((prev, curr) => curr.canBeat(leadCard) ? true : prev, false)
        })
    )
}

/**
check ding dai:
if (nextSeat.card === 1) {
    if (leadingPlay > 1) {
        false
    } else if (leadingPlay === null) {
        if (play > 1) {
            false
        } else {
            CHECK: play is biggest in hands
        }
    } else if (leadingPlay === 1) {
        CHECK: if play, is play biggest in hands; if pass, is biggest in hands cannot beat leadingPlay
    }
} else {
    false
}

*/


export const makeMove = (move: Move) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => {
    
}

const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => {
    const result = pipe(
        Effect.succeed(gameState),
        Effect.andThen(failIfLeadNotExists),
        Effect.andThen(resetLeadIfPassingToLead(pass)),
        Effect.andThen(assignCurrentToNextPlayer),
    )

    return result
}