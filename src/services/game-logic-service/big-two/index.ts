import { Effect, Option, pipe } from "effect";
import { Card, GameState, Move, Pass, Play, Player, Single } from "./types";
import { GameLogicError } from "../../../utils/errors";
import { Seat } from "./constants";

const validateLeadExists = (gameState: GameState): Effect.Effect<GameState, GameLogicError> => pipe(
    gameState.lead,
    Option.isSome,
    leadExists => leadExists ? Effect.succeed(gameState) : Effect.fail(new GameLogicError("Cannot pass when the lead doesn't exist."))
)

const mutateUpdate

const makePass = (pass: Pass) => (gameState: GameState): Effect.Effect<GameState, GameLogicError> => {
    const result = pipe(
        Effect.succeed(gameState),
        Effect.flatMap(validateLeadExists),

    )
}

/*
make a pass:

// validataion
if lead not exists, fail.

// mutation
update suspect assistance.
if pass to lead, lead resets.
update current seat + 1.

*/