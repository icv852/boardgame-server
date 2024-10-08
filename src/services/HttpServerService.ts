import Koa from "koa"
import bodyParser from "koa-bodyparser"
import session from "koa-session"

const app = new Koa()    

app.use(async ctx => {
    ctx.body = "Hello World"
})

app.keys = ["boardgame-server-secret-key"]
app.use(session(app))
app.use(bodyParser())


// app.listen(3000)

export default app