import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

export default function DeleteUser() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith("@spartronics.com")) {
      alert("Email must end with @spartronics.com");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Deletion failed, no account found");
        return;
      }

      alert(data.message || "Account deleted");
      setEmail("");
      navigate("/");               
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network or server error during deletion.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">SKILLTRONICS</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <label className="block font-medium col-span-2">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
}
