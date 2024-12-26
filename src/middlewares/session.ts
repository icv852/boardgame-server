import Koa from "koa"
import session from "koa-session"

const sessionMiddleware = (app: Koa) => {
    app.keys = [process.env.SESSION_SECRET]
    return session(app)
}

export default sessionMiddleware