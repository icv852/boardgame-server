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

export const Straights: { hand: Set<CardRank>, pivot: CardRank, rank: number }[] = [
    { hand: new Set([CardRank.Three, CardRank.Four, CardRank.Five, CardRank.Six, CardRank.Seven]), pivot: CardRank.Seven, rank: 1 },
    { hand: new Set([CardRank.Four, CardRank.Five, CardRank.Six, CardRank.Seven, CardRank.Eight]), pivot: CardRank.Eight, rank: 2 },
    { hand: new Set([CardRank.Five, CardRank.Six, CardRank.Seven, CardRank.Eight, CardRank.Nine]), pivot: CardRank.Nine, rank: 3 },
    { hand: new Set([CardRank.Six, CardRank.Seven, CardRank.Eight, CardRank.Nine, CardRank.Ten]), pivot: CardRank.Ten, rank: 4 },
    { hand: new Set([CardRank.Seven, CardRank.Eight, CardRank.Nine, CardRank.Ten, CardRank.Jack]), pivot: CardRank.Jack, rank: 5 },
    { hand: new Set([CardRank.Eight, CardRank.Nine, CardRank.Ten, CardRank.Jack, CardRank.Queen]), pivot: CardRank.Queen, rank: 6 },
    { hand: new Set([CardRank.Nine, CardRank.Ten, CardRank.Jack, CardRank.Queen, CardRank.King]), pivot: CardRank.King, rank: 7 },
    { hand: new Set([CardRank.Ten, CardRank.Jack, CardRank.Queen, CardRank.King, CardRank.Ace]), pivot: CardRank.Ace, rank: 8 },
    { hand: new Set([CardRank.Two, CardRank.Three, CardRank.Four, CardRank.Five, CardRank.Six]), pivot: CardRank.Two, rank: 9 },
    { hand: new Set([CardRank.Ace, CardRank.Two, CardRank.Three, CardRank.Four, CardRank.Five]), pivot: CardRank.Two, rank: 10 }
]