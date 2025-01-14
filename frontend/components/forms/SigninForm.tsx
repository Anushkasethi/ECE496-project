"use client";

import Link from "next/link";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthProvider } from "@/context/AuthContext";


export function SigninForm() {
  const { login, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    const router = useRouter();

    e.preventDefault(); 
    try {
      await login(email, password);
      router.push("/")
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AuthProvider>
      <Card className="w-full max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg text-gray-900 dark:text-gray-100">
        <CardHeader className="flex flex-col items-center text-center mb-4">
          <CardTitle className="text-2xl font-bold">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Log in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block mb-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mb-1">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-black dark:bg-white dark:text-black text-white mt-4 hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Sign In
            </Button>
          </form>
          <CardFooter className="mt-4">
            <div className="mt-4 text-center text-sm">
              Don't have an account?
              <Link className="underline ml-2" href="signup">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </AuthProvider>
  );
}