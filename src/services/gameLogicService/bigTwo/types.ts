import { Suit, Rank, Seat, ValidMove } from "./constants"

interface Card {
    suit: Suit,
    rank: Rank
}

interface Player {
    seat: Seat,
    score: Number,
    hands: Card[]
}

interface GameState {
    players: Player[],
    currentSeat: Seat,
    leadingPlay: Card[]
}

interface Move {
    player: Player,
    type: ValidMove,
    cards: Card[] | null
}