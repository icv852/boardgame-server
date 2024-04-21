import { Card } from "./types"
import { Straights } from "./constants"
import _ from "lodash"

export function hasSameRank(cards: Card[]): boolean {
    return cards.every(card => card.rank === cards[0].rank)
}

export function hasSameSuit(cards: Card[]): boolean {
    return cards.every(card => card.suit === cards[0].suit)
}

export function sortByRanks(cards: Card[]): Card[] {
    const cardsCopy = [...cards]
    cardsCopy.sort((a, b) => a.rank - b.rank)
    return cardsCopy
}

export function isPair(cards: Card[]): boolean {
    return cards.length === 2 && hasSameRank(cards)
}
export function isTriple(cards: Card[]): boolean {
    return cards.length === 3 && hasSameRank(cards)
}

export function isFiveCardHand() {}

export function isStraight(cards: Card[]): boolean {
    if (cards.length !== 5) {
        return false
    }
    const cardRanks = new Set(cards.map(card => card.rank))
    return Straights.filter(straight => _.isEqual(straight.hand, cardRanks)).length > 0
}

export function isFlush() {}

export function isFullHouse() {}

export function isFourOfAKind() {}

export function isStraightFlush() {}