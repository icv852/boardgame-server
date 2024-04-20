function hasSameRank(cards: Card[]): boolean {
    return cards.every(card => card.rank === cards[0].rank)
}

function hasSameSuit(cards: Card[]): boolean {
    return cards.every(card => card.suit === cards[0].suit)
}

function sortByRanks(cards: Card[]): Card[] {
    const cardsCopy = [...cards]
    cardsCopy.sort((a, b) => a.rank - b.rank)
    return cardsCopy
}

function isPair(cards: Card[]): boolean {
    return cards.length === 2 && hasSameRank(cards)
}
function isTriple(cards: Card[]): boolean {
    return cards.length === 3 && hasSameRank(cards)
}

function isFiveCardHand() {}

function isStraight(cards: Card[]): boolean {
    if (cards.length !== 5) {
        return false
    }
    // TBD
    return false
}

function isFlush() {}

function isFullHouse() {}

function isFourOfAKind() {}

function isStraightFlush() {}