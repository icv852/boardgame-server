// import { Suit, Rank, Seat } from "./constants"
import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
import { SuitValue, RankValue, SeatPostion } from "./constants"

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

class Single {
    readonly card: Card
    constructor(card: Card) {
        this.card = card
    }

    public canBeat(single: Single): boolean {
        return this.card.canBeat(single.card)
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
            if (Straight.isAceToFive(sortedRanks)) {
                this.pivot = sortedCards[4]
                this.isA2Straight = true
            } else if (Straight.isTwoToSix || Straight.isRegularStraight) {
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

    private static isAceToFive(ranks: Rank[]): boolean {
        const aceToFive = [RankValue.Three, RankValue.Four, RankValue.Five, RankValue.Ace, RankValue.Two]
        return ranks.every((rank, idx) => rank.value === aceToFive[idx])
    }

    private static isTwoToSix(ranks: Rank[]): boolean {
        const twoToSix = [RankValue.Three, RankValue.Four, RankValue.Five, RankValue.Ace, RankValue.Two]
        return ranks.every((rank, idx) => rank.value === twoToSix[idx])
    }

    private static isRegularStraight(ranks: Rank[]): boolean {
        return ranks.every((rank, idx) => idx === 4 || Option.getOrNull(rank.next)?.value === ranks[idx + 1].value)
    }
}

class Flush {
    readonly pivot: Card

    constructor(cards: Card[]) {
        if (cards.length === 5 && Card.haveSameSuit(cards) && !Straight.haveStraightPattern(cards.map(card => card.rank))) {
            this.pivot = Card.getBiggest(cards)
        } else {
            throw new GameLogicError("Invalid Flush formation.")
        }
    }

    public canBeat(flush: Flush): boolean {
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
            if (Card.haveSameRank(first3Cards)) {
                this.pivot = first3Cards.slice(-1)[0]
            } else if (Card.haveSameRank(last3Cards)) {
                this.pivot = last3Cards.slice(-1)[0]
            } else {
                throw new GameLogicError("Invalid Full House formation.")
            }
        } else {
            throw new GameLogicError("Invalid Full House formation.")
        }
    }

    public canBeat(fullHouse: FullHouse): boolean {
        return this.pivot.canBeat(fullHouse.pivot)
    }
}

class FourOfAKind {
    readonly pivot: Card

    constructor(cards: Card[]) {
        if (cards.length === 5) {
            const sortedCards = Card.sort(cards)
            const first4Cards = sortedCards.slice(0, 4)
            const last4Cards = sortedCards.slice(-4)
            if (Card.haveSameRank(first4Cards)) {
                this.pivot = first4Cards.slice(-1)[0]
            } else if (Card.haveSameRank(last4Cards)) {
                this.pivot = last4Cards.slice(-1)[0]
            } else {
                throw new GameLogicError("Invalid Four of a Kind formation.")
            }
        } else {
            throw new GameLogicError("Invalid Four of a Kind formation.")
        }
    }

    public canBeat(fourOfAKind: FullHouse): boolean {
        return this.pivot.canBeat(fourOfAKind.pivot)
    }
}

class StraightFlush {
    readonly pivot: Card
    readonly isA2Straight: boolean

    constructor(cards: Card[]) {
        const cardRanks = cards.map(card => card.rank)
        if (cards.length === 5 && Card.haveSameSuit(cards) && Straight.haveStraightPattern(cardRanks)) {
            this.pivot = Card.getBiggest(cards)
            if (cardRanks.includes(new Rank(RankValue.Ace)) && cardRanks.includes(new Rank(RankValue.Two))) {
                this.isA2Straight = true
            } else {
                this.isA2Straight = false
            }
        } else {
            throw new GameLogicError("Invalid Straight Flush formation.")
        }
    }

    public canBeat(straightFlush: StraightFlush): boolean {
        if (this.isA2Straight !== straightFlush.isA2Straight) {
            return this.isA2Straight
        } else {
            return this.pivot.canBeat(straightFlush.pivot)
        }
    }
}

class Seat {
    readonly position: SeatPostion

    constructor(position: SeatPostion) {
        this.position = position
    }

    get next(): Seat {
        return this.position === 3 ? new Seat(0) : new Seat(this.position + 1)
    }
}

// class Player {
//     readonly seat: Seat
//     score: number
//     hands: Card[]
// }

// class GameState {
//     players: Player[]
//     currentSeat: Seat

// }

// class FiveCardPlay {
//     readonly value: Straight | Flush | FullHouse | FourOfAKind | StraightFlush

//     constructor(cards: Card[]) {
//         const constructors = [Straight, Flush, FullHouse, FourOfAKind, StraightFlush]
//         for (const constructor of constructors) {
//             try {
//                 this.value = new constructor(cards)
//                 break
//             } catch (err) {
//                 continue
//             }
//         }
//         throw new GameLogicError("Invalid Five Card Play formation.")
//     }

//     public canBeat(fiveCardPlay: FiveCardPlay) {
        
//     }
// }

class Play {
    readonly value: Single | Pair | Triple | Straight | Flush | FullHouse | FourOfAKind | StraightFlush

    constructor(cards: Card[]) {
        try {
            if (cards.length === 1) {
                this.value = new Single(cards[0])
            } else if (cards.length === 2) {
                this.value = new Pair(cards)
            } else if (cards.length === 3) {
                this.value = new Triple(cards)
            } else if (cards.length === 5) {
                const constructors = [Straight, Flush, FullHouse, FourOfAKind, StraightFlush]
                for (const constructor of constructors) {
                    try {
                        this.value = new constructor(cards)
                        break
                    } catch (err) {
                        continue
                    }
                }
                throw new GameLogicError("Invalid Five Card Play formation.")
            } else {
                throw new GameLogicError("Invalid number of cards.")
            }
        } catch (err) {
            throw new GameLogicError(`Invalid Play formation. Reason: ${err}`)
        }
    }

    private static getFiveCardPlayRank(fiveCardPlay: Straight | Flush | FullHouse | FourOfAKind | StraightFlush): number {
        if (fiveCardPlay instanceof Straight) return 0
        if (fiveCardPlay instanceof Flush) return 1
        if (fiveCardPlay instanceof FullHouse) return 2
        if (fiveCardPlay instanceof FourOfAKind) return 3
        if (fiveCardPlay instanceof StraightFlush) return 4
    }

    private get isFiveCardPlay(): boolean {
        return this.value instanceof Straight || this.value instanceof Flush || this.value instanceof FullHouse || this.value instanceof FourOfAKind || this.value instanceof StraightFlush
    }

    public canBeat(play: Play): boolean {
        if (this.value instanceof Single) {
            return play.value instanceof Single && this.value.canBeat(play.value)
        } else if (this.value instanceof Pair) {
            return play.value instanceof Pair && this.value.canBeat(play.value)
        } else if (this.value instanceof Triple) {
            return play.value instanceof Triple && this.value.canBeat(play.value)
        } else if (this.isFiveCardPlay) {
            
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
