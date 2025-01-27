"use client";

// import React, { useCallback } from "react";
import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { Button } from "../ui/button";
// import { useAuth } from "@/context/authcontext";

interface NavbarProps {
  onLogout?: () => void;
  className?: string;
}

const Navbar = () => {
  // const { isLoggedIn, logout } = useAuth();

  // const closeMenu = useCallback(() => {
  //   setIsOpen(false);
  // }, []);

  return (
    <>
      <div  className="w-full h-20 bg-[#7cb8c0] sticky top-0">
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
              <li>
                <Link href="/contacts">
                  <p>N/A</p>
                </Link>
              </li>
            </ul>
            
            <Link href="/signin">
              <Button variant="ghost" className="ml-2 hover:bg-white/10">
                Login / Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar