import { Card } from "./types"
import { Straights } from "./constants"
import _, { stubFalse } from "lodash"

export function hasSameRank(cards: Card[]): boolean {
    return cards.every(card => card.rank === cards[0].rank)
}

export function hasSameSuit(cards: Card[]): boolean {
    return cards.every(card => card.suit === cards[0].suit)
}

export function isPair(cards: Card[]): boolean {
    return cards.length === 2 && hasSameRank(cards)
}
export function isTriple(cards: Card[]): boolean {
    return cards.length === 3 && hasSameRank(cards)
}

export function isStraight(cards: Card[]): boolean {
    if (cards.length !== 5) {
        return false
    }
    const cardRanks = new Set(cards.map(card => card.rank))
    return Straights.filter(straight => _.isEqual(straight.hand, cardRanks)).length > 0 && !hasSameSuit(cards)
}

export function isFlush(cards: Card[]): boolean {
    if (cards.length !== 5) {
        return false
    }
    return hasSameSuit(cards) && !isStraightFlush(cards)
}

export function isFullHouse(cards: Card[]) {
    if (cards.length !== 5) {
        return false
    }
    const cardRanks = cards.map(card => card.rank)
    return (cardRanks.filter(cardRank => cardRank === cardRanks[0]).length === 2 || cardRanks.filter(cardRank => cardRank === cardRanks[0]).length === 3) && new Set(cardRanks).size === 2
}

export function isFourOfAKind(cards: Card[]) {
    if (cards.length !== 5) {
        return false
    }
    const cardRanks = cards.map(card => card.rank)
    return (cardRanks.filter(cardRank => cardRank === cardRanks[0]).length === 1 || cardRanks.filter(cardRank => cardRank === cardRanks[0]).length === 4) && new Set(cardRanks).size === 2
}

export function isStraightFlush(cards: Card[]) {
    if (cards.length !== 5) {
        return false
    }
    const cardRanks = new Set(cards.map(card => card.rank))
    return Straights.filter(straight => _.isEqual(straight.hand, cardRanks)).length > 0 && hasSameSuit(cards)
}