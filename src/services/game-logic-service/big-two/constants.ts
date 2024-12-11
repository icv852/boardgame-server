import { Option } from "effect"

export enum Suit {
    Diamond = 0,
    Club,
    Heart,
    Spade
}

export namespace Suit {
    export const getNext = (suit: Suit): Option.Option<Suit> => suit === Suit.Spade ? Option.none() : Option.some(suit + 1)
    export const getPrevious = (suit: Suit): Option.Option<Suit> => suit === Suit.Diamond ? Option.none() : Option.some(suit - 1)
    export const getAll = (): Suit[] => Object.values(Suit).filter(e => typeof e === "number")
}

export enum Rank {
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

export namespace Rank {
    export const getNext = (rank: Rank): Option.Option<Rank> => rank === Rank.Two ? Option.none() : Option.some(rank + 1)
    export const getPrevious = (rank: Rank): Option.Option<Rank> => rank === Rank.Three ? Option.none() : Option.some(rank - 1)
    export const getAll = (): Rank[] => Object.values(Rank).filter(e => typeof e === "number")
}

export enum Seat {
    North = 0,
    West,
    South,
    East
}

export namespace Seat {
    export const getNext = (seat: Seat): Seat => seat === Seat.East ? Seat.North : seat + 1
    export const getPrevious = (seat: Seat): Seat => seat === Seat.North ? Seat.East : seat - 1
}