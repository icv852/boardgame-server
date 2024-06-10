import { Suit, Rank, Seat } from "./constants"
import { Option } from "effect"

export interface Card {
    suit: Suit,
    rank: Rank
}

export interface Player {
    seat: Seat,
    score: number,
    hands: Card[]
}

export interface GameState {
    players: Player[],
    currentSeat: Seat,
    leadingPlay: Option.Option<Play>
}

export interface Play {
    type: "Play",
    seat: Seat,
    cards: Card[]
}

export interface Pass {
    type: "Pass",
    seat: Seat
}

export type Move = Play | Pass