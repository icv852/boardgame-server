export class GameLogicError extends Error {
    readonly _tag = "GameLogicError"

    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InternalError extends Error {
    readonly _tag = "InternalError"

    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class AuthenticationError extends Error {
    readonly _tag = "AuthenticationError"

    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}