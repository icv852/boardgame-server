import { GameState, Move, Play, Pass, Card } from "./types"
import { Seat, Rank, Suit, ValidStraights, FiveCardPlay } from "./constants"
import { areSetsEqual } from "../../../utils/helpers"
import { Effect } from "effect"

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
const getSuitsOfCards = (cards: Card[]): Suit[] => cards.map(card => getSuitOfCard(card))
const getNumberOfDiffRanksInCards = (cards: Card[]): number => new Set(getRanksOfCards(cards)).size
const getNumberOfCardsByRank = (cards: Card[]) => (rank: Rank): number => getNumberOfCards(cards.filter(card => getRankOfCard(card) === rank))
const getBiggestRankFromCards = (cards: Card[]): Rank => getRanksOfCards(cards).reduce((prev, curr) => curr > prev ? curr : prev, Rank.Three)
const getBiggestSuitFromCards = (cards: Card[]): Suit => getSuitsOfCards(cards).reduce((prev, curr) => curr > prev ? curr : prev, Suit.Diamond)
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
const getSeatOfMove = (move: Move): Seat => move.seat
const isMoveByCurrentSeat = (gameState: GameState) => (move: Move): boolean => getCurrentSeat(gameState) === getSeatOfMove(move)
const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
    if (isMoveByCurrentSeat(gameState)(move)) {
        
    } else {
        return Effect.fail(new Error("TBD"))
    }
}

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