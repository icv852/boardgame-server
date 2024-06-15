import { GameState, Move, Play, Pass, Card } from "./types"
import { Seat } from "./constants"
import { Option } from "effect"

/**
logics:

if current seat:
    if pass:
        if valid pass: apply move
        else: error
    if play:
        if valid play:
            if leadingPlay exists:
                if can beat leadingPlay: apply move
                else: error
            else: apply move
        else: error
else: error
*/


export const getCurrentSeat = (gameState: GameState): Seat => gameState.currentSeat
export const getLeadingPlay = (gameState: GameState): Option.Option<Play> => gameState.leadingPlay
export const getSeatOfLeadingPlay = (gameState: GameState): Option.Option<Seat> => Option.map(getLeadingPlay(gameState), lp => lp.seat)
export const getCardsOfLeadingPlay = (gameState: GameState): Option.Option<Card[]> => Option.map(getLeadingPlay(gameState), lp => lp.cards)
export const getSeatOfMove = (move: Move): Seat => move.seat
export const getTypeOfMove = (move: Move): string => move.type
export const getCardsOfPlay = (play: Play): Card[] => play.cards

export const isCurrentSeat = (gameState: GameState) => (move: Move) : boolean => getSeatOfMove(move) === getCurrentSeat(gameState)

export const isPass = (move: Move): boolean => getTypeOfMove(move) === "Pass"
export const isPlay = (move: Move): boolean => getTypeOfMove(move) === "Play"

export const isPassValid = (gameState: GameState) => (move: Pass) => {
    const leadingPlay = getLeadingPlay(gameState)
    return Option.isSome(leadingPlay) && (Option.getOrThrow(getSeatOfLeadingPlay(gameState)) !== getSeatOfMove(move))
}