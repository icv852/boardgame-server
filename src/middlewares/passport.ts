import passport from "koa-passport"
import { User } from "@prisma/client"
import DatabaseService from "../services/database-service/DatabaseService"
import localStrategy from "passport-local"
import { Effect } from "effect"

const LocalStrategy = localStrategy.Strategy

const passportMiddleware = (db: DatabaseService) => {
    passport.serializeUser((user: User, done) => done(null, user.id)) 

    passport.deserializeUser(async (id: string, done) => {
        const user = await db.getUserById(id)
        user.pipe(Effect.match({
            onFailure: (e) => done(e),
            onSuccess: (user) => done(null, user),
        }))
    })

    passport.use(new LocalStrategy(async (username, password, done) => {
        const user = await db.getUserByUsername(username)
        user.pipe(Effect.match({
            onFailure: (e) => {
                switch (e._tag) {
                    case "InternalError": return done(e)
                    case "AuthenticationError": return done(null, false)
                }
            },
            onSuccess: (user) => {
                // TBD: password should be hashed
                if (username === user.username && password === user.passwordHash) {
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