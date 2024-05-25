export enum Rank {
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

export enum Suit {
    Diamond = 1,
    Club,
    Heart,
    Spade
}

export enum Seat {
    East = 1,
    South,
    West,
    North
}

export enum FiveCardPlay {
    Straight = 1,
    Flush,
    FullHouse,
    FourOfAKind,
    StraightFlush
}

export enum ValidMove {
    Single,
    Pair,
    Triple,
    FiveCardPlay,
    Pass
}