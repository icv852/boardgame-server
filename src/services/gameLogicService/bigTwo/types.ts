import { CardRank, CardSuit } from "./constants"

export type Card = {
    rank: CardRank,
    suit: CardSuit
}

export type Single = [Card]

export type Pair = [Card, Card]

export type Triple = [Card, Card, Card]

export type FiveCardHand = [Card, Card, Card, Card, Card]

export type Hand = Single | Pair | Triple | FiveCardHand