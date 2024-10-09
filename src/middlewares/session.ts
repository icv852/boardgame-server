import Koa from "koa"
import session from "koa-session"

const sessionMiddleware = (app: Koa) => session(app)

export default sessionMiddleware