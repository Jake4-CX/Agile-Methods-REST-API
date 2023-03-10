import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from "express"
import { Users } from "../entity/Users"
import { verify, sign } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';
import { RefreshTokens } from '../entity/RefreshTokens';
import { recaptcha_secret_key } from '../config';
import axios from 'axios';
const bcrypt = require('bcrypt');
var createError = require('http-errors');

export class UserController {

    private userRepository = AppDataSource.getRepository(Users)
    private refreshTokenRepository = AppDataSource.getRepository(RefreshTokens)

    async all(request: Request, response: Response, next: NextFunction) {
        // todo, delete password from response
        const users = await this.userRepository.find();

        console.log("UserID from JWT: " + request.user_data.id)

        try {
            users.forEach(user => {
                delete user.user_password;
            })
        } finally {
            return users;
        }
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id);
        console.log("UserID from JWT: " + request.user_data.id)


        const user = await this.userRepository.findOne({
            where: { id }
        })

        if (!user) {
            return next(createError(401, "user does not exist"));
        }
        return user
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)

        let userToRemove = await this.userRepository.findOneBy({ id })
        if (!userToRemove) return next(createError(401, "user does not exist"));

        await this.userRepository.remove(userToRemove)
    }

    async login(request: Request, response: Response, next: NextFunction) {
        const { user_email, user_password, recaptcha_token } = request.body;

        // Verify recaptcha_token
        const recaptchaSecret = recaptcha_secret_key;
        const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;
        const recaptchaVerifyData = {
            secret: recaptchaSecret,
            response: recaptcha_token,
        };
        
        const recaptchaVerifyResponse = await axios.post(recaptchaVerifyUrl, recaptchaVerifyData);
        if (!recaptchaVerifyResponse.data.success) {
            return next(createError(401, "reCAPTCHA verification failed!"));
        }

        const user: Users = await this.userRepository.findOne({
            where: { user_email },
            relations: ["account_role"]
        });

        if (!user) return next(createError(401, "Invalid Email or Password!")); // A user does not exist with this email address

        const passwordMatch = await bcrypt.compare(user_password, user.user_password);

        if (!passwordMatch) return next(createError(401, "Invalid Email or Password!")); // Password is incorrect

        delete user.user_password;

        const tokens = await this.createTokens(user)

        if (tokens == null) return next(createError(500, "An error occurred while logging in."));

        return { ...user, tokens: tokens }

    }

    async register(request: Request, response: Response, next: NextFunction) {
        let { user_email, user_password, first_name, last_name } = request.body;

        user_password = await bcrypt.hash(user_password, 10);

        console.log("user_password: " + user_password);

        if (await this.userRepository.findOne({ where: { user_email } }) !== null) {
            return next(createError(401, "An account already exists with this email address"));

        }

        const user_uuid = uuidv4();

        const user = Object.assign(new Users(), {
            user_email: user_email,
            user_password: user_password,
            first_name: first_name,
            last_name: last_name,
            user_uuid: user_uuid,
            account_role: 1
        });

        const db_response: Users = await this.userRepository.save(user);

        delete db_response.user_password;
        delete db_response.last_login_date;
        delete db_response.registration_date;

        return db_response
    }

    async refresh_token(request: Request, response: Response, next: NextFunction) {
        const token = request.token;

        let tokens: { accessToken: string, refreshToken: string };

        if (verify(token, process.env.JWT_REFRESH_SECRET)) {
            tokens = await this.createTokens(request.user_data as Users)
            if (tokens == null) return next(createError(500, "An error occurred whilst generating tokens."));
        } else {
            return next(createError(401, "This is not a refresh token."));
        }

        return { tokens: tokens }

    }


    async createTokens(user: Users) {
        const accessToken = sign({ id: user.id, email: user.user_email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
        const refreshToken = sign({ id: user.id, email: user.user_email }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

        const response = await this.refreshTokenRepository.save(Object.assign(new RefreshTokens(), {
            user: user.id,
            refresh_token: refreshToken,
            created_at: new Date(),
            expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000))
        }))

        if (response !== null) return ({ accessToken, refreshToken })

        return null
    }
}