import { RankValue, SuitValue } from "./constants";
import { GameState, Card, Suit, Rank } from "./types";

const Spade2 = new Card(new Suit(SuitValue.Spade), new Rank(RankValue.Two))
const Heart2 = new Card(new Suit(SuitValue.Heart), new Rank(RankValue.Two))
const Club2 = new Card(new Suit(SuitValue.Club), new Rank(RankValue.Two))
const Diamond2 = new Card(new Suit(SuitValue.Diamond), new Rank(RankValue.Two))

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