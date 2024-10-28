import { Effect } from "effect"
import { AuthenticationError, InternalError } from "../../utils/errors"
import DatabaseService from "../database-service/DatabaseService"
import { User } from "@prisma/client"

export default class AuthService {
    private databaseService: DatabaseService

    private constructor(databaseService: DatabaseService) {
        this.databaseService = databaseService
    }

    static init(databaseService: DatabaseService) {
        try {
            return new AuthService(databaseService)
        } catch (e) {
            throw new InternalError(`Failed to initiate AuthService: ${e}`)
        }
    }

    public async getUserById(id: string): Promise<Effect.Effect<User, AuthenticationError | InternalError, DatabaseService>> {
        const result = await this.databaseService.getUserById(id)
        return result.pipe(
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`User with id: ${id} is not found.`) : e)
        )
    }

    public async getUserByUsername(username: string): Promise<Effect.Effect<User, AuthenticationError | InternalError, DatabaseService>> {
        const result = await this.databaseService.getUserByUsername(username)
        return result.pipe(
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`User with username: ${username} is not found.`) : e)
        )
    }
}