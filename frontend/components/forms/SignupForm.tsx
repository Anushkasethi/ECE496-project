"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthProvider } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SignupForm() {
  const { signup, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const message = await signup(email, password, password2);
    if (message) {
      setSuccessMessage(message);
    }
  };


  return (
    <AuthProvider>
      <Card className="w-full max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg text-gray-900 dark:text-gray-100">
        <CardHeader className="flex flex-col items-center text-center mb-4">
          <CardTitle className="text-2xl font-bold">
            Sign Up
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Create a new account
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

            <div>
              <Label htmlFor="password" className="block mb-1">
                Enter your password again
              </Label>
              <Input
                id="password"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}

            <Button
              type="submit"
              className="w-full bg-black dark:bg-white dark:text-black text-white mt-4 hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Sign Up
            </Button>
          </form>
          <CardFooter className="mt-4">
            <div className="mt-4 text-center text-sm">
              Already have an account?
              <Link className="underline ml-2" href="signin">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </CardContent>
      </Card>
    </AuthProvider>
  );
}