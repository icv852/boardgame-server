import { Suit, Rank, Seat } from "./constants"
import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
import { getPivotFromCards, haveSameRanks, haveSameSuits, getStraightRank, getNumberOfDiffRanksInCards, getRankByAppearedTimes } from "./helpers"

export interface Card {
    suit: Suit,
    rank: Rank
}

export interface Player {
    seat: Seat,
    score: number,
    hands: Card[]
}

export interface GameState {
    players: Player[],
    currentSeat: Seat,
    leadingPlay: Option.Option<Play>,
    winner: Option.Option<Seat>
}

export interface Play {
    type: "Play",
    seat: Seat,
    cards: Card[]
}

export interface Pass {
    type: "Pass",
    seat: Seat
}

export type Move = Play | Pass

export class Single {
    card: Card
    constructor(cards: Card[]) {
        if (cards.length === 1) {
            this.card = cards[0]
        } else {
            throw new GameLogicError("Invalid Single formation.")
        }
    }
}

export class Pair {
    cards: Card[]
    pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 2 && haveSameRanks(cards)) {
            this.cards = cards
            this.pivot = getPivotFromCards(cards)
        } else {
            throw new GameLogicError("Invalid Pair formation.")
        }
    }
}

export class Triple {
    cards: Card[]
    pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 3 && haveSameRanks(cards)) {
            this.cards = cards
            this.pivot = getPivotFromCards(cards)
        } else {
            throw new GameLogicError("Invalid Triple formation.")
        }
    }
}

export class Straight {
    cards: Card[]
    rank: number
    constructor(cards: Card[]) {
        const matchedRank = Option.getOrNull(getStraightRank(cards))
        if (cards.length === 5 && matchedRank && !haveSameSuits(cards)) {
            this.cards = cards
            this.rank = matchedRank
        } else {
            throw new GameLogicError("Invalid Staright formation.")
        }
    }
}

export class Flush {
    cards: Card[]
    pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 5 && haveSameSuits(cards) && Option.isNone(getStraightRank(cards))) {
            this.cards = cards
            this.pivot = getPivotFromCards(cards)
        } else {
            throw new GameLogicError("Invalid Flush formation.")
        }
    }
}

export class FullHouse {
    cards: Card[]
    rank: number
    constructor(cards: Card[]) {
        const rankAppeared3Times = Option.getOrNull(getRankByAppearedTimes(3)(cards))
        if (cards.length === 5 && getNumberOfDiffRanksInCards(cards) === 2 && rankAppeared3Times) {
            this.cards = cards
            this.rank = rankAppeared3Times
        } else {
            throw new GameLogicError("Invalid Full House formation.")
        }
    }
}

export class FourOfAKind {
    cards: Card[]
    rank: number
    constructor(cards: Card[]) {
        const rankAppeared4Times = Option.getOrNull(getRankByAppearedTimes(4)(cards))
        if (cards.length === 5 && getNumberOfDiffRanksInCards(cards) === 2 && rankAppeared4Times) {
            this.cards = cards
            this.rank = rankAppeared4Times
        } else {
            throw new GameLogicError("Invalid Four of a Kind formation.")
        }
    }
}

export class StraightFlush {
    cards: Card[]
    rank: number
    constructor(cards: Card[]) {
        const matchedRank = Option.getOrNull(getStraightRank(cards))
        if (cards.length === 5 && matchedRank && haveSameSuits(cards)) {
            this.cards = cards
            this.rank = matchedRank
        } else {
            throw new GameLogicError("Invalid Straight Flush formation.")
        }
    }
}