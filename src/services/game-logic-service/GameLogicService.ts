import * as BigTwoLogic from "./big-two/index"

const GameLogicService = {
    BigTwo: {
        initiateGameState: BigTwoLogic.initiateGameState,
        startNewGame: BigTwoLogic.startNewGame,
        makeMove: BigTwoLogic.makeMove,
    }
}

export default GameLogicService