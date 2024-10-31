import { PrismaClient, User } from "@prisma/client";
import { InternalError } from "../../utils/errors";
import { Effect, Option } from "effect";
import { AtLeastOne } from "../../utils/types";

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

    public async createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<Effect.Effect<User, InternalError>> {
        try {
            const createdUser = await this.db.user.create({ data })
            return Effect.succeed(createdUser)
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to create user: ${e}`))
        }
    }

    public async getUser(where: AtLeastOne<Pick<User, "id"| "username" | "email">>): Promise<Effect.Effect<Option.Option<User>, InternalError>> {
        try {
            const user = await this.db.user.findUnique({ where })
            return user ? Effect.succeed(Option.some(user)) : Effect.succeed(Option.none())
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to get user with ${where}: ${e}`))
        }
    }

    public async updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<Effect.Effect<User, InternalError>> {
        try {
            const updatedUser = await this.db.user.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                }
            })
            return Effect.succeed(updatedUser)
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to update user with id [${id}]: ${e}`))
        }
    }

    public async deleteUser(id: string): Promise<Effect.Effect<User, InternalError>> {
        try {
            const deletedUser = await this.db.user.delete({ where: { id } })
            return Effect.succeed(deletedUser)
        } catch (e) {
            return Effect.fail(new InternalError(`Failed to delete user with id [${id}]: ${e}`))
        }
    }
}