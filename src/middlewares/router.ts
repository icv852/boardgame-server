import Router from "@koa/router"
import AuthService from "../services/auth-service/AuthService"
import bodyParser from "koa-bodyparser"

const RouterMiddleware = (authService: AuthService) => {
    const router = new Router()

    router.use(bodyParser())

    router.get("/", (ctx, next) => {
        ctx.response.body = "This is main page."
    })

    router.post("/users", (ctx, next) => {
        ctx.body = ctx.body
        ctx.status = 201
    })

    return async (ctx, next) => {
        await router.routes()(ctx, async () => {
            await router.allowedMethods()(ctx, next)
        })
    }
}

export default RouterMiddleware