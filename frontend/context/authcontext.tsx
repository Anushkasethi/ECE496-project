'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface authcontextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, password2: string) => Promise<string | null>;
  logout: () => Promise<void>;
  error: string | null;
}

const authcontext = createContext<authcontextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    setIsLoggedIn(!!userId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const formData = new URLSearchParams();

      formData.append('email', email);
      formData.append('password', password);
    
      const loginURL = sessionStorage.getItem('backend_url') + '/login';
      const response = await axios.post(loginURL, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

    //   if (!response.data.email_verified) {
    //     setError("Please verify your email before logging in.");
    //     setIsLoggedIn(false);
    //   } else {
        sessionStorage.setItem('user_id', response.data.user_id);
        sessionStorage.setItem('id_token', response.data.id_token);
        setIsLoggedIn(true);
        router.push('/');
    //   }
    } catch (error: any) {
      setError(error.response?.data.detail || 'Login failed');
      setIsLoggedIn(false);
    }
  };

  const signup = async (email: string, password: string, password2: string): Promise<string | null> => {
    try {
      setError(null);
      const formData = new URLSearchParams();

      if (!(password === password2)) {
        setError("Your passwords do not match.")
        return "Your passwords do not match.";
      } else {
        formData.append('email', email);
        formData.append('password', password);

        const signupURL = sessionStorage.getItem('backend_url') + '/signup';
        const response = await axios.post(signupURL, formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        //   TODO: implement email verification
        //   // Send verification email 
        //   const json = JSON.stringify({ id_token: response.data.id_token});

        //   await axios.post('https://localhost:8080/resend-verification-email', json, {
        //     headers: { 'Content-Type': 'application/json' },
        //   });

        if (response.status !== 200) {
            throw new Error(response.data.detail || "An unknown error occurred");
        }

        return "Signed up successfully. Check your email for the confirmation link.";
      }

    } catch (error: any) {
      setError(error.response?.data.detail);
      return null;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      const json = JSON.stringify({ id_token: sessionStorage.getItem("id_token")});
      const signoutURL = sessionStorage.getItem('backend_url') + '/signout';

      await axios.post(signoutURL, json, {
        headers: { 'Content-Type': 'application/json' },
      });
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('id_token');
      setIsLoggedIn(false);
      router.push('/signin');
    } catch (error: any) {
      setError(error.response?.data.detail || 'Logout failed');
    }
  };

  return (
    <authcontext.Provider value={{ isLoggedIn, login, signup, logout, error }}>
      {children}
    </authcontext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authcontext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
