// "use client";

// import { useEffect } from "react";
// // import Navigation from '../components/navigation/Navigation';
// export default function Home() {
//   useEffect(() => {
//     // Ensure this runs in the browser only
//     if (typeof window !== "undefined") {
//       // Store the backend URL in sessionStorage
//       sessionStorage.setItem("backend_url", "http://localhost:8000");
//       console.log("Backend URL stored in sessionStorage.");
//     }
//   }, []);

//   return (
//     <>
//       <div className="flex justify-center items-center min-h-screen bg-white">
//         <h1 className="text-center text-5xl">
//           <strong>ProjectPath</strong>
//         </h1>
//       </div>
//     </>
//   );
// }
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuth(); // Get current user
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("backend_url", "http://localhost:8000");
      console.log("Backend URL stored in sessionStorage.");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/signup");
    }
  }, [user, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <h1 className="text-center text-5xl">
        <strong>ProjectPath</strong>
      </h1>
    </div>
  );
}
