import Router from "@koa/router"

const RouterMiddleware = () => {
    const router = new Router()

    router.get("/", (ctx, next) => {
        ctx.response.body = "This is main page."
    })

    router.get("/test", (ctx, next) => {
        ctx.response.body = "This is a test page."
    })

    return async (ctx, next) => {
        await router.routes()(ctx, async () => {
            await router.allowedMethods()(ctx, next)
        })
    }
}

export default RouterMiddleware