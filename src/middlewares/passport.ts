import passport from "koa-passport"
import { User } from "@prisma/client"
import localStrategy from "passport-local"
import { Effect } from "effect"
import AuthService from "../services/auth-service/AuthService"
import bcrypt from "bcrypt"

const LocalStrategy = localStrategy.Strategy

const passportMiddleware = (authService: AuthService) => {
    passport.serializeUser((user: User, done) => done(null, user.id)) 

    passport.deserializeUser(async (id: string, done) => {
        const user = await authService.getUser({ id })
        user.pipe(Effect.match({
            onFailure: (e) => done(e),
            onSuccess: (user) => done(null, user),
        }))
    })

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await authService.getUser({ username })
        user.pipe(Effect.match({
            onFailure: (e) => {
                switch (e._tag) {
                    case "InternalError": return done(e)
                    case "AuthenticationError": return done(null, false)
                }
            },
            onSuccess: async (user) => {
                const isPasswordMatch = await bcrypt.compare(password, user.passwordHash)
                if (username === user.username && isPasswordMatch) {
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            }
        }))
    }))

    return async (ctx, next) => {
        await passport.initialize()(ctx, async () => {
            await passport.session()(ctx, next)
        })
    }
}

export default passportMiddleware