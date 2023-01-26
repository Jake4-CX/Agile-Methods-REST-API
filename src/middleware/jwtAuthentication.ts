import { Request, Response } from "express";
import * as jwt from 'jsonwebtoken';

export const jwtAuthentication = (req: Request, res: Response, next: Function) => {

  if (!req.headers['authorization']) return res.status(401).send({ auth: false, message: 'No token provided.' });
  
  const token = (req.headers['authorization'].split(' ')[1]); // From Bearer <token> to <token>
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err: Error, decoded) => {
      if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      req.userId = decoded.id;
      console.log("from storage: " + req.userId);
      next();
  });
}