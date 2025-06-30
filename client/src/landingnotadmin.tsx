import React from 'react';
import { useNavigate } from "react-router-dom";

export default function LandingNotAdmin() {
  const navigate = useNavigate();

  const buttons = [
    { label: "Take Test", onClick: () => navigate("/taketest") },
    { label: "View Score", onClick: () =>navigate("/viewownscore") },
    { label: "Review Material", onClick: () => navigate("/takelesson") },
    { label: "Change Password", onClick: () => navigate("/newpassword") },
    
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-10">Welcome to 
eLearning Portal!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className="w-full rounded-lg bg-slate-800 py-4 px-6 text-white text-lg font-medium shadow hover:bg-slate-700 transition"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
