// import { Suit, Rank, Seat } from "./constants"
import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
// import { getPivotFromCards, haveSameRanks, haveSameSuits, getStraightRank, getNumberOfDiffRanksInCards, getRankByAppearedTimes } from "./logics/cardLogics"

// export interface Card {
//     suit: Suit,
//     rank: Rank
// }

export enum SuitValue {
    Diamond = 0,
    Club,
    Heart,
    Spade
}

export enum RankValue {
    Three = 0,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace,
    Two
}

export class Suit {
    readonly value: SuitValue

    constructor(value: SuitValue) {
        this.value = value
    }
    get next(): Option.Option<Suit> {
        return this.value === SuitValue.Spade ? Option.none() : Option.some(new Suit(this.value + 1))
    }
}

export class Rank {
    readonly value: RankValue

    constructor(value: RankValue) {
        this.value = value
    }
    get next(): Option.Option<Rank> {
        return this.value === RankValue.Two ? Option.none() : Option.some(new Rank(this.value + 1))
    }
}

export class Card {
    readonly suit: Suit
    readonly rank: Rank

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit
        this.rank = rank
    }
    get next(): Option.Option<Card> {
        if (Option.isSome(this.rank.next)) {
            return Option.some(new Card(this.suit, Option.getOrThrow(this.rank.next)))
        } else if (Option.isSome(this.suit.next)) {
            return Option.some(new Card(Option.getOrThrow(this.suit.next), new Rank(RankValue.Three)))
        } else {
            return Option.none()
        }
    }
}

// class Pair {
//     constructor(cards: Card[]) {
//         if (cards.length === 2 && haveSameRanks(cards)) {
//             this.cards = cards
//             this.pivot = getPivotFromCards(cards)
//         } else {
//             throw new GameLogicError("Invalid Pair formation.")
//         }
//     }
// }

//     get next() {
//         if (this.suit === Suit.Spade) {
//             return new Card(, this.rank.next)
//         } else {
//             return new Card(this.suit.next, this.rank)
//         }
//     }
// }

// export interface Player {
//     seat: Seat,
//     score: number,
//     hands: Card[]
// }

// export interface GameState {
//     players: Player[],
//     currentSeat: Seat,
//     leadingPlay: Option.Option<Play>,
//     winner: Option.Option<Seat>
// }

// export class Single {
//     card: Card
//     constructor(cards: Card[]) {
//         if (cards.length === 1) {
//             this.card = cards[0]
//         } else {
//             throw new GameLogicError("Invalid Single formation.")
//         }
//     }
// }

// class Pair {
//     cards: Card[]
//     pivot: Card
//     constructor(cards: Card[]) {
//         if (cards.length === 2 && haveSameRanks(cards)) {
//             this.cards = cards
//             this.pivot = getPivotFromCards(cards)
//         } else {
//             throw new GameLogicError("Invalid Pair formation.")
//         }
//     }
// }

// class Triple {
//     cards: Card[]
//     pivot: Card
//     constructor(cards: Card[]) {
//         if (cards.length === 3 && haveSameRanks(cards)) {
//             this.cards = cards
//             this.pivot = getPivotFromCards(cards)
//         } else {
//             throw new GameLogicError("Invalid Triple formation.")
//         }
//     }
// }

// class Straight {
//     cards: Card[]
//     rank: number
//     constructor(cards: Card[]) {
//         const matchedRank = Option.getOrNull(getStraightRank(cards))
//         if (cards.length === 5 && matchedRank && !haveSameSuits(cards)) {
//             this.cards = cards
//             this.rank = matchedRank
//         } else {
//             throw new GameLogicError("Invalid Staright formation.")
//         }
//     }
// }

// class Flush {
//     cards: Card[]
//     pivot: Card
//     constructor(cards: Card[]) {
//         if (cards.length === 5 && haveSameSuits(cards) && Option.isNone(getStraightRank(cards))) {
//             this.cards = cards
//             this.pivot = getPivotFromCards(cards)
//         } else {
//             throw new GameLogicError("Invalid Flush formation.")
//         }
//     }
// }

// class FullHouse {
//     cards: Card[]
//     rank: number
//     constructor(cards: Card[]) {
//         const rankAppeared3Times = Option.getOrNull(getRankByAppearedTimes(3)(cards))
//         if (cards.length === 5 && getNumberOfDiffRanksInCards(cards) === 2 && rankAppeared3Times) {
//             this.cards = cards
//             this.rank = rankAppeared3Times
//         } else {
//             throw new GameLogicError("Invalid Full House formation.")
//         }
//     }
// }

// class FourOfAKind {
//     cards: Card[]
//     rank: number
//     constructor(cards: Card[]) {
//         const rankAppeared4Times = Option.getOrNull(getRankByAppearedTimes(4)(cards))
//         if (cards.length === 5 && getNumberOfDiffRanksInCards(cards) === 2 && rankAppeared4Times) {
//             this.cards = cards
//             this.rank = rankAppeared4Times
//         } else {
//             throw new GameLogicError("Invalid Four of a Kind formation.")
//         }
//     }
// }

// class StraightFlush {
//     cards: Card[]
//     rank: number
//     constructor(cards: Card[]) {
//         const matchedRank = Option.getOrNull(getStraightRank(cards))
//         if (cards.length === 5 && matchedRank && haveSameSuits(cards)) {
//             this.cards = cards
//             this.rank = matchedRank
//         } else {
//             throw new GameLogicError("Invalid Straight Flush formation.")
//         }
//     }
// }

// export type PlayType = Single | Pair | Triple | Straight | Flush | FullHouse | FourOfAKind | StraightFlush

// export class Play {
//     type: PlayType
//     seat: Seat
//     cards: Card[]
//     constructor(cards: Card[], seat: Seat) {
//         const playConstructors = [Single, Pair, Triple, Straight, Flush, FullHouse, FourOfAKind, StraightFlush]
//         let validPlayConstructed = false
//         for (const playConstructor of playConstructors) {
//             try {
//                 this.type = new playConstructor(cards)
//                 this.cards = cards
//                 this.seat = seat
//                 validPlayConstructed = true
//                 break
//             } catch (e) {
//                 if (!(e instanceof GameLogicError)) {
//                     throw e
//                 }
//             }
//         }
//         if (!validPlayConstructed) {
//             throw new GameLogicError("Invalid card combination to make a play.")
//         }
//     }
// }

// export class Pass {
//     seat: Seat
//     constructor(seat: Seat) {
//         this.seat = seat
//     }
// }

// export type Move = Play | Pass