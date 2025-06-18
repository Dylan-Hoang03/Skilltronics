import { useState } from "react";
import logo from "./assets/logo.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">SKILLTRONICS</h1>

      <form  className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl">
        {/* Grid layout for inputs */}
        <div className="grid grid-cols-2 gap-6 mb-6">
        





          {/* Password */}
          <label className="block font-medium col-span-1">
            Password
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>

          {/* Confirm Password */}
          <label className="block font-medium col-span-1">
            Confirm Password
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Show password toggle */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition focus:outline-none"
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

         
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
