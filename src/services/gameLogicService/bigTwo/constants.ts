export enum CardRank {
    Three = 1,
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

export enum CardSuit {
    Diamonds = 1,
    Clubs,
    Hearts,
    Spades
}

export enum Hand {
    Single = 1,
    Pair = 2,
    Triple = 3,
    FiveCardHand = 5
}

export enum FiveCardHand {
    Straight = 1,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush
}

export const Straight: { hand: Set<CardRank>, pivot: CardRank, rank: number }[] = [
    { hand: new Set([CardRank.Three, CardRank.Four, CardRank.Five, CardRank.Six, CardRank.Seven]), pivot: CardRank.Five, rank: 1 },
    { hand: new Set([CardRank.Four, CardRank.Five, CardRank.Six, CardRank.Eight]), pivot: CardRank.Six, rank: 2 },
    // TBD
]