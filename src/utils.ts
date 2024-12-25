import { Effect, pipe } from "effect";
import { Context } from "koa";
import { AuthenticationError, InternalError } from "./utils/errors";

export const emitHttpResponseByEffect = async (ctx: Context, effect: Effect.Effect<any, AuthenticationError | InternalError>) => {
    (await pipe(
        effect,
        Effect.map(data => () => {
            ctx.status = 200
            ctx.body = { ...data }
        }),
        Effect.mapError(e => () => {
            switch (e._tag) {
                case "AuthenticationError":
                    ctx.status = 400
                    break
                case "InternalError":
                    ctx.status = 500
                    break
            }
            ctx.body = { error: `${e._tag}: ${e.message}` }
        }),
        Effect.merge,
        Effect.runPromise
    ))()
}