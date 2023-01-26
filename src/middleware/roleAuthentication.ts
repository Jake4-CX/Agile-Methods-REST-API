import { Request, Response } from "express";

export const roleAuthentication = (req: Request, res: Response, next: Function) => {

  if (req.route.allowed_roles[req.user.account_role_id] === undefined) {
      return res.status(403).send({ message: "You are not authorized to perform this action." });
  }
  next();
}