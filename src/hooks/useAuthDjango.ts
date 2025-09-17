import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
// import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuthDjango() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user profile
      apiClient.getProfile()
        .then((response) => {
          setUser(response.user);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
      // Logged in successfully
      return { error: null };
    } catch (error: any) {
      // Login failed
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Note: You'll need to implement user registration in Django
      // For now, this is a placeholder
      // Please contact admin to create an account
      return { error: new Error("Registration not implemented") };
    } catch (error: any) {
      // Registration failed
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      localStorage.removeItem('token');
      // Logged out successfully
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      setUser(null);
      localStorage.removeItem('token');
      // You have been logged out
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
}
