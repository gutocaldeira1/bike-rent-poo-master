import sinon from "sinon"
import { Crypt } from "./crypt"
import { App } from "./app"
import { Bike } from "./bike"
import { User } from "./user"
import { Location } from "./location"
import { BikeNotFoundError } from "./errors/bike-not-found-error"
import { UnavailableBikeError } from "./errors/unavailable-bike-error"
import { UserNotFoundError } from "./errors/user-not-found-error"
import { UserAlreadyRegisteredError } from "./errors/user-already-registered"
import { UserNotAuthenticatedError } from "./errors/user-not-authenticated-error"
import { BikeAlreadyRegisteredError } from "./errors/bike-already-registered-error"
import { RentNotFoundError } from "./errors/rent-not-found-error"

describe('App', () => {
    it('should correctly calculate the rent amount', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        const clock = sinon.useFakeTimers();
        app.rentBike(bike.id, user.email)
        const hour = 1000 * 60 * 60
        clock.tick(2 * hour)
        const rentAmount = app.returnBike(bike.id, user.email)
        expect(rentAmount).toEqual(200.0)
    })

    it('should be able to move a bike to a specific location', () => {
        const app = new App()
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        const newYork = new Location(40.753056, -73.983056)
        app.moveBikeTo(bike.id, newYork)
        expect(bike.location.latitude).toEqual(newYork.latitude)
        expect(bike.location.longitude).toEqual(newYork.longitude)
    })

    it('should throw an exception when trying to move an unregistered bike', () => {
        const app = new App()
        const newYork = new Location(40.753056, -73.983056)
        expect(() => {
            app.moveBikeTo('fake-id', newYork)
        }).toThrow(BikeNotFoundError)
    })

    it('should correctly handle a bike rent', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        app.rentBike(bike.id, user.email)
        expect(app.rents.length).toEqual(1)
        expect(app.rents[0].bike.id).toEqual(bike.id)
        expect(app.rents[0].user.email).toEqual(user.email)
        expect(bike.available).toBeFalsy()
    })

    it('should throw unavailable bike when trying to rent with an unavailable bike', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        app.rentBike(bike.id, user.email)
        expect(() => {
            app.rentBike(bike.id, user.email)
        }).toThrow(UnavailableBikeError)
    })

    it('should throw user not found error when user is not found', () => {
        const app = new App()
        expect(() => {
            app.findUser('fake@mail.com')
        }).toThrow(UserNotFoundError)
    })

    it('should throw user already registered error when registering a already registered user', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)

        expect(async () => {
            await app.registerUser(user)
        }).toThrow(UserAlreadyRegisteredError)
    })

    it('should throw user not authenticated error when user password is incorrect', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)

        expect(async () => {
            app.authenticate('jose@mail.com', '12345')
        }).toThrow(UserNotAuthenticatedError)

        expect(async () =>{
            app.authenticate('jose@gmail.com', '1234')
        }).toThrow(UserNotFoundError)
    })

    it('should throw bike already registered error when registering a already registered bike', () => {
        const app = new App()
        const bike = new Bike('caloi mountainbike', 'mountain bike',
            1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)

        expect(() => {
            app.registerBike(bike)
        }).toThrow(BikeAlreadyRegisteredError)
    })

    it('should throw user not found error when removing a unregistered user', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        app.registerUser(user)

        expect(() => {
            app.removeUser(user.email)
        }).toThrow(UserNotFoundError)
    })

    it('should throw rent not found error when returning a bike to a unexisting rent', async () => {
        const app = new App()
        const user = new User('Jose', 'jose@mail.com', '1234')
        await app.registerUser(user)
        const bike = new Bike('caloi mountainbike', 'mountain bike', 1234, 1234, 100.0, 'My bike', 5, [])
        app.registerBike(bike)
        app.rentBike(bike.id, user.email)

        expect(() => {
            app.returnBike('fakeid', user.email)
        }).toThrow(BikeNotFoundError)

        expect(() => {
            app.returnBike(bike.id, 'fakeemail')
        }).toThrow(UserNotFoundError)

        expect(() => {
            app.returnBike('fakeid', user.email)
        }).toThrow(RentNotFoundError)
    })
})