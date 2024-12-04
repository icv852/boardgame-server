import { Effect, Option, pipe } from "effect";
import { Card, GameState, Move, Pass, Play, Player, Single } from "./types";
import { GameLogicError } from "../../../utils/errors";
import { NUM_FULL_HANDS, Rank, Seat, Suit } from "./constants";

const CARD_DIAMOND_3 = new Card(Suit.Diamond, Rank.Three)
const CARD_SPADE_2 = new Card(Suit.Spade, Rank.Two)
const CARD_HEART_2 = new Card(Suit.Heart, Rank.Two)
const CARD_CLUB_2 = new Card(Suit.Club, Rank.Two)
const CARD_DIAMOND_2 = new Card(Suit.Diamond, Rank.Two)

const getPlayer = (seat: Seat) => (gameState: GameState): Player => gameState.players.find(player => player.seat === seat)

const getPlayerBiggestHand = (seat: Seat) => (gameState: GameState): Card => Card.getBiggest(getPlayer(seat)(gameState).hands)

const getWinner = (gameState: GameState): Option.Option<Seat> => pipe(
    gameState.players.find(player => player.hands.length < 1),
    winner => winner ? Option.some(winner.seat) : Option.none()
)

const getPenaltyByRemainingHands = (hands: Card[]): number => {
    const numberOfRemainingHands = hands.length
    const isMoreThanNineCards = numberOfRemainingHands > 9
    const hasRemainingTwo = [CARD_SPADE_2, CARD_HEART_2, CARD_CLUB_2, CARD_DIAMOND_2].some(card => card.existsIn(hands))
    const multiplier = (isMoreThanNineCards ? 2 : 1) * (hasRemainingTwo ? 2 : 1)
    return numberOfRemainingHands * multiplier
}

const Validation = {
    failIfLeadNotExists: (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        Option.isSome(gameState.lead),
        leadExists => leadExists ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("Cannot pass when the lead doesn't exist."))
    ),
    failIfFirstPlayNotIncludeDiamond3: (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        !gameState.players.some(player => player.hands.length < NUM_FULL_HANDS),
        isFirstPlay => isFirstPlay && play.cards.some(card => Card.isSame([card, CARD_DIAMOND_3])) ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("First play must include Diamond 3."))
    ),
    failIfPlayCannotBeatLead: (play: Play) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
        Option.some(gameState),
        Option.flatMap(gs => Option.isSome(gs.lead) ? Option.some(gs) : Option.none()),
        Option.flatMap(gs => play.canBeat(Option.getOrThrow(gs.lead)) ? Option.none() : Option.some(gs)),
        Option.map(() => Effect.fail(new GameLogicError("Current play cannot beat the lead."))),
        Option.getOrElse(() => Effect.succeed(gameState))
    )
}

const Mutation = {
    updateSuspectAssistance: (move: Move) => (gameState: GameState): GameState => pipe(
        Option.some(gameState),
        Option.flatMap(gs => getPlayer(Seat.getNext(gs.current))(gs).hands.length === 1 ? Option.some(gs) : Option.none()),
        Option.flatMap(gs => (Option.some(gs.lead) && !(Option.getOrThrow(gs.lead) instanceof Single)) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Play && !(move.value instanceof Single) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Play && (move.value instanceof Single) && Card.isSame([getPlayerBiggestHand(gs.current)(gs), move.value.card]) ? Option.none() : Option.some(gs)),
        Option.flatMap(gs => move instanceof Pass && (Option.getOrNull(gs.lead) instanceof Single) && !getPlayerBiggestHand(gs.current)(gs).canBeat((Option.getOrThrow(gs.lead).value as Single).card) ? Option.none() : Option.some(gs)),
        Option.map(gs => ({ ...gs, suspectedAssistance: true })),
        Option.getOrElse(() => ({ ...gameState, suspectedAssistance: false}))
    ),
    updateLead: (play: Play) => (gameState: GameState): GameState => ({ ...gameState, lead: Option.some(play) }),
    updatePlayer: (updater: (player: Player) => Player) => (seat: Seat) => (gameState: GameState): GameState => ({ ...gameState, players: gameState.players.map(p => p.seat === seat ? updater(p) : p) }),
    resetLeadIfPassToLead: (gameState: GameState): GameState => Seat.getNext(gameState.current) === Option.getOrNull(gameState.lead).seat ? ({ ...gameState, lead: Option.none() }) : gameState,
    assignCurrentToNextSeat: (gameState: GameState): GameState => ({ ...gameState, current: Seat.getNext(gameState.current) }),
    removeCurrentHands: (play: Play) => (gameState: GameState): GameState => Mutation.updatePlayer(p => ({ ...p, hands: p.hands.filter(hand => !play.cards.includes(hand)) }))(gameState.current)(gameState),
    
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
        ? pipe(gs, Mutation.updateScores) // TBD
        : pipe(gs, Mutation.updateSuspectAssistance(play), Mutation.updateLead(play), Mutation.assignCurrentToNextSeat)
    )
)