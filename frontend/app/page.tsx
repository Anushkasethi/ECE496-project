"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Ensure this runs in the browser only
    if (typeof window !== "undefined") {
      // Store the backend URL in sessionStorage
      sessionStorage.setItem("backend_url", "http://localhost:8000");
      console.log("Backend URL stored in sessionStorage.");
    }
  }, []);

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-white">
      <h1 className="text-center text-5xl">
        <strong>ProjectPath</strong>
      </h1>
      </div>
    </>
  );
}