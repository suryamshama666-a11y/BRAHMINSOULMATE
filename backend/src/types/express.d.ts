import 'express-serve-static-core';
import { User } from '@supabase/supabase-js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
    correlationId?: string;
    isAdmin?: boolean;
    rawBody?: Buffer;
  }
}

