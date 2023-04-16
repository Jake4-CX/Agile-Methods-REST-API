declare namespace Express {
    export interface Request {
      user_data?: any;
      token?: string;
    }
}

declare enum VerificationType {
  "email_verification" = 1,
  "password_reset" = 2
}

interface decodedJWT {
  id: number,
  email: string,
  iat: number,
  exp: number
}

type FileNameCallback = (error: Error | null, filename: string) => void