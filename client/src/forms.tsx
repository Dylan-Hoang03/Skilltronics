import { useState } from "react";
import logo from "./assets/logo.png"; // adjust the path if needed
import { useNavigate } from "react-router-dom";



export default function Form() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()



  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();


  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userName,
        password: password,
        admin: isAdmin
      }),
    });

    const data = await response.json();

    console.log("Login response:", data);


if (response.ok) {
  alert(`Login successful! Welcome ${data.user.firstName} ${data.user.lastName}`);
  localStorage.setItem("token", data.token);
  localStorage.setItem("isAdmin", JSON.stringify(data.user.isAdmin));

  if (data.user.isAdmin) {
    navigate("/landing");
  } else {
    navigate("/landingnotadmin");
  }
}
else{
  alert("Wrong credentials")
}

  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login.");
  }
};


  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 h-8 w-auto text-2xl text-blue-800">
        SKILLTRONICS
      </h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-xl">
        <label className="block mb-4 font-medium">
          Enter your Email:
          <input
            type="text"
            value={userName}
            onChange={handleChange}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        <label className="block mb-4 font-medium">
          Enter your Password:
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handleChangePassword}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        {/* Toggle password visibility */}
        
        <div className="mb-4 flex items-center">
           <button
  type="button"
  onClick={() => setShowPassword((prev) => !prev)}
    className="mb-4 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition border-none focus:outline-none"

>
  {showPassword ? "Hide Password" : "Show Password"}
</button>
         
        </div>

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
