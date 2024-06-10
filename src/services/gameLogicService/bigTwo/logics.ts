import { GameState, Move, Play, Pass, Card } from "./types"
import { Seat } from "./constants"
import { Option } from "effect"

/**
logics:

if current seat:
    if pass:
        if passable: apply move
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


const getCurrentSeat = (gameState: GameState): Seat => gameState.currentSeat
const getLeadingPlay = (gameState: GameState): Option.Option<Play> => gameState.leadingPlay
const getSeatOfMove = (move: Move): Seat => move.seat
const getTypeOfMove = (move: Move): string => move.type
const getCardsOfPlay = (play: Play): Card[] => play.cards

const isCurrentSeat = (moveSeat: Seat) => (currentSeat: Seat): boolean => moveSeat === currentSeat

const isPass = (move: Move): boolean => move.type === "Pass"