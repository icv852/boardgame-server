import { Rank, Seat, Suit } from "./constants";
import { GameState, Card, Hands } from "./types";

const CARD_SPADE_2 = new Card(Suit.Spade, Rank.Two)
const CARD_HEART_2 = new Card(Suit.Heart, Rank.Two)
const CARD_CLUB_2 = new Card(Suit.Club, Rank.Two)
const CARD_DIAMOND_2 = new Card(Suit.Diamond, Rank.Two)

const getPenaltyByRemainingHands = (hands: Hands): number => {
    const numberOfRemainingHands = hands.getHandsNum()
    const isMoreThanNineCards = numberOfRemainingHands > 9
    const hasRemainingTwo = [CARD_SPADE_2, CARD_HEART_2, CARD_CLUB_2, CARD_DIAMOND_2].some(card => hands.hasCard(card))
    const multiplier = (isMoreThanNineCards ? 2 : 1) * (hasRemainingTwo ? 2 : 1)
    return numberOfRemainingHands * multiplier
}

export const getGainedOrDeductedScore = (seat: Seat) => (gameState: GameState): number => {
    const isWinner = gameState.current === seat
    const suspectAssistant = gameState.suspectedAssistance ? Seat.getPrevious(gameState.current) : null

    const scoreGainedByWinner = gameState.players.map(player => player.hands).reduce((prev, curr) => getPenaltyByRemainingHands(curr) + prev, 0)

    if (isWinner) {
        return scoreGainedByWinner
    } else if (suspectAssistant) {
        return suspectAssistant === seat ? scoreGainedByWinner * -1 : 0
    } else {
        return getPenaltyByRemainingHands(gameState.players.find(p => p.seat).hands) * -1
    }
}