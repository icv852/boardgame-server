import Koa from "koa"
import bodyParser from "koa-bodyparser"
import sessionMiddleware from "./middlewares/session"
import passportMiddleware from "./middlewares/passport"
import DatabaseService from "./services/database-service/DatabaseService"

export default function createKoaApp(db: DatabaseService) {
    const app = new Koa()
    app.use(bodyParser())
    app.use(sessionMiddleware(app))
    app.use(passportMiddleware(db))

    return app
}