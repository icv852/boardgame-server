import passport from "koa-passport"
import { User } from "../models/User"

passport.serializeUser((user: User, done) => { done(null, user.id) })

passport.deserializeUser((id: number, done) => {
    
})