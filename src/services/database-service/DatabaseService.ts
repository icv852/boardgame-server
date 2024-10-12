import { PrismaClient, User } from "@prisma/client";
import { AuthenticationError, InternalError } from "../../utils/errors";
import { Effect } from "effect";

export default class DatabaseService {
    private db: PrismaClient
    
    private constructor(db: PrismaClient) {
        this.db = db
    }

    static init() {
        try {
            const prisma = new PrismaClient()
            return new DatabaseService(prisma)
        } catch (e) {
            throw new InternalError(`Failed to initiate DatabaseService: ${e}`)
        }        
    }

    public async getUserById(id: string): Promise<Effect.Effect<User, AuthenticationError | InternalError>> {
        try {
            const user = await this.db.user.findUnique({ where: { id } })
            return user ? Effect.succeed(user) : Effect.fail(new AuthenticationError(`User with ID: ${id} is not found.`))
        } catch (e) {
            return Effect.fail(new InternalError(e))
        }        
    }

    public async getUserByUsername(username: string): Promise<Effect.Effect<User, AuthenticationError | InternalError>> {
        try {
            const user = await this.db.user.findUnique({ where: { username } })
            return user ? Effect.succeed(user) : Effect.fail(new AuthenticationError(`User with username: ${username} is not found.`))
        } catch (e) {
            return Effect.fail(new InternalError(e))
        }        
    }
}