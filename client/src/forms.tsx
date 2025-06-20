import { useState } from "react";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Form() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userName,
          password: password,
      
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok || !data.token) {
        throw new Error(data.error || "Wrong credentials");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("isAdmin", JSON.stringify(data.user.isAdmin));

      alert(`Login successful! Welcome ${data.user.firstName} ${data.user.lastName}`);

      if (data.user.isAdmin) {
        navigate("/landing");
      } else {
        navigate("/landingnotadmin");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      alert(err.message || "An error occurred during login.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl text-blue-800">SKILLTRONICS</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-xl">
        <label className="block mb-4 font-medium">
          Enter your Email:
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        <label className="block mb-4 font-medium">
          Enter your Password:
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="mb-4 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition"
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
