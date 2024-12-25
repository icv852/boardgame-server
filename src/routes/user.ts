import Router from "@koa/router"
import * as UserController from "../controllers/user"

const router = new Router({
    prefix: "/user"
})

router.post("/", UserController.createUser)

export default router