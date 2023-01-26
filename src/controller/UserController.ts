import { AppDataSource } from '../data-source'
import { NextFunction, Request, Response } from "express"
import { Users } from "../entity/Users"
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

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
            throw Error("user does not exist");
        }
        return user
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const id = parseInt(request.params.id)
        
        let userToRemove = await this.userRepository.findOneBy({ id })
        if (!userToRemove) throw Error("user does not exist");

        await this.userRepository.remove(userToRemove)
    }

    async login(request: Request, response: Response, next: NextFunction) {
        const { user_email, user_password } = request.body;

        const user = await this.userRepository.findOne({
            where: { user_email }
        });

        if (!user) throw Error("user does not exist");
        if (user.user_password !== user_password) throw Error("password is incorrect");

        delete user.user_password;

        const token = jwt.sign({ id: user.id, email: user.user_email }, process.env.JWT_SECRET, { expiresIn: "30m" });

        return {...user, token}

    }

    async register(request: Request, response: Response, next: NextFunction) {
        let { user_email, user_password, first_name, last_name } = request.body;

        user_password = await bcrypt.hash(user_password, 10);

        if (await this.userRepository.findOne({ where: { user_email } }) !== null) {
            throw Error("a user with this email already exists");
        }

        const user_uuid = uuidv4();
        const date = Date.now();

        const user = Object.assign(new Users(), {
            user_email: user_email,
            user_password: user_password,
            first_name: first_name,
            last_name: last_name,
            user_uuid: user_uuid,
            registration_date: date,
            last_login_date: date,
            account_role_id: 0
        });

        return this.userRepository.save(user)
    }

}