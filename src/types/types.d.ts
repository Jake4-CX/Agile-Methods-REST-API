declare namespace Express {
    export interface Request {
      user_data?: any;
    }
}

type FileNameCallback = (error: Error | null, filename: string) => void