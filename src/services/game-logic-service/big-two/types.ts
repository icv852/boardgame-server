import { Option } from "effect"
import { GameLogicError } from "../../../utils/errors"
import { Suit, Rank, Seat } from "./constants"

export class Card {
    readonly suit: Suit
    readonly rank: Rank

    constructor(suit: Suit, rank: Rank) {
        this.suit = suit
        this.rank = rank
    }
    
    get next(): Option.Option<Card> {
        if (Option.isSome(Rank.getNext(this.rank))) {
            return Option.some(new Card(this.suit, Option.getOrThrow(Rank.getNext(this.rank))))
        } else if (Option.isSome(Suit.getNext(this.suit))) {
            return Option.some(new Card(Option.getOrThrow(Suit.getNext(this.suit)), Rank.Three))
        } else {
            return Option.none()
        }
    }

    public canBeat(card: Card): boolean {
        return this.rank > card.rank || (this.rank === card.rank && this.suit > card.suit)
    }

    public existsIn(cards: Card[]): boolean {
        return cards.filter(card => this.rank === card.rank && this.suit === card.suit).length > 0
    }

    static haveSameRank(cards: Card[]): boolean {
        return cards.every(card => card.rank === cards[0].rank)
    }

    static haveSameSuit(cards: Card[]): boolean {
        return cards.every(card => card.suit === cards[0].suit)
    }

    static getBiggest(cards: Card[]): Option.Option<Card> {
        return cards.length > 0 ? Option.some(cards.reduce((prev, curr) => curr.canBeat(prev) ? curr : prev, new Card(Suit.Diamond, Rank.Three))) : Option.none()
    }

    static sort(cards: Card[]): Card[] {
        return cards.sort((a, b) => a.canBeat(b) ? 1 : -1)
    }

    static isSame(cards: Card[]): boolean {
        return this.haveSameSuit(cards) && this.haveSameRank(cards)
    }
}

export class Hands {
    value: Card[]
    static NUM_FULL_SIZE = 13

    constructor(cards: Card[]) {
        this.value = cards
    }

    public isEmpty(): boolean {
        return this.value.length === 0
    }

    public isLastCard(): boolean {
        return this.value.length === 1
    }

    public isFull(): boolean {
        return this.value.length === Hands.NUM_FULL_SIZE
    }

    public getBiggest(): Option.Option<Card> {
        return Card.getBiggest(this.value)
    }

    public remove(play: Play): Hands {
        return new Hands(this.value.filter(hand => !play.cards.includes(hand)))
    }
}

export class Deck {
    private value: Card[]
    constructor() {
        const suits = Suit.getAll()
        const ranks = Rank.getAll()
        this.value = suits.flatMap(suit => ranks.map(rank => new Card(suit, rank)))
    }

    private shuffle(): void {
        const shuffled = [...this.value]

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        this.value = shuffled
    }

    private chunk(cards: Card[]): Card[][] {
        if (cards.length === 0) return []
        return [cards.slice(0, Hands.NUM_FULL_SIZE)].concat(this.chunk(cards.slice(Hands.NUM_FULL_SIZE)))
    }

    public deliverHands(): Hands[] {
        this.shuffle()
        return this.chunk(this.value).map(cards => new Hands(cards))
    }
}

export class Single {
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
            this.pivot = Option.getOrThrow(Card.getBiggest(cards))
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
            this.pivot = Option.getOrThrow(Card.getBiggest(cards))
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
            } else if (Straight.isTwoToSix(sortedRanks) || Straight.isRegularStraight(sortedRanks)) {
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
        const aceToFive = [Rank.Three, Rank.Four, Rank.Five, Rank.Ace, Rank.Two]
        return ranks.every((rank, idx) => rank === aceToFive[idx])
    }

    private static isTwoToSix(ranks: Rank[]): boolean {
        const twoToSix = [Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Two]
        return ranks.every((rank, idx) => rank === twoToSix[idx])
    }

    private static isRegularStraight(ranks: Rank[]): boolean {
        return ranks.every((rank, idx) => idx === 4 || Option.getOrNull(Rank.getNext(rank)) === ranks[idx + 1])
    }
}

class Flush {
    readonly pivot: Card

    constructor(cards: Card[]) {
        if (cards.length === 5 && Card.haveSameSuit(cards) && !Straight.haveStraightPattern(cards.map(card => card.rank))) {
            this.pivot = Option.getOrThrow(Card.getBiggest(cards))
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

    public canBeat(fourOfAKind: FourOfAKind): boolean {
        return this.pivot.canBeat(fourOfAKind.pivot)
    }
}

class StraightFlush {
    readonly pivot: Card
    readonly isA2Straight: boolean

    constructor(cards: Card[]) {
        const cardRanks = cards.map(card => card.rank)
        if (cards.length === 5 && Card.haveSameSuit(cards) && Straight.haveStraightPattern(cardRanks)) {
            this.pivot = Option.getOrThrow(Card.getBiggest(cards))
            if (cardRanks.includes(Rank.Ace) && cardRanks.includes(Rank.Two)) {
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
    hands: Hands,
}

export interface GameState {
    players: Player[],
    current: Seat,
    lead: Option.Option<Play>,
    suspectedAssistance: boolean, // true when a player doesn't try his best to prevent next player with only one card in hand from winning
}