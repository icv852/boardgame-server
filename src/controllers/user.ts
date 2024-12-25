import { Context } from "koa";
import { CreateUserInput } from "../types/user";
import { emitHttpResponseByEffect } from "../utils";

export const createUser = async (ctx: Context) => await emitHttpResponseByEffect(ctx, ctx.state.authService.createUser(ctx.request.body as CreateUserInput))