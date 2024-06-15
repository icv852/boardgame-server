import { GameState, Move, Play, Pass, Card } from "./types"
import { Seat, Rank, Suit, ValidStraights } from "./constants"
import { areSetsEqual } from "../../../utils/helpers"
import { Option } from "effect"

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


// card combinations
const getRankOfCard = (card: Card): Rank => card.rank
const getSuitOfCard = (card: Card): Suit => card.suit
const getNumberOfCards = (cards: Card[]): number => cards.length
const getRanksOfCards = (cards: Card[]): Rank[] => cards.map(card => getRankOfCard(card))
const getNumberOfDiffRanksInCards = (cards: Card[]): number => new Set(getRanksOfCards(cards)).size
const getNumberOfCardsByRank = (cards: Card[]) => (rank: Rank): number => getNumberOfCards(cards.filter(card => getRankOfCard(card) === rank))

const hasSameRanks = (cards: Card[]): boolean => cards.every(card => getRankOfCard(card) === getRankOfCard(cards[0]))
const hasSameSuits = (cards: Card[]): boolean => cards.every(card => getSuitOfCard(card) === getSuitOfCard(cards[0]))
const hasStraightCombination = (cards: Card[]): boolean => ValidStraights.filter(vs => areSetsEqual(vs.combination, new Set(getRanksOfCards(cards)))).length > 0
export const isSingle = (cards: Card[]) => getNumberOfCards(cards) === 1
export const isPair = (cards: Card[]) => getNumberOfCards(cards) === 2 && hasSameRanks(cards)
export const isTriple = (cards: Card[]) => getNumberOfCards(cards) === 3 && hasSameRanks(cards)
export const isStraight = (cards: Card[]) => getNumberOfCards(cards) === 5 && hasStraightCombination(cards) && !hasSameSuits(cards)
export const isFlush = (cards: Card[]) => getNumberOfCards(cards) === 5 && hasSameSuits(cards) && !hasStraightCombination(cards)
export const isFullHouse = (cards: Card[]) => getNumberOfCards(cards) === 5 && getNumberOfDiffRanksInCards(cards) === 2 && [2, 3].includes(getNumberOfCardsByRank(cards)(getRankOfCard(cards[0])))
export const isFourOfAKind = (cards: Card[]) => getNumberOfCards(cards) === 5 && getNumberOfDiffRanksInCards(cards) === 2 && [1, 4].includes(getNumberOfCardsByRank(cards)(getRankOfCard(cards[0])))
export const isStraightFlush = (cards: Card[]) => getNumberOfCards(cards) === 5 && hasStraightCombination(cards) && hasSameSuits(cards)
export const isFiveCardPlay = (cards: Card[]) => isStraight(cards) || isFlush(cards) || isFullHouse(cards) || isFourOfAKind(cards) || isStraightFlush(cards)

// extract basic game infos
export const getCurrentSeat = (gameState: GameState): Seat => gameState.currentSeat
export const getLeadingPlay = (gameState: GameState): Option.Option<Play> => gameState.leadingPlay
export const getSeatOfLeadingPlay = (gameState: GameState): Option.Option<Seat> => Option.map(getLeadingPlay(gameState), lp => lp.seat)
export const getCardsOfLeadingPlay = (gameState: GameState): Option.Option<Card[]> => Option.map(getLeadingPlay(gameState), lp => lp.cards)
export const getSeatOfMove = (move: Move): Seat => move.seat
export const getTypeOfMove = (move: Move): string => move.type
export const getCardsOfPlay = (play: Play): Card[] => play.cards

// determine facts in game
export const isCurrentSeat = (gameState: GameState) => (move: Move) : boolean => getSeatOfMove(move) === getCurrentSeat(gameState)
export const isPass = (move: Move): boolean => getTypeOfMove(move) === "Pass"
export const isPlay = (move: Move): boolean => getTypeOfMove(move) === "Play"
export const isPassValid = (gameState: GameState) => (move: Pass) => {
    const leadingPlay = getLeadingPlay(gameState)
    return Option.isSome(leadingPlay) && (Option.getOrThrow(getSeatOfLeadingPlay(gameState)) !== getSeatOfMove(move))
}