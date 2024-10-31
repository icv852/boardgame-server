import { Effect } from "effect"
import { AuthenticationError, InternalError } from "../../utils/errors"
import DatabaseService from "../database-service/DatabaseService"
import { User } from "@prisma/client"
import { AtLeastOne } from "../../utils/types"

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

    public async getUser(where: AtLeastOne<Pick<User, "id"| "username" | "email">>): Promise<Effect.Effect<User, AuthenticationError | InternalError, DatabaseService>> {
        const result = await this.databaseService.getUser(where)
        return result.pipe(
            Effect.flatten,
            Effect.mapError(e => e._tag === "NoSuchElementException" ? new AuthenticationError(`User with ${where} is not found`) : e)
        )
    }
}