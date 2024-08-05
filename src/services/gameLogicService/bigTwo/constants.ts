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
    North = 1,
    West,
    South,
    East
}

// export enum FiveCardPlay {
//     Straight = 1,
//     Flush,
//     FullHouse,
//     FourOfAKind,
//     StraightFlush
// }

export const ValidStraights: { rank: number, combination: Set<Rank> }[] = [
    { rank: 1, combination: new Set([Rank.Three, Rank.Four, Rank.Five, Rank.Six, Rank.Seven]) },
    { rank: 2, combination: new Set([Rank.Four, Rank.Five, Rank.Six, Rank.Seven, Rank.Eight]) },
    { rank: 3, combination: new Set([Rank.Five, Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine]) },
    { rank: 4, combination: new Set([Rank.Six, Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten]) },
    { rank: 5, combination: new Set([Rank.Seven, Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack]) },
    { rank: 6, combination: new Set([Rank.Eight, Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen]) },
    { rank: 7, combination: new Set([Rank.Nine, Rank.Ten, Rank.Jack, Rank.Queen, Rank.King]) },
    { rank: 8, combination: new Set([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King, Rank.Ace]) },
    { rank: 9, combination: new Set([Rank.Two, Rank.Three, Rank.Four, Rank.Five, Rank.Six]) },
    { rank: 10, combination: new Set([Rank.Ace, Rank.Two, Rank.Three, Rank.Four, Rank.Five]) }
]