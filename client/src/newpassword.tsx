import { useState } from "react";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully!");
        navigate("/");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("⚠️ Network or server error:", err);
      alert("Request failed.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">SKILLTRONICS</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-6 mb-6">
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

        <div className="flex items-center justify-between mb-6">
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
          Change Password
        </button>
      </form>
    </div>
  );
}
