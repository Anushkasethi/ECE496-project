"use client";

import React, { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "./animations/Animation.json";

const Loader = () => {
  const [currentFact, setCurrentFact] = useState<string>(
    "Did you know? Breaking tasks into subtasks improves productivity by 40%!"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Player
        autoplay
        loop
        src={animationData} 
        style={{ height: "300px", width: "300px" }}
      />
      <h2 className="text-2xl font-bold mt-6">Processing your syllabus...</h2>
      <p className="text-teal-500 mt-2">{currentFact}</p>
    </div>
  );
};

export default Loader;
