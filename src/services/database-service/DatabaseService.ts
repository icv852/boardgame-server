import { PrismaClient, User } from "@prisma/client";
import { InternalError } from "../../utils/errors";
import { Effect, Option } from "effect";
import { AtLeastOne } from "../../utils/generics";

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

    public createUser(data: Pick<User, "username" | "email" | "passwordHash">): Effect.Effect<User, InternalError> {
        return Effect.tryPromise({
            try: () => this.db.user.create({ data }),
            catch: (e) => new InternalError(`Failed to create user: ${e}`)
        })
    }

    public getUser(where: AtLeastOne<Pick<User, "id"| "username" | "email">>): Effect.Effect<Option.Option<User>, InternalError> {
        return Effect.tryPromise({
            try: () => this.db.user.findUnique({ where }),
            catch: (e) => new InternalError(`Failed to get user with ${where}: ${e}`)
        })
        .pipe(
            Effect.map(user => user ? Option.some(user) : Option.none())
        )
    }

    public updateUser(data: Partial<Pick<User, "username" | "email" | "passwordHash">>) {
        return (id: string): Effect.Effect<User, InternalError> => {
            return Effect.tryPromise({
                try: () => this.db.user.update({
                    where: { id },
                    data: { ...data, updatedAt: new Date() }
                }),
                catch: (e) => new InternalError(`Failed to update user with id [${id}]: ${e}`)
            })
        }        
    }

    public deleteUser(id: string): Effect.Effect<User, InternalError> {
        return Effect.tryPromise({
            try: () => this.db.user.delete({ where: { id } }),
            catch: (e) => new InternalError(`Failed to delete user with id [${id}]: ${e}`)
        })
    }
}