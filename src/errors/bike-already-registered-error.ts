export class BikeAlreadyRegisteredError extends Error{
    public readonly name = 'AlreadyRegisteredBikeError'

    constructor() {
        super('Already registered bike.')
    }
}