
import { Effect, Option, pipe } from "effect"
import bcrypt from "bcrypt"
import { AuthenticationError, InternalError } from "../../utils/errors"
import DatabaseService from "../database-service/DatabaseService"
import { User } from "@prisma/client"
import { AtLeastOne } from "../../utils/types"

const saltRounds = 10

export default class AuthService {
    private databaseService: DatabaseService

    private constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService
    }

    static init(databaseService: DatabaseService) {
        try {
            return new AuthService(databaseService)
        } catch (e) {
            throw new InternalError(`Failed to initiate AuthService: ${e}.`)
        }
    }

    public async getUser(where: AtLeastOne<Pick<User, "id"| "username" | "email">>): Promise<Effect.Effect<User, AuthenticationError | InternalError, DatabaseService>> {
        const result = await this.databaseService.getUser(where)
        return result.pipe(
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`Failed to get user. User with ${where} is not found.`) : e)
        )
    }

    public async createUser(data: Pick<User, "username" | "email"> & { password: string }): Promise<Effect.Effect<User, AuthenticationError | InternalError, DatabaseService>> {
        const checkUsernameUsed = pipe(
            await this.databaseService.getUser({ username: data.username }),
            Effect.flatMap(user => Option.isSome(user) ? Effect.fail(new AuthenticationError(`Failed to create user. Username [${data.username}] has been used.`)) : Effect.void),
        )
        const checkEmailUsed = pipe(
            await this.databaseService.getUser({ email: data.email }),
            Effect.flatMap(user => Option.isSome(user) ? Effect.fail(new AuthenticationError(`Failed to create user. Email [${data.email}] has been used.`)) : Effect.void),
        )

        const passwordHash = await bcrypt.hash(data.password, saltRounds)
        const saveUser = await this.databaseService.createUser({ 
            username: data.username,
            email: data.email,
            passwordHash
        })

        return Effect.all([checkUsernameUsed, checkEmailUsed, saveUser]).pipe(Effect.map(tasks => tasks[2]))
    }
}