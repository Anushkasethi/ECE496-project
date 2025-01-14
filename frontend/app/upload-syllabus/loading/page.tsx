"use client";

import React, { useState, useEffect } from "react";
// import { Player } from "@lottiefiles/react-lottie-player";
// import animationData from "@/components/animations/Animation.json";

const LoadingPage = () => {
  const [currentFact, setCurrentFact] = useState(
    "Did you know? Breaking tasks into subtasks improves productivity!"
  );

  const facts = [
    "Dividing tasks makes it easier to tackle and reducing feelings of overwhelm.",
    "Well-organized task management can reduce project delays",
    "Assigning tasks based on skills improves team efficiency.",
    "Clear task prioritization reduces stress and enhances focus.",
    "Milestones help track progress and ensure timely project completion.",
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentFact(facts[index]);
      index = (index + 1) % facts.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* <Player
        autoplay
        loop
        src={animationData}
        style={{ height: "200px", width: "200px" }}
      /> */}
      <h2 className="text-xl font-semibold mt-6">Processing your syllabus...</h2>
      <p className="text-teal-500 mt-2 text-center">{currentFact}</p>
    </div>
  );
};

export default LoadingPage;
