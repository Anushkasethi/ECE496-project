"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SignupForm() {
  const { signup } = useAuth(); // Get signup function from context
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signup(email, password);
      setSuccessMessage("Account created successfully!");
      setTimeout(() => {
        router.push("/signin"); // Redirect to login page after signup
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg text-gray-900">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="password2">Confirm Password</Label>
            <Input
              id="password2"
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}
          <Button type="submit" className="w-full bg-black text-white">Sign Up</Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Already have an account? <a href="/signin" className="underline">Sign in</a>
      </CardFooter>
    </Card>
  );
}
