import Hash         from 'hash.js';
import Passport     from 'passport';
import { Strategy } from 'passport-local';

import { ModelUser } from '../data/user_model.mjs';

/**
 * Initialize passport and setup authentication
 * @param {Passport} passport 
 */
export function initialize_passport(passport) {
    passport.use(LocalStrategy);

    passport.serializeUser(function (user, done) {
        return done(null, user.uuid);
    });

    passport.deserializeUser(async function (uid, done) {
        try {
            const user = await ModelUser.findByPk(uid);
            if (user == null) {
                throw new Error("User not found");
            }
            else {
                done(null, user);
            }
        }
        catch (error) {
            console.error(`User id not found: ${uid}`);
            return done(error, false);
        }
    });
}

/**
 * Strategy to be used to authenticate users??
 * @see http://www.passportjs.org/docs/authenticate
 */
const LocalStrategy = new Strategy({usernameField: "email", passwordField: "password"}, async function (email, password, done) {
    //  A
    try {
        const user = await ModelUser.findOne({
            where: {
                email:    email,
                password: Hash.sha256().update(password).digest("hex")
            }
        });

        if (user == null) {
            throw new Error("User not found");
        }
        else {
            return done(null, user);
        }
    }
    catch (error) {
        console.error(`Error attempting to auth user: ${email}: ${password}`);
        return done(null, false, { message: 'Invalid credentials!' });
    }
});