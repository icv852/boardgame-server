import { Effect, Option, pipe } from "effect";
import { Card, Deck, GameState, Move, Pass, Play, Player, Single } from "./types";
import { GameLogicError } from "../../../utils/errors";
import { Rank, Seat, Suit } from "./constants";
import { getGainedOrDeductedScore } from "./scoring";

const CARD_DIAMOND_3 = new Card(Suit.Diamond, Rank.Three)

const getPlayer = (seat: Seat) => (gameState: GameState): Player => gameState.players.find(player => player.seat === seat)

const getPlayerBiggestHand = (seat: Seat) => (gameState: GameState): Option.Option<Card> => getPlayer(seat)(gameState).hands.getBiggest()

const getWinner = (gameState: GameState): Option.Option<Seat> => pipe(
    gameState.players.find(player => player.hands.isEmpty()),
    winner => winner ? Option.some(winner.seat) : Option.none()
)

const Validation = {
    failIfLeadNotExists: (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        Option.isSome(gameState.lead),
        leadExists => leadExists ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("Cannot pass when the lead doesn't exist."))
    ),
    failIfFirstPlayNotIncludeDiamond3: (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        !gameState.players.some(player => !player.hands.isFull()),
        isFirstPlay => isFirstPlay && play.cards.some(card => Card.isSame([card, CARD_DIAMOND_3])) ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("First play must include Diamond 3."))
    ),
    failIfPlayCannotBeatLead: (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        Option.some(gameState),
        Option.flatMap(gs => Option.isSome(gs.lead) ? Option.some(gs) : Option.none()),
        Option.flatMap(gs => play.canBeat(Option.getOrThrow(gs.lead)) ? Option.none() : Option.some(gs)),
        Option.map(() => Effect.fail(new GameLogicError("Current play cannot beat the lead."))),
        Option.getOrElse(() => Effect.succeed(gameState))
    ),
    failIfWinnerExists: (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        getWinner(gameState),
        Option.isSome,
        winnerExists => winnerExists ? Effect.fail(new GameLogicError("Cannot make a move when the game is finished.")) : Effect.succeed(gameState)
    )
}

const Mutation = {
    updateSuspectAssistance: (move: Move) => (gameState: GameState): GameState => pipe(
        Option.some(gameState),
        Option.flatMap(gs => getPlayer(Seat.getNext(gs.current))(gs).hands.isLastCard() ? Option.some(gs) : Option.none()),
        Option.flatMap(gs => (Option.some(gs.lead) && !(Option.getOrThrow(gs.lead) instanceof Single)) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Play && !(move.value instanceof Single) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Play && (move.value instanceof Single) && Card.isSame([Option.getOrThrow(getPlayerBiggestHand(gs.current)(gs)), move.value.card]) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Pass && (Option.getOrNull(gs.lead) instanceof Single) && !Option.getOrThrow(getPlayerBiggestHand(gs.current)(gs)).canBeat((Option.getOrThrow(gs.lead).value as Single).card) ? Option.none() : Option.some(gs)),
        Option.map(gs => ({ ...gs, suspectedAssistance: true })),
        Option.getOrElse(() => ({ ...gameState, suspectedAssistance: false}))
    ),
    updateLead: (play: Play) => (gameState: GameState): GameState => ({ ...gameState, lead: Option.some(play) }),
    updatePlayer: (updater: (player: Player) => Player) => (seat: Seat) => (gameState: GameState): GameState => ({ ...gameState, players: gameState.players.map(p => p.seat === seat ? updater(p) : p) }),
    resetLead: (gameState: GameState): GameState => ({ ...gameState, lead: Option.none() }),
    resetSuspectAssistance: (gameState: GameState): GameState => ({ ...gameState, suspectedAssistance: false }),
    resetLeadIfPassToLead: (gameState: GameState): GameState => Seat.getNext(gameState.current) === Option.getOrNull(gameState.lead).seat ? ({ ...gameState, lead: Option.none() }) : gameState,
    assignCurrentToNextSeat: (gameState: GameState): GameState => ({ ...gameState, current: Seat.getNext(gameState.current) }),
    assignCurrentToDiamond3Holder: (gameState: GameState): GameState => ({ ...gameState, current: gameState.players.find(p => p.hands.hasCard(CARD_DIAMOND_3)).seat }),
    removeCurrentHands: (play: Play) => (gameState: GameState): GameState => Mutation.updatePlayer(p => ({ ...p, hands: p.hands.remove(play) }))(gameState.current)(gameState),
    updateScores: (gameState: GameState): GameState => ({ ...gameState, players: gameState.players.map(p => ({ ...p, score: p.score + getGainedOrDeductedScore(p.seat)(gameState) })) }),
    deliverHands: (gameState: GameState): GameState => ({ ...gameState, players: (() => { 
        const deck = new Deck()
        const handsArray = deck.deliverHands()
        return gameState.players.map((p, i) => ({ ...p, hands: handsArray[i] }))
    })() }),
}

const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    Effect.succeed(gameState),
    Effect.flatMap(Validation.failIfLeadNotExists),
    Effect.map(Mutation.updateSuspectAssistance(pass)),
    Effect.map(Mutation.resetLeadIfPassToLead),
    Effect.map(Mutation.assignCurrentToNextSeat)
)

const makePlay = (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    Effect.succeed(gameState),
    Effect.flatMap(Validation.failIfFirstPlayNotIncludeDiamond3(play)),
    Effect.flatMap(Validation.failIfPlayCannotBeatLead(play)),
    Effect.map(Mutation.removeCurrentHands(play)),
    Effect.map(gs => Option.isSome(getWinner(gs))
        ? pipe(gs, Mutation.updateScores)
        : pipe(gs, Mutation.updateSuspectAssistance(play), Mutation.updateLead(play), Mutation.assignCurrentToNextSeat)
    )
)

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