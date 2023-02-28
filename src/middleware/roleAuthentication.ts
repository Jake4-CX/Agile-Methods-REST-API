import { Request, Response } from "express";
import { AccountRoles } from "../entity/AccountRoles";
var createError = require('http-errors');

export const roleAuthentication = (allowed_roles: string[]) => {
  return function (req: Request, res: Response, next: Function) {
  
    const account_role: AccountRoles = req.user_data.account_role

    if (!(allowed_roles.includes(account_role.role_name))) {
      return next(createError(403, "You are not authorized to perform this action."));
    }
    next();
  }
}