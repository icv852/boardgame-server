// import { Suit, Rank, Seat } from "./constants"
import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
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

    public canBeat(card: Card): boolean {
        return this.rank.value > card.rank.value || (this.rank.value === card.rank.value && this.suit.value > card.suit.value)
    }

    public existsIn(cards: Card[]): boolean {
        return cards.filter(card => this.rank.value === card.rank.value && this.suit.value === card.suit.value).length > 0
    }

    static haveSameRank(cards: Card[]): boolean {
        return cards.every(card => card.rank.value === cards[0].rank.value)
    }

    static haveSameSuit(cards: Card[]): boolean {
        return cards.every(card => card.suit.value === cards[0].suit.value)
    }

    static getBiggest(cards: Card[]): Card {
        return cards.reduce((prev, curr) => curr.canBeat(prev) ? curr : prev, new Card(new Suit(SuitValue.Diamond), new Rank(RankValue.Three)))
    }

    static sort(cards: Card[]): Card[] {
        return cards.sort((a, b) => a.canBeat(b) ? 1 : -1)
    }
}

class Pair {
    readonly pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 2 && Card.haveSameRank(cards)) {
            this.pivot = Card.getBiggest(cards)
        } else {
            throw new GameLogicError("Invalid Pair formation.")
        }
    }

    public canBeat(pair: Pair): boolean {
        return this.pivot.canBeat(pair.pivot)
    }
}

class Triple {
    readonly pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 3 && Card.haveSameRank(cards)) {
            this.pivot = Card.getBiggest(cards)
        } else {
            throw new GameLogicError("Invalid Triple formation.")
        }
    }

    public canBeat(triple: Triple): boolean {
        return this.pivot.canBeat(triple.pivot)
    }
}

class Straight {
    readonly pivot: Card
    readonly isA2Straight: boolean
    constructor(cards: Card[]) {
        if (cards.length === 5 && !Card.haveSameSuit(cards)) {
            const sortedCards = Card.sort(cards)
            const sortedRanks = sortedCards.map(card => card.rank)
            if (this.isAceToFive(sortedRanks)) {
                this.pivot = sortedCards[4]
                this.isA2Straight = true
            } else if (this.isTwoToSix || this.isRegularStraight) {
                this.pivot = sortedCards[4]
                this.isA2Straight = false
            } else {
                throw new GameLogicError("Invalid Straight formation.")
            }
        } else {
            throw new GameLogicError("Invalid Straight formation.")
        }
    }

    public canBeat(straight: Straight): boolean {
        if (this.isA2Straight !== straight.isA2Straight) {
            return this.isA2Straight
        } else {
            return this.pivot.canBeat(straight.pivot)
        }
    }

    static haveStraightPattern(ranks: Rank[]): boolean {
        return this.isAceToFive(ranks) || this.isTwoToSix(ranks) || this.isRegularStraight(ranks)
    }

    private isAceToFive(ranks: Rank[]): boolean {
        const aceToFive = [RankValue.Three, RankValue.Four, RankValue.Five, RankValue.Ace, RankValue.Two]
        return ranks.every((rank, idx) => rank.value === aceToFive[idx])
    }

    private isTwoToSix(ranks: Rank[]): boolean {
        const twoToSix = [RankValue.Three, RankValue.Four, RankValue.Five, RankValue.Ace, RankValue.Two]
        return ranks.every((rank, idx) => rank.value === twoToSix[idx])
    }

    private isRegularStraight(ranks: Rank[]): boolean {
        return ranks.every((rank, idx) => idx === 4 || rank.next.value === ranks[idx + 1].value)
    }
}

class Flush {
    readonly pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 5 && Suit.haveSameSuit(cards) && !Straight.haveStraightPattern(cards)) {
            this.pivot = Card.getBiggest(cards)
        } else {
            throw new GameLogicError("Invalid Flush formation.")
        }
    }
    public canBeat(flush: Flush) {
        return this.pivot.canBeat(flush.pivot)
    }
}

class FullHouse {
    readonly pivot: Card
    constructor(cards: Card[]) {
        if (cards.length === 5) {
            const sortedCards = Card.sort(cards)
            const first3Cards = sortedCards.slice(0, 3)
            const last3Cards = sortedCards.slice(-3)
            if (Rank.haveSameRank(cards)) {
                    
            }
        } else {
            throw new GameLogicError("Invalid Full House formation.")
        }
    }
}



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
