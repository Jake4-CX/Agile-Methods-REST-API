import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from "express"
import { Users } from "../entity/Users"
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
const bcrypt = require('bcrypt');
var createError = require('http-errors');

export class UserController {

    private userRepository = AppDataSource.getRepository(Users)

    async all(request: Request, response: Response, next: NextFunction) {
        // todo, delete password from response
        const users = await this.userRepository.find();

        console.log("UserID from JWT: " + request.userId)

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
        console.log("UserID from JWT: " + request.userId)
        

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
        const { user_email, user_password } = request.body;

        const user: Users = await this.userRepository.findOne({
            where: { user_email }
        });

        if (!user) return next(createError(401, "Invalid Email or Password!")); // A user does not exist with this email address

        const passwordMatch = await bcrypt.compare(user_password, user.user_password);

        if (!passwordMatch) return next(createError(401, "Invalid Email or Password!")); // Password is incorrect

        delete user.user_password;

        const token = jwt.sign({ id: user.id, email: user.user_email }, process.env.JWT_SECRET, { expiresIn: "30m" });

        return {...user, token}

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

}