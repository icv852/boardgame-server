import { Rank, Suit } from "./constants";
import { GameState, Card } from "./types";

const Spade2 = new Card(Suit.Spade, Rank.Two)
const Heart2 = new Card(Suit.Heart, Rank.Two)
const Club2 = new Card(Suit.Club, Rank.Two)
const Diamond2 = new Card(Suit.Diamond, Rank.Two)

const getDeductedMarksByRemainingHands = (hands: Card[]): number => {
    const numberOfRemainingHands = hands.length
    const isMoreThanNineCards = numberOfRemainingHands > 9
    const hasRemainingTwo = [Spade2, Heart2, Club2, Diamond2].reduce((prev, curr) => curr.existsIn(hands) ? true : prev, false)
    const multiplier = (isMoreThanNineCards ? 2 : 1) * (hasRemainingTwo ? 2 : 1)
    return -numberOfRemainingHands * multiplier
}

export const updateScores = (gameState: GameState): GameState => {
    const scoreGainedByWinner = gameState.players.map(player => player.hands).reduce((prev, curr) => getDeductedMarksByRemainingHands(curr) + prev, 0)

    const updatedPlayers = gameState.players.map(player => ({
        ...player,
        score: player.score + (getDeductedMarksByRemainingHands(player.hands) ?? scoreGainedByWinner)
    }))

    return {
        ...gameState,
        players: updatedPlayers
    }
}

/**
check ding dai:
if (nextSeat.card === 1) {
    if (leadingPlay > 1) {
        false
    } else if (leadingPlay === null) {
        if (play > 1) {
            false
        } else {
            CHECK: play is biggest in hands
        }
    } else if (leadingPlay === 1) {
        CHECK: if play, is play biggest in hands; if pass, is biggest in hands cannot beat leadingPlay
    }
} else {
    false
}

*/
