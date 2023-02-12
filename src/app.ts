import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as morgan from 'morgan';
import { Routes } from "./routes";
import { validationResult } from "express-validator/src/validation-result";
import { jwtAuthentication } from './middleware/JwtAuthentication';
import { roleAuthentication } from "./middleware/roleAuthentication";
const cors = require('cors');


function handleError(err, req: Request, res: Response, next: Function) {
    res.status(err.statusCode || 500).send({message: err.message});
}


// create express app
const app:express = express();
app.use(morgan('tiny')); // Console logs
app.use(bodyParser.json());
app.use(cors({ origin: '*' })); // Cross origin resource sharing = *   

// register express routes from defined application routes
Routes.forEach(route => {
    (app as any)[route.method](route.route,
        ...route.validation,
        route.authorization == true ? jwtAuthentication : [], // jwt verification
        route.allowed_roles.length > 0 ? roleAuthentication : [], // role verification
        async (req: Request, res: Response, next: Function) => {
        try {
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const result = await (new (route.controller as any))[route.action](req, res, next);
            res.json(result);
        } catch(error) {
            next(error);
        }
    })
})

app.use(handleError);

export default app;