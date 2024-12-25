import Router from "@koa/router"
import AuthService from "../services/auth-service/AuthService"
import userRoutes from "../routes/user"
import { Next } from "koa"

const RouterMiddleware = (authService: AuthService) => {
    const router = new Router()

    router.use(async (ctx, next) => {
        ctx.state.authService = authService
        await next()
    })

    router.use(userRoutes.routes()).use(userRoutes.allowedMethods())

    return async (ctx: Router.RouterContext, next: Next) => {
        await router.routes()(ctx, async () => {
            await router.allowedMethods()(ctx, next)
        })
    }
}

export default RouterMiddleware