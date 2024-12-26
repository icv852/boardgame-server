import Koa from "koa"
import bodyParser from "koa-bodyparser"
import sessionMiddleware from "./middlewares/session"
import passportMiddleware from "./middlewares/passport"
import routerMiddleware from "./middlewares/router"
import AuthService from "./services/auth-service/AuthService"

export default function createKoaApp(authService: AuthService) {
    const app = new Koa()
    app.use(bodyParser())
    app.use(sessionMiddleware(app))
    app.use(passportMiddleware(authService))
    app.use(routerMiddleware(authService))

    return app
}