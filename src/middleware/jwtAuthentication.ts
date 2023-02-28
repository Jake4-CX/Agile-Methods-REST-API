import { Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";

export const jwtAuthentication = (req: Request, res: Response, next: Function) => {

  if (!req.headers['authorization']) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  const token = (req.headers['authorization'].split(' ')[1]); // From Bearer <token> to <token>
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, async (err: Error, decoded) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

      const userRepository = AppDataSource.getRepository(Users)
      const userData = await userRepository.findOne({
          where: { id: decoded.id },
          relations: ["account_role"]
      })

      if (!userData) return res.status(401).send({ auth: false, message: 'Incorrect payload data' });

      req.user_data = userData
      
      next();
  });
}