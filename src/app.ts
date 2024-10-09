import Koa from "koa"
import bodyParser from "koa-bodyparser"
import sessionMiddleware from "./middlewares/session"

export default function createKoaApp() {
    const app = new Koa()
    app.use(bodyParser())
    app.use(sessionMiddleware(app))

    return app
}