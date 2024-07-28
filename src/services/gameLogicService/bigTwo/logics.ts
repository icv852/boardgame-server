import { GameState, Move, Play, Pass, Card, Player } from "./types"
import { Seat, Rank, Suit, ValidStraights, FiveCardPlay } from "./constants"
import { areSetsEqual } from "../../../utils/helpers"
import { GameLogicError } from "../../../utils/errors"
import { Effect, Option, pipe } from "effect"
/**
logics:

if current seat:
    if pass:
        if valid pass: apply move
        else: error
    if play:
        if valid play:
            if leadingPlay exists:
                if can beat leadingPlay: apply move
                else: error
            else: apply move
        else: error
else: error
*/

const CardDiamondThree: Card = { rank: Rank.Three, suit: Suit.Diamond }

// card combinations
const getRankOfCard = (card: Card): Rank => card.rank
const getSuitOfCard = (card: Card): Suit => card.suit
const getNumberOfCards = (cards: Card[]): number => cards.length
const getRanksOfCards = (cards: Card[]): Rank[] => cards.map(card => getRankOfCard(card))
const getNumberOfDiffRanksInCards = (cards: Card[]): number => new Set(getRanksOfCards(cards)).size
const getNumberOfCardsByRank = (cards: Card[]) => (rank: Rank): number => getNumberOfCards(cards.filter(card => getRankOfCard(card) === rank))
const getPivotFromCards = (cards: Card[]): Card => cards.reduce((prev, curr) => canCardABeatCardB(prev)(curr) ? prev : curr, CardDiamondThree)
const getFiveCardPlayRank = (cards: Card[]): FiveCardPlay => isStraight(cards) ? FiveCardPlay.Straight : isFlush(cards) ? FiveCardPlay.Flush : isFullHouse(cards) ? FiveCardPlay.FullHouse : isFourOfAKind(cards) ? FiveCardPlay.FourOfAKind : FiveCardPlay.StraightFlush
const getStraightRank = (cards: Card[]): number => ValidStraights.filter(vs => areSetsEqual(vs.combination, new Set(getRanksOfCards(cards))))[0].rank
const getNumberOfRankInCards = (cards: Card[]) => (rank: Rank): number => getRanksOfCards(cards).filter(rk => rk === rank).length
const getMostAppearingRankInCards = (cards: Card[]): Rank => getRanksOfCards(cards).reduce((prev, curr) => getNumberOfRankInCards(cards)(curr) > getNumberOfRankInCards(cards)(prev) ? curr : prev, getRankOfCard(cards[0]))

const hasSameRanks = (cards: Card[]): boolean => cards.every(card => getRankOfCard(card) === getRankOfCard(cards[0]))
const hasSameSuits = (cards: Card[]): boolean => cards.every(card => getSuitOfCard(card) === getSuitOfCard(cards[0]))
const hasStraightCombination = (cards: Card[]): boolean => ValidStraights.filter(vs => areSetsEqual(vs.combination, new Set(getRanksOfCards(cards)))).length > 0
const isSingle = (cards: Card[]): boolean => getNumberOfCards(cards) === 1
const isPair = (cards: Card[]): boolean => getNumberOfCards(cards) === 2 && hasSameRanks(cards)
const isTriple = (cards: Card[]): boolean => getNumberOfCards(cards) === 3 && hasSameRanks(cards)
const isStraight = (cards: Card[]): boolean => getNumberOfCards(cards) === 5 && hasStraightCombination(cards) && !hasSameSuits(cards)
const isFlush = (cards: Card[]): boolean => getNumberOfCards(cards) === 5 && hasSameSuits(cards) && !hasStraightCombination(cards)
const isFullHouse = (cards: Card[]): boolean => getNumberOfCards(cards) === 5 && getNumberOfDiffRanksInCards(cards) === 2 && [2, 3].includes(getNumberOfCardsByRank(cards)(getRankOfCard(cards[0])))
const isFourOfAKind = (cards: Card[]): boolean => getNumberOfCards(cards) === 5 && getNumberOfDiffRanksInCards(cards) === 2 && [1, 4].includes(getNumberOfCardsByRank(cards)(getRankOfCard(cards[0])))
const isStraightFlush = (cards: Card[]): boolean => getNumberOfCards(cards) === 5 && hasStraightCombination(cards) && hasSameSuits(cards)
const isFiveCardPlay = (cards: Card[]): boolean => isStraight(cards) || isFlush(cards) || isFullHouse(cards) || isFourOfAKind(cards) || isStraightFlush(cards)
const isValidPlay = (cards: Card[]): boolean => isSingle(cards) || isPair(cards) || isTriple(cards) || isFiveCardPlay(cards)

// card comparisons
// const haveSameNumberOfCards = (cardsA: Card[]) => (cardsB: Card[]): boolean => getNumberOfCards(cardsA) === getNumberOfCards(cardsB)
const areSameCards = (a: Card) => (b: Card): boolean => getRankOfCard(a) === getRankOfCard(b) && getSuitOfCard(a) === getSuitOfCard(b)
const isCardExistsInCards = (cards: Card[]) => (target: Card): boolean => cards.some(card => areSameCards(card)(target))
const canCardABeatCardB = (a: Card) => (b: Card): boolean => getRankOfCard(a) > getRankOfCard(b) || (getRankOfCard(a) === getRankOfCard(b) && getSuitOfCard(a) > getSuitOfCard(b))
const canSingleABeatSingleB = (a: Card[]) => (b: Card[]): boolean => canCardABeatCardB(getPivotFromCards(a))(getPivotFromCards(b))
const canPairABeatPairB = (a: Card[]) => (b: Card[]): boolean => canCardABeatCardB(getPivotFromCards(a))(getPivotFromCards(b))
const canTripleABeatTripleB = (a: Card[]) => (b: Card[]): boolean => canCardABeatCardB(getPivotFromCards(a))(getPivotFromCards(b))
const canStraightABeatStraightB = (a: Card[]) => (b: Card[]): boolean => getStraightRank(a) > getStraightRank(b) || (getStraightRank(a) === getStraightRank(b) && canCardABeatCardB(getPivotFromCards(a))(getPivotFromCards(b)))
const canFlushABeatFlushB = (a: Card[]) => (b: Card[]): boolean => canCardABeatCardB(getPivotFromCards(a))(getPivotFromCards(b))
const canFullHouseABeatFullHouseB = (a: Card[]) => (b: Card[]): boolean => getMostAppearingRankInCards(a) > getMostAppearingRankInCards(b)
const canFourOfAKindABeatFourOfAKindB = (a: Card[]) => (b: Card[]): boolean => getMostAppearingRankInCards(a) > getMostAppearingRankInCards(b)
const canStraightFlushABeatStraightFlushB = (a: Card[]) => (b: Card[]): boolean => canStraightABeatStraightB(a)(b)
const canFiveCardABeatFiveCardB = (a: Card[]) => (b: Card[]): boolean => {
    if (getFiveCardPlayRank(a) > getFiveCardPlayRank(b)) {
        return true
    } else if (getFiveCardPlayRank(a) === getFiveCardPlayRank(b)) {
        if (isStraight(a)) return canStraightABeatStraightB(a)(b)
        if (isFlush(a)) return canFlushABeatFlushB(a)(b)
        if (isFullHouse(a)) return canFullHouseABeatFullHouseB(a)(b)
        if (isFourOfAKind(a)) return canFourOfAKindABeatFourOfAKindB(a)(b)
        if (isStraightFlush(a)) return canStraightFlushABeatStraightFlushB(a)(b)
    }
    return false
}


// game state
const getCurrentSeat = (gameState: GameState): Seat => gameState.currentSeat
const getPlayers = (gameState: GameState): Player[] => gameState.players
const getLeadingPlay = (gameState: GameState): Option.Option<Play> => gameState.leadingPlay
const getSeatOfMove = (move: Move): Seat => move.seat
const getCardsOfPlay = (play: Play): Card[] => play.cards
const getSeatOfPlayer = (player: Player): Seat => player.seat
const getHandsOfPlayer = (player: Player): Card[] => player.hands
const getNextSeat = (seat: Seat): Seat => {
    switch (seat) {
        case Seat.North: return Seat.West
        case Seat.West: return Seat.South
        case Seat.South: return Seat.East
        case Seat.East: return Seat.North
    }
}
const getSeatWithEmptyHands = (gameState: GameState): Option.Option<Seat> => {
    const playersWithEmptyHands = getPlayers(gameState).filter(player => isHandsEmpty(getHandsOfPlayer(player)))
    return playersWithEmptyHands.length < 1 ? Option.none() : Option.some(getSeatOfPlayer(playersWithEmptyHands[0]))
}

const isMoveByCurrentSeat = (gameState: GameState) => (move: Move): boolean => getCurrentSeat(gameState) === getSeatOfMove(move)
const isLeadingPlayExists = (gameState: GameState): boolean => Option.isSome(getLeadingPlay(gameState))
const isPassingToLeadingPlayer = (pass: Pass) => (gameState: GameState): boolean => Option.match(getLeadingPlay(gameState), {
    onNone: () => false,
    onSome: (leadingPlay) => getSeatOfMove(leadingPlay) === getSeatOfMove(pass)
})
const isHandsEmpty = (hands: Card[]): boolean => hands.length < 1

const removeHandsByPlay = (play: Play) => (gameState: GameState): GameState => {
    const updatedPlayers = getPlayers(gameState).map(player => {
        if (getSeatOfPlayer(player) === getSeatOfMove(play)) {
            return {
                ...player,
                hands: getHandsOfPlayer(player).filter(card => !isCardExistsInCards(getCardsOfPlay(play))(card))
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
const updateLeadingPlay = (play: Play) => (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.some(play) })
const clearLeadingPlay = (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.none() })
const assignCurrentSeatToNextPlayer = (gameState: GameState): GameState => ({ ...gameState, currentSeat: getNextSeat(getCurrentSeat(gameState)) })
const updateWinner = (winnerSeat: Seat) => (gameState: GameState): GameState => ({ ...gameState, winner: Option.some(winnerSeat) })
const updateScores = (gameState: GameState): GameState => gameState // TBD
const settleIfWinnerExists = (gameState: GameState): GameState => {
    return Option.match(getSeatWithEmptyHands(gameState), {
        onNone: () => gameState,
        onSome: (winnerSeat) => pipe(
            gameState,
            updateWinner(winnerSeat),
            updateScores,
        )
    })
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
    if (isValidPlay(getCardsOfPlay(play))) {
        if (isLeadingPlayExists(gameState)) {
            
        } else {
            return Effect.succeed(pipe(
                gameState,
                removeHandsByPlay(play),
                updateLeadingPlay(play),
                settleIfWinnerExists
            ))
        }
    } else {
        return Effect.fail(new GameLogicError("Invalid play."))
    }
}

const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
    if (isMoveByCurrentSeat(gameState)(move)) {
        switch (move.type) {
            case "Pass": return makePass(pass)(gameState)
            case "Play": return makePlay(play)(gameState)
        }
    } else {
        return Effect.fail(new GameLogicError("The move is not requested by current seat."))
    }
}

/**
logics:

if current seat:
    if pass:
        if valid pass: apply move
        else: error
    if play:
        if valid play:
            if leadingPlay exists:
                if can beat leadingPlay: apply move
                else: error
            else: apply move
        else: error
else: error
*/

// const canBeatLeadingSingle = (leadingSingle: Card[]) => (currentSingle: Card[]):boolean => 
// const canBeatLeadingCards = (leadingCards: Card[]) => (cards: Card[]): boolean => {
//     if (haveSameNumberOfCards(leadingCards)(cards)) {
        
//     } else {
//         return false
//     }
// }

// // extract basic game infos
// const getCurrentSeat = (gameState: GameState): Seat => gameState.currentSeat
// const getLeadingPlay = (gameState: GameState): Option.Option<Play> => gameState.leadingPlay
// const getSeatOfLeadingPlay = (gameState: GameState): Option.Option<Seat> => Option.map(getLeadingPlay(gameState), lp => lp.seat)
// const getCardsOfLeadingPlay = (gameState: GameState): Option.Option<Card[]> => Option.map(getLeadingPlay(gameState), lp => lp.cards)
// const getSeatOfMove = (move: Move): Seat => move.seat
// const getTypeOfMove = (move: Move): string => move.type
// const getCardsOfPlay = (play: Play): Card[] => play.cards

// // determine facts in game
// const isCurrentSeat = (gameState: GameState) => (move: Move): boolean => getSeatOfMove(move) === getCurrentSeat(gameState)
// const isLeadingPlayExists = (gameState: GameState): boolean => Option.isSome(getLeadingPlay(gameState))
// const isPass = (move: Move): boolean => getTypeOfMove(move) === "Pass"
// const isPlay = (move: Move): boolean => getTypeOfMove(move) === "Play"
// //  const isPassValid = (gameState: GameState) => (pass: Pass) => isLeadingPlayExists(gameState) && (Option.getOrThrow(getSeatOfLeadingPlay(gameState)) !== getSeatOfMove(pass))
// const isPlayValid = (play: Play) => {
//     const cards = getCardsOfPlay(play)
//     return isSingle(cards) || isPair(cards) || isTriple(cards) || isFiveCardPlay(cards)
// }
// const canBeatLeadingPlay = (gameState: GameState) => (play: Play) => {
//     const leadingCards = getCardsOfLeadingPlay(gameState)
// }