
import { User } from '@supabase/supabase-js';

export interface IAuthUser extends User {
  perfil?: {
    nome: string;
    role: string;
  };
}

export type AuthMode = 'login' | 'signup' | 'recovery';
