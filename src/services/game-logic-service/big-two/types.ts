import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
import { SuitValue, RankValue, SeatValue } from "./constants"

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
        const twoToSix = [RankValue.Three, RankValue.Four, RankValue.Five, RankValue.Six, RankValue.Two]
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

class FiveCardPlay {
    readonly value: Straight | Flush | FullHouse | FourOfAKind | StraightFlush

    constructor(cards: Card[]) {
        const constructors = [Straight, Flush, FullHouse, FourOfAKind, StraightFlush]
        let isValidCombination = false
        for (const constructor of constructors) {
            try {
                this.value = new constructor(cards)
                isValidCombination = true
                break
            } catch (err) {
                continue
            }
        }
        if (!isValidCombination) {
            throw new GameLogicError("Invalid Five Card Play formation.")
        }
    }

    private get rank(): number {
        if (this.value instanceof Straight) return 0
        if (this.value instanceof Flush) return 1
        if (this.value instanceof FullHouse) return 2
        if (this.value instanceof FourOfAKind) return 3
        if (this.value instanceof StraightFlush) return 4
    }

    public canBeat(fiveCardPlay: FiveCardPlay) {
        if (this.rank > fiveCardPlay.rank) {
            return true
        } else if (this.rank === fiveCardPlay.rank) {
            if (this.value instanceof Straight) return this.value.canBeat(fiveCardPlay.value as Straight)
            if (this.value instanceof Flush) return this.value.canBeat(fiveCardPlay.value as Flush)
            if (this.value instanceof FullHouse) return this.value.canBeat(fiveCardPlay.value as FullHouse)
            if (this.value instanceof FourOfAKind) return this.value.canBeat(fiveCardPlay.value as FourOfAKind)
            if (this.value instanceof StraightFlush) return this.value.canBeat(fiveCardPlay.value as StraightFlush)
        } else {
            return false
        }
    }
}

export class Play {
    readonly value: Single | Pair | Triple | FiveCardPlay
    readonly cards: Card[]
    readonly seat: Seat

    constructor(cards: Card[], seat: Seat) {
        try {
            if (cards.length === 1) {
                this.value = new Single(cards[0])
            } else if (cards.length === 2) {
                this.value = new Pair(cards)
            } else if (cards.length === 3) {
                this.value = new Triple(cards)
            } else if (cards.length === 5) {
                this.value = new FiveCardPlay(cards)
            } else {
                throw new GameLogicError("Invalid number of cards.")
            }
            this.seat = seat
            this.cards = cards
        } catch (err) {
            throw new GameLogicError(`Invalid Play formation. Reason: ${err}`)
        }
    }

    public canBeat(play: Play): boolean {
        if (this.value instanceof Single) {
            return play.value instanceof Single && this.value.canBeat(play.value)
        } else if (this.value instanceof Pair) {
            return play.value instanceof Pair && this.value.canBeat(play.value)
        } else if (this.value instanceof Triple) {
            return play.value instanceof Triple && this.value.canBeat(play.value)
        } else if (this.value instanceof FiveCardPlay) {
            return play.value instanceof FiveCardPlay && this.value.canBeat(play.value)
        }
    }
}

export class Seat {
    readonly value: SeatValue

    constructor(value: SeatValue) {
        this.value = value
    }

    get next(): Seat {
        switch (this.value) {
            case SeatValue.North: return new Seat(SeatValue.West)
            case SeatValue.West: return new Seat(SeatValue.South)
            case SeatValue.South: return new Seat(SeatValue.East)
            case SeatValue.East: return new Seat(SeatValue.North)
        }
    }
}

export class Pass {
    readonly seat: Seat

    constructor(seat: Seat) {
        this.seat = seat
    }
}

export type Move = Pass | Play

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
