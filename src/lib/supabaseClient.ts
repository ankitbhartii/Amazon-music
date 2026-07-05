import { createClient, Provider } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholders
const hasCredentials = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

export const isMockMode = !hasCredentials;

export const supabase = hasCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
  };
}

interface MockUser {
  id: string;
  email: string;
  fullName: string;
  password?: string;
}

export const authService = {
  signUp: async (email: string, password: string, fullName: string) => {
    if (!isMockMode && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        // Handle auto-signin configurations in Supabase
        if (data?.user) {
          return { 
            user: data.user as unknown as AuthUser, 
            message: data.session ? 'Sign up successful!' : 'Sign up successful! Please check your email for a confirmation link.',
            error: null 
          };
        }
        return { user: null, message: '', error };
      } catch (err) {
        return { user: null, message: '', error: err as Error };
      }
    } else {
      // Mock Sign Up
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency
      if (typeof window === 'undefined') {
        return { user: null, message: '', error: new Error('Window is undefined') };
      }
      
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]') as MockUser[];
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, message: '', error: new Error('A user with this email address already exists.') };
      }
      
      const newUser: MockUser = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        fullName,
        password // only for mock credentials validation
      };
      
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      const sessionUser: AuthUser = {
        id: newUser.id,
        email: newUser.email,
        user_metadata: { full_name: newUser.fullName }
      };
      
      // Auto login in mock mode
      localStorage.setItem('mock_current_user', JSON.stringify(sessionUser));
      return { user: sessionUser, message: 'Sign up successful! (Mock Mode)', error: null };
    }
  },

  signIn: async (email: string, password: string) => {
    if (!isMockMode && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { user: null, error };
        return { user: data?.user as unknown as AuthUser, error: null };
      } catch (err) {
        return { user: null, error: err as Error };
      }
    } else {
      // Mock Login
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency
      if (typeof window === 'undefined') {
        return { user: null, error: new Error('Window is undefined') };
      }
      
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]') as MockUser[];
      const foundUser = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        return { 
          user: null, 
          error: new Error('Invalid login credentials. Please register or verify your email and password.') 
        };
      }
      
      const sessionUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        user_metadata: { full_name: foundUser.fullName }
      };
      
      localStorage.setItem('mock_current_user', JSON.stringify(sessionUser));
      return { user: sessionUser, error: null };
    }
  },

  signOut: async () => {
    if (!isMockMode && supabase) {
      const { error } = await supabase.auth.signOut();
      return { error };
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_current_user');
      }
      return { error: null };
    }
  },

  getCurrentUser: async (): Promise<AuthUser | null> => {
    if (!isMockMode && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return null;
        return user as unknown as AuthUser;
      } catch {
        return null;
      }
    } else {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('mock_current_user');
        return user ? JSON.parse(user) as AuthUser : null;
      }
      return null;
    }
  },

  signInWithOAuth: async (provider: 'google' | 'apple' | 'amazon') => {
    if (!isMockMode && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as Provider,
          options: {
            redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
          },
        });
        return { error };
      } catch (err) {
        return { error: err as Error };
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return { 
        error: new Error(
          `"${provider}" social authentication is simulated. Please create an email/password account, or configure your Supabase variables in .env.local.`
        ) 
      };
    }
  }
};
