// import { Card, Play, Single, PlayType } from "../types"
// import { Rank, Suit } from "../constants"
// import { ValidStraights } from "../constants"
// import { areSetsEqual } from "../../../../utils/helpers"
// import { Option } from "effect"

// const CardDiamondThree: Card = { rank: Rank.Three, suit: Suit.Diamond }

// // card comparison
// export const haveSameRanks = (cards: Card[]): boolean => cards.every(card => card.rank === card[0].rank)

// export const haveSameSuits = (cards: Card[]): boolean => cards.every(card => card.suit === card[0].suit)

// const canCardABeatCardB = (a: Card) => (b: Card): boolean => a.rank > b.rank || (a.rank === b.rank && a.suit > b.suit)

// export const getPivotFromCards = (cards: Card[]): Card => cards.reduce((prev, curr) => canCardABeatCardB(prev)(curr) ? prev : curr, CardDiamondThree)

// export const getStraightRank = (cards: Card[]): Option.Option<number> => {
//     const matchedValidStraight = ValidStraights.filter(vs => areSetsEqual(vs.combination, new Set(cards.map(card => card.rank)))).pop()
//     return matchedValidStraight ? Option.some(matchedValidStraight.rank) : Option.none()
// }

// export const getNumberOfDiffRanksInCards = (cards: Card[]): number => new Set(cards.map(card => card.rank)).size

// export const getRankByAppearedTimes = (times: number) => (cards: Card[]): Option.Option<Rank> => {
//     const appearedRanks = Array.from(new Set(cards.map(card => card.rank)))
//     const found = appearedRanks.filter(appearedRank => cards.filter(card => card.rank === appearedRank).length === times).pop()
//     return found ? Option.some(found) : Option.none()
// }

// export const canPlayABeatPlayB = (a: Play) => (b: Play): boolean => {
//     if (a.cards.length === b.cards.length) {
//         switch (a.type) {
//             case Single: return true 
//         }
//     } else {
//         return false
//     }
// }