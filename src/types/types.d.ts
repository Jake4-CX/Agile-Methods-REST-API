declare namespace Express {
    export interface Request {
      user_data?: any;
      token?: string;
    }
}

type FileNameCallback = (error: Error | null, filename: string) => void