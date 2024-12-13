
import { Effect, Option, pipe } from "effect"
import { AuthenticationError, InternalError } from "../../utils/errors"
import DatabaseService from "../database-service/DatabaseService"
import { User } from "@prisma/client"
import { AtLeastOne } from "../../utils/generics"
import bcrypt from "bcrypt"

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

    static hashPassword(password: string): Effect.Effect<string, InternalError> {
        return Effect.tryPromise({
            try: () => bcrypt.hash(password, 10),
            catch: (e) => new InternalError(`Failed to hash password: ${e}`)
        })
    }
    
    static checkPassword(hash: string) {
        return (password: string): Effect.Effect<boolean, InternalError> => {
            return Effect.tryPromise({
                try: () => bcrypt.compare(password, hash),
                catch: (e) => new InternalError(`Failed to check password: ${e}`)
            })
        }
    }

    public getUser(where: AtLeastOne<Pick<User, "id"| "username" | "email">>): Effect.Effect<User, AuthenticationError | InternalError, DatabaseService> {
        return pipe(
            this.databaseService.getUser(where),
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`Failed to get user. User with ${where} is not found.`) : e)
        )
    }

    public createUser(data: Pick<User, "username" | "email"> & { password: string }): Effect.Effect<User, AuthenticationError | InternalError, DatabaseService> {
        return pipe(
            this.databaseService.getUser({ username: data.username }),
            Effect.flatMap(user => Option.isSome(user) ? Effect.fail(new AuthenticationError(`Failed to create user. Username [${data.username}] has been used.`)) : Effect.void),
            Effect.flatMap(() => this.databaseService.getUser({ email: data.email })),
            Effect.flatMap(user => Option.isSome(user) ? Effect.fail(new AuthenticationError(`Failed to create user. Email [${data.email}] has been used.`)) : Effect.void),
            Effect.flatMap(() => AuthService.hashPassword(data.password)),
            Effect.map(passwordHash => ({ username: data.username, email: data.email, passwordHash })),
            Effect.flatMap(user => this.databaseService.createUser(user))
        )
    }

    public updateUser(where: AtLeastOne<Pick<User, "id" | "username" | "email">>, data: Partial<Pick<User, "username" | "email"> & { password: string }>): Effect.Effect<User, AuthenticationError | InternalError, DatabaseService> {
        return pipe(
            this.databaseService.getUser(where),
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`Failed to update user. User with ${where} is not found.`) : e),
            Effect.flatMap(user => this.databaseService.updateUser(data)(user.id))
        )
    }
}