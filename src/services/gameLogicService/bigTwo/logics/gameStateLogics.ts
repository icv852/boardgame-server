// import { GameState, Move, Play, Pass, Card, Player } from "../types"
// import { Seat, Rank, Suit, ValidStraights } from "../constants"
// import { GameLogicError } from "../../../../utils/errors"
// import { Effect, Option, pipe } from "effect"
// /**
// logics:

// if current seat:
//     if pass:
//         if valid pass: apply move
//         else: error
//     if play:
//         if valid play:
//             if leadingPlay exists:
//                 if can beat leadingPlay: apply move
//                 else: error
//             else: apply move
//         else: error
// else: error
// */

// const getNextSeat = (seat: Seat): Seat => {
//     switch (seat) {
//         case Seat.North: return Seat.West
//         case Seat.West: return Seat.South
//         case Seat.South: return Seat.East
//         case Seat.East: return Seat.North
//     }
// }

// const getSeatWithEmptyHands = (gameState: GameState): Option.Option<Seat> => {
//     const playersWithEmptyHands = gameState.players.filter(player => isHandsEmpty(player.hands)).pop()
//     return playersWithEmptyHands ? Option.some(playersWithEmptyHands.seat) : Option.none()
// }

// const isMoveByCurrentSeat = (gameState: GameState) => (move: Move): boolean => gameState.currentSeat === move.seat
// const isLeadingPlayExists = (gameState: GameState): boolean => Option.isSome(gameState.leadingPlay)
// const isPassingToLeadingPlayer = (pass: Pass) => (gameState: GameState): boolean => Option.match(gameState.leadingPlay, {
//     onNone: () => false,
//     onSome: (leadingPlay) => leadingPlay.seat === pass.seat
// })
// const isHandsEmpty = (hands: Card[]): boolean => hands.length < 1

// const removeHandsByPlay = (play: Play) => (gameState: GameState): GameState => {
//     const updatedPlayers = gameState.players.map(player => {
//         if (player.seat === play.seat) {
//             return {
//                 ...player,
//                 hands: player.hands.filter(card => !isCardExistsInCards(getCardsOfPlay(play))(card))
//             }
//         } else {
//             return player
//         }
//     })
//     return {
//         ...gameState,
//         players: updatedPlayers,
//     }
// }
// const updateLeadingPlay = (play: Play) => (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.some(play) })
// const clearLeadingPlay = (gameState: GameState): GameState => ({ ...gameState, leadingPlay: Option.none() })
// const assignCurrentSeatToNextPlayer = (gameState: GameState): GameState => ({ ...gameState, currentSeat: getNextSeat(getCurrentSeat(gameState)) })
// const updateWinner = (winnerSeat: Seat) => (gameState: GameState): GameState => ({ ...gameState, winner: Option.some(winnerSeat) })
// const updateScores = (gameState: GameState): GameState => gameState // TBD
// const settleIfWinnerExists = (gameState: GameState): GameState => { // TBD
//     return Option.match(getSeatWithEmptyHands(gameState), {
//         onNone: () => gameState,
//         onSome: (winnerSeat) => pipe(
//             gameState,
//             updateWinner(winnerSeat),
//             updateScores,
//         )
//     })
//     // getSeatWithEmptyHands(gameState).flatMap(pipe(updateWinner, updateScores))
// }
// const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, Error> => {
//     if (isLeadingPlayExists(gameState)) {
//         if (isPassingToLeadingPlayer(pass)(gameState)) {
//             return Effect.succeed(pipe(
//                 gameState,
//                 clearLeadingPlay,
//                 assignCurrentSeatToNextPlayer
//             ))
//         } else {
//             return Effect.succeed(assignCurrentSeatToNextPlayer(gameState))
//         }
//     } else {
//         return Effect.fail(new GameLogicError("Cannot pass when leading play not exists."))
//     }
// }
// const makePlay = (play: Play) => (gameState: GameState): Effect.Effect<GameState, Error> => {
//     if (isLeadingPlayExists(gameState)) {
//         // check if play can beat leading play
//     } else {
//         return Effect.succeed(pipe(
//             gameState,
//             removeHandsByPlay(play),
//             updateLeadingPlay(play),
//             settleIfWinnerExists
//         ))
//     }
// }

// export const applyMove = (gameState: GameState) => (move: Move): Effect.Effect<GameState, Error> => {
//     if (isMoveByCurrentSeat(gameState)(move)) {
//         if (move instanceof Pass) {
//             return makePass(move)(gameState)
//         } else if (move instanceof Play) {
//             return makePlay(move)(gameState)
//         } else {
//             return Effect.fail(new GameLogicError("Undefined Move type. Move should be either Play or Pass."))
//         }
//     } else {
//         return Effect.fail(new GameLogicError("The move is not requested by current seat."))
//     }
// }