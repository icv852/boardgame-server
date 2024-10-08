export class GameLogicError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}

export class InternalError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}
