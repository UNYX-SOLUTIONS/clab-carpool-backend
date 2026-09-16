declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        isDriver: boolean;
        isVerified: boolean;
      };
    }
  }
}

export {};
