"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
import { useAuth } from "@/context/authcontext"; // Import authentication
import { useRouter } from "next/navigation";
const Navbar = () => {
  const { user, logout, clearUserData } = useAuth(); // Get current user and logout function
  const router = useRouter();
  const handleLogout = () => {
    clearUserData(); // Reset user data
    logout(); // Call your logout function to end the session
    router.push('/signup'); // Redirect to the signup page
  };
  return (
    <div className="w-full h-20 bg-[#7cb8c0] sticky top-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          <Link href="/">
            <Logo />
          </Link>
          <ul className="hidden md:flex gap-x-6 text-white">
            <li>
              <Link href="/about">
                <p>About Us</p>
              </Link>
            </li>
            <li>
              <Link href="/upload-syllabus">
                <p>Upload Syllabus</p>
              </Link>
            </li>
            <li>
              <Link href="/when2meet">
                <p>Calendar</p>
              </Link>
            </li>
          </ul>

          {user ? (
            <Button variant="ghost" className="ml-2 hover:bg-white/10" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Link href="/signup">
              <Button variant="ghost" className="ml-2 hover:bg-white/10">
                Sign Up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
