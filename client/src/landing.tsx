import React from 'react';
import { useNavigate } from "react-router-dom";


function Landing() {

    const navigate = useNavigate()

    const handleSubmitAddUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  navigate("/adduser")  
}

    const handleSubmitAddExam = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  navigate("/addquestion")  
}

  const handleDeleteUser = async (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  navigate("/deleteuser")

}
  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <h1 className="text-4xl font-bold text-white absolute top-4 ">Welcome to Skilltronics (admin)!</h1>
        <button
          type="submit"
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Check Answer
        </button>

        <button
          type="button"
          onClick = {handleSubmitAddUser}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Add User
        </button>
         <button
          type="button"
          onClick = {handleDeleteUser}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Delete User
        </button>
        
         
         <button
          type="submit"
          onClick = {handleSubmitAddExam}
            className="rounded-lg bg-slate-800 py-3.5 px-6 border border-transparent text-center text-base text-white transition-all shadow hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"

        >
          Add Test
        </button>
    </div>

    
  );
}

export default Landing;
