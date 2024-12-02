import { Effect, Option, pipe } from "effect";
import { Card, GameState, Move, Pass, Play, Player, Single } from "./types";
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

const getPlayerBySeat = (seat: Seat) => (gameState: GameState): Player => gameState.players.find(player => player.seat === seat)

const isNextPlayerLastCard = (gameState: GameState): boolean => getPlayerBySeat(Seat.getNext(gameState.current))(gameState).hands.length === 1

const isLeadSingle = (gameState: GameState): boolean => Option.match(gameState.lead, { onSome: lead => lead.value instanceof Single, onNone: () => false })

const checkIfPassSuspectAssistance = (pass: Pass) => (gameState: GameState): GameState => pipe(
    isNextPlayerLastCard(gameState),
    isNextPlayerLastCard => isNextPlayerLastCard ? Option.some(gameState) : Option.none(),
    Option.andThen(gs => isLeadSingle(gs) ? Option.some(gs) : Option.none()),
    Option.andThen(gs => {
        const leadCard = Option.getOrThrow(gs.lead).cards[0]
        return getPlayerBySeat(pass.seat)(gameState).hands.some(hand => hand.canBeat(leadCard)) ? Option.some(gs) : Option.none()
    }),
    Option.andThen(gs => ({ ...gs, suspectedAssistance: true })),
    Option.getOrElse(() => ({ ...gameState, suspectedAssistance: false }))
)

const checkIfPlaySuspectAssistance = (play: Play) => (gameState: GameState): GameState => pipe(
    isNextPlayerLastCard(gameState),
    isNextPlayerLastCard => isNextPlayerLastCard ? Option.some(gameState) : Option.none(),
    Option.andThen(gs => play.value instanceof Single ? Option.some(gs) : Option.none()),
    Option.andThen(gs => Option.match(gs.lead, { 
        onSome: lead => lead.value instanceof Single ? Option.some(gs) : Option.none(), 
        onNone: () => Option.some(gs) 
    })),
    Option.andThen(gs => Card.isSame([Card.getBiggest(getPlayerBySeat(gs.current)(gs).hands), play.cards[0]]) ? Option.none() : Option.some(gs)),
    Option.andThen(gs => ({ ...gs, suspectedAssistance: true })),
    Option.getOrElse(() => ({ ...gameState, suspectedAssistance: false }))
)

const failIfCurrentPlayCannotBeatLead = (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    gameState.lead,
    lead => Option.match(lead, { 
        onNone: () => Effect.succeed(gameState), 
        onSome: lead => play.canBeat(lead) ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("Current play cannot beat the lead."))
    })
    
)

export const makeMove = (move: Move) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => {
    
}

const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    Effect.succeed(gameState),
    Effect.andThen(failIfLeadNotExists),
    Effect.andThen(checkIfPassSuspectAssistance(pass)),
    Effect.andThen(resetLeadIfPassingToLead(pass)),
    Effect.andThen(assignCurrentToNextPlayer),
)

const makePlay = (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => {
    const result = pipe(
        Effect.succeed(gameState),
        Effect.andThen(failIfCurrentPlayCannotBeatLead(play)),
        Effect.andThen(checkIfPlaySuspectAssistance(play))
        // isLeadExists(gameState),
        // isLeadExists => isLeadExists ? pipe(play.canBeat(Option.getOrThrow(gameState.lead)), canBeat => canBeat ? gameState : Effect.fail(new GameLogicError("Current play cannot beat the lead."))) : gameState,

    )
}