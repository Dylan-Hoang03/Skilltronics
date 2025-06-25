import React from 'react';
import { useNavigate } from "react-router-dom";
function Landingnotadmin() {
        const navigate = useNavigate()
    
        const handleSubmitUpdatePassword = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      navigate("/newpassword")  
    }

        const handleTakeTest = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      navigate("/taketest")  
    }
    
         const handleTakeLesson = async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      navigate("/takelesson")  
    }
    
    
  return (    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <h1 className="text-4xl font-bold text-white absolute top-4 ">Welcome to Skilltronics!</h1>
        <button
      
          type="submit"
          onClick = {handleTakeTest}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Take Test
        </button>

        <button
          type="button"
        //   onClick = {}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          View Score
        </button>
         <button
          type="button"
          onClick = {handleTakeLesson}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Review Material
        </button>
        
         
         <button
          type="submit"
            onClick = {handleSubmitUpdatePassword}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Change Password
        </button>
    </div>

  );
}

export default Landingnotadmin;
