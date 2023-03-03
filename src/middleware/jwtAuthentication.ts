import { Request, Response } from "express";
// import * as jwt from 'jsonwebtoken';
import { verify, sign } from 'jsonwebtoken'
import { AppDataSource } from "../data-source";
import { RefreshTokens } from "../entity/RefreshTokens";
import { Users } from "../entity/Users";

export const jwtAuthentication = async (req: Request, res: Response, next: Function) => {

  if (!req.headers['authorization']) return res.status(401).send({ auth: false, message: 'No token provided.' });

  const token = (req.headers['authorization'].split(' ')[1]); // From Bearer <token> to <token>
  req.token = token
  
  if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

  try {
    var decoded = verify(token, process.env.JWT_REFRESH_SECRET) as decodedJWT;

    const userRepository = AppDataSource.getRepository(Users)
    const userData = await userRepository.findOne({
      where: { id: decoded.id },
      relations: ["account_role"]
    })

    if (!userData) return res.status(401).send({ auth: false, message: 'Incorrect payload data' })

    const refreshTokenRepository = AppDataSource.getRepository(RefreshTokens)

    const refreshToken: RefreshTokens = await refreshTokenRepository.createQueryBuilder("refresh_token")
      .leftJoinAndSelect("refresh_token.user", "user")
      .where("refresh_token.refresh_token = :refresh_token", { refresh_token: token })
      .andWhere("refresh_token.user = :user", { user: userData.id })
      .andWhere("refresh_token.expires_at > :expires_at", { expires_at: new Date() })
      .getOne()

    if (!refreshToken) return res.status(401).send({ auth: false, message: 'Refresh token has already been used / expired.' })

    await refreshTokenRepository.delete(refreshToken)

    req.user_data = userData
    next()

  } catch (error) {
    // do nothing

    verify(token, process.env.JWT_ACCESS_SECRET, async (err: Error, decoded: decodedJWT) => {

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

}

interface decodedJWT {
  id: number,
  email: string,
  iat: number,
  exp: number
}