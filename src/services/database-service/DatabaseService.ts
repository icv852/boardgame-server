import { PrismaClient, User } from "@prisma/client";
import { InternalError } from "../../utils/errors";
import { Effect, Option } from "effect";

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

    public async getUserById(id: string): Promise<Effect.Effect<Option.Option<User>, InternalError>> {
        try {
            const user = await this.db.user.findUnique({ where: { id } })
            return user ? Effect.succeed(Option.some(user)) : Effect.succeed(Option.none())
        } catch (e) {
            return Effect.fail(new InternalError(e))
        }        
    }

    public async getUserByUsername(username: string): Promise<Effect.Effect<Option.Option<User>, InternalError>> {
        try {
            const user = await this.db.user.findUnique({ where: { username } })
            return user ? Effect.succeed(Option.some(user)) : Effect.succeed(Option.none())
        } catch (e) {
            return Effect.fail(new InternalError(e))
        }        
    }
}