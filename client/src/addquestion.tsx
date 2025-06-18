import { useState } from "react";
import logo from "./assets/logo.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const [employeeId, setEmployeeId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/createaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          firstName,
          lastName,
          email,
          password,
          isAdmin,
        }),
      });

  const text = await response.text();
let data;
try {
  data = JSON.parse(text);
} catch (err) {
  console.error("Non-JSON response:", text);
  alert("Unexpected server error. Please try again.");
  return;
}
      console.log("Login response:", data);

      if (response.ok) {
        alert(`Account created suceeded for ${data.firstName} ${data.lastName}`);
        navigate("/landing" );
      } else {
        alert(`Account creation failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">SKILLTRONICS</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl">
        {/* Grid layout for inputs */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Employee ID */}
          <label className="block font-medium col-span-1">
            Employee ID
            <input
              type="number"
              min = '0'
              pattern = "[0-9]*"
               inputMode="numeric"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>




          {/* First Name */}
          <label className="block font-medium col-span-1">
            First Name
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>

          {/* Last Name */}
          <label className="block font-medium col-span-1">
            Last Name
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>

        

       
        </div>

      
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Create Question
        </button>
      </form>
    </div>
  );
}
