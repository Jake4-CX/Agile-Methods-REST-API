import { param, body } from "express-validator";
import { UserController } from "./controller/UserController"

export const Routes = [{
    method: "get",
    route: "/users",
    controller: UserController,
    action: "all",
    authorization: true,
    allowed_roles: [],
    validation: [],
}, {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
    authorization: true,
    allowed_roles: [],
    validation: [
        param('id').isInt({min: 0}).withMessage("id must be a positive integer"),
    ]
}, {
    method: "delete",
    route: "/users/:id",
    controller: UserController,
    action: "remove",
    authorization: false,
    allowed_roles: ["admin"],
    validation: [
        param('id').isInt({min: 0}).withMessage("id must be a positive integer"),
    ]
}, {
    method: "post",
    route: "/users/login",
    controller: UserController,
    action: "login",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('email').isEmail().withMessage("email must be a valid email"),
        body('password').isString().withMessage("password must be a string")
    ]
}, {
    method: "post",
    route: "/users/register",
    controller: UserController,
    action: "register",
    authorization: false,
    allowed_roles: [],
    validation: [
        body('email').isEmail().withMessage("email must be a valid email"),
        body('password').isString().withMessage("password must be a string"),
        body('firstName').isString().withMessage("firstName must be a string"),
        body('lastName').isString().withMessage("lastName must be a string"),
        body('age').isInt({min: 0}).withMessage("age must be a positive integer"),
    ]
}]