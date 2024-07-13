// import * as BigTwoLogics from "./logics"
// import { Card, Player, GameState, Play, Pass, Move } from "./types"
// import { Rank, Suit, Seat } from "./constants"
// import { Option } from "effect"

// const SpadeA: Card = { suit: Suit.Spade, rank: Rank.Ace }
// const Spade2: Card = { suit: Suit.Spade, rank: Rank.Two }
// const Spade3: Card = { suit: Suit.Spade, rank: Rank.Three }
// const Spade4: Card = { suit: Suit.Spade, rank: Rank.Four }
// const Spade5: Card = { suit: Suit.Spade, rank: Rank.Five }
// const Spade6: Card = { suit: Suit.Spade, rank: Rank.Six }
// const Spade7: Card = { suit: Suit.Spade, rank: Rank.Seven }
// const Spade8: Card = { suit: Suit.Spade, rank: Rank.Eight }
// const Heart2: Card = { suit: Suit.Heart, rank: Rank.Two }
// const Heart3: Card = { suit: Suit.Heart, rank: Rank.Three }
// const Club3: Card = { suit: Suit.Club, rank: Rank.Three }
// const Diamond3: Card = { suit: Suit.Diamond, rank: Rank.Three }

// const playerNorth: Player = { seat: Seat.North, score: 0, hands: [SpadeA] }
// const playerWest: Player = { seat: Seat.West, score: 0, hands: [Spade2] }
// const playerSouth: Player = { seat: Seat.South, score: 0, hands: [Spade3] }
// const playerEast: Player = { seat: Seat.East, score: 0, hands: [Club3] }
// const players: Player[] = [playerNorth, playerWest, playerSouth, playerEast]

// const playSpade1BySouth: Move = {
//     type: "Play",
//     seat: Seat.South,
//     cards: [Spade3]
// }

// const playSpadeAByNorth: Move = {
//     type: "Play",
//     seat: Seat.North,
//     cards: [SpadeA]
// }

// const playClub3ByEast: Move = {
//     type: "Play",
//     seat: Seat.East,
//     cards: [Club3]
// }

// const passByEast: Pass = {
//     type: "Pass",
//     seat: Seat.East
// }

// const gameState1: GameState = {
//     players: players,
//     currentSeat: Seat.North,
//     leadingPlay: Option.none()
// }

// const gameState2: GameState = {
//     players: players,
//     currentSeat: Seat.South,
//     leadingPlay: Option.some(playClub3ByEast)
// }

// describe("Big Two Logic Functions", () => {
//     describe("Extracting game info from GameState and Move", () => {
//         expect(BigTwoLogics.getCurrentSeat(gameState1)).toStrictEqual(Seat.North)
//         expect(BigTwoLogics.getLeadingPlay(gameState1)).toStrictEqual(Option.none())
//         expect(BigTwoLogics.getLeadingPlay(gameState2)).toStrictEqual(Option.some(playClub3ByEast))
//         expect(BigTwoLogics.getSeatOfLeadingPlay(gameState1)).toStrictEqual(Option.none())
//         expect(BigTwoLogics.getSeatOfLeadingPlay(gameState2)).toStrictEqual(Option.some(Seat.East))
//         expect(BigTwoLogics.getCardsOfLeadingPlay(gameState1)).toStrictEqual(Option.none())
//         expect(BigTwoLogics.getCardsOfLeadingPlay(gameState2)).toStrictEqual(Option.some([Club3]))
//         expect(BigTwoLogics.getSeatOfMove(playSpade1BySouth)).toStrictEqual(Seat.South)
//         expect(BigTwoLogics.getTypeOfMove(playSpade1BySouth)).toStrictEqual("Play")
//         expect(BigTwoLogics.getCardsOfPlay(playSpade1BySouth)).toStrictEqual([Spade3])
//     })

//     describe("Determining facts in game", () => {
//         expect(BigTwoLogics.isCurrentSeat(gameState1)(playSpade1BySouth)).toStrictEqual(false)
//         expect(BigTwoLogics.isCurrentSeat(gameState1)(playSpadeAByNorth)).toStrictEqual(true)
//         expect(BigTwoLogics.isPass(playSpade1BySouth)).toStrictEqual(false)
//         expect(BigTwoLogics.isPass(passByEast)).toStrictEqual(true)
//         expect(BigTwoLogics.isPlay(playSpade1BySouth)).toStrictEqual(true)
//         expect(BigTwoLogics.isPlay(passByEast)).toStrictEqual(false)
//     })

//     describe("Check if a pass is valid", () => {
//         it("should return false if leading play not exists", () => expect(BigTwoLogics.isPassValid(gameState1)(passByEast)).toStrictEqual(false))
//         it("should return false if the leading player passes", () => expect(BigTwoLogics.isPassValid({ players: players, currentSeat: Seat.East, leadingPlay: Option.some(playClub3ByEast) })(passByEast)).toStrictEqual(false))
//         it("should return true if it's a valid pass", () => expect(BigTwoLogics.isPassValid(gameState2)({ type: "Pass", seat: Seat.South })).toStrictEqual(true))
//     })

//     describe("Card combinations", () => {
//         describe("Single/Pair/Triple", () => {
//             expect(BigTwoLogics.isSingle([Spade3])).toStrictEqual(true)
//             expect(BigTwoLogics.isSingle([Spade3, Heart3])).toStrictEqual(false)
//             expect(BigTwoLogics.isPair([Spade3, Heart3])).toStrictEqual(true)
//             expect(BigTwoLogics.isPair([Spade3, Spade4])).toStrictEqual(false)
//             expect(BigTwoLogics.isPair([Spade3])).toStrictEqual(false)
//             expect(BigTwoLogics.isTriple([Spade3, Heart3, Club3])).toStrictEqual(true)
//             expect(BigTwoLogics.isTriple([Spade4, Heart3, Club3])).toStrictEqual(false)
//             expect(BigTwoLogics.isTriple([Heart3, Club3])).toStrictEqual(false)
//         })
//         describe("Straight", () => {
//             expect(BigTwoLogics.isStraight([Heart3, Spade4, Spade5, Spade6, Spade7])).toStrictEqual(true)
//             expect(BigTwoLogics.isStraight([Spade2, Heart3, Spade4, Spade5, Spade6])).toStrictEqual(true)
//             expect(BigTwoLogics.isStraight([SpadeA, Spade2, Heart3, Spade4, Spade5])).toStrictEqual(true)
//             expect(BigTwoLogics.isStraight([Spade3, Spade4, Spade5, Spade6, Spade8])).toStrictEqual(false)
//         })
//     })
// })