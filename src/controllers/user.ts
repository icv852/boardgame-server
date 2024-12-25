import { Context } from "koa";
import AuthService from "../services/auth-service/AuthService";
import { CreateUserInput } from "../types/user";
import { emitHttpResponseByEffect } from "../utils";

export const createUser = async (ctx: Context) => {
    const authService = ctx.state.authService as AuthService
    await emitHttpResponseByEffect(ctx, authService.createUser(ctx.request.body as CreateUserInput))
}