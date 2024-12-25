import passport from "koa-passport"
import { User } from "@prisma/client"
import localStrategy from "passport-local"
import { Effect } from "effect"
import AuthService from "../services/auth-service/AuthService"
import { Context, Next } from "koa"

const LocalStrategy = localStrategy.Strategy

const passportMiddleware = (authService: AuthService) => {
    passport.serializeUser((user: User, done) => done(null, user.id)) 

    passport.deserializeUser((id: string, done) => {
        const user = authService.getUser({ id })
        user.pipe(Effect.match({
            onFailure: (e) => done(e),
            onSuccess: (user) => done(null, user),
        }))
    })

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = authService.getUser({ username })
        user.pipe(Effect.match({
            onFailure: (e) => {
                switch (e._tag) {
                    case "InternalError": return done(e)
                    case "AuthenticationError": return done(null, false)
                }
            },
            onSuccess: async (user) => {
                const isPasswordMatch = await Effect.runPromise(AuthService.checkPassword(user.passwordHash)(password))
                if (username === user.username && isPasswordMatch) {
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            }
        }))
    }))

    return async (ctx: Context, next: Next) => {
        await passport.initialize()(ctx, async () => {
            await passport.session()(ctx, next)
        })
    }
}

export default passportMiddleware