export class UserNotAuthenticatedError extends Error{
    public readonly name = 'UserNotAuthenticatedError'

    constructor() {
        super('User not authenticated.')
    }
}