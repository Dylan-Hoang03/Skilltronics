import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Assigncourse() {
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const idRes = await fetch(`http://localhost:5000/courseid?name=${encodeURIComponent(courseName)}`);
      const idData = await idRes.json();

      if (!idRes.ok || !idData.courseID) {
        throw new Error(idData.error || "Course not found.");
      }

      const courseID = idData.courseID;

      const res = await fetch("http://localhost:5000/assigncourse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseID, employeeID: employeeEmail }),
      });

      const data = await res.json();
      console.log("Assign response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Assignment failed.");
      }

      const assignMore = window.confirm("Course assigned successfully! Do you want to assign another course?");
      if (assignMore) {
        setEmployeeEmail("");
        setCourseName("");
      } else {
        navigate("/landing");
      }
    } catch (err: any) {
      console.error("Assignment error:", err);
      alert(err.message || "An error occurred during assignment.");
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-600 to-white px-4">
      <h1 className="absolute top-4 left-4 text-2xl text-blue-800">eLearning Portal</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-6 rounded shadow-xl w-full max-w-md">
        <label className="block mb-4 font-medium">
          Enter the Course Name:
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        <label className="block mb-4 font-medium">
          Enter the Employee Email:
          <input
            type="email"
            value={employeeEmail}
            onChange={(e) => setEmployeeEmail(e.target.value)}
            className="block mt-2 p-2 border rounded w-full"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Assign Course
        </button>
      </form>

      {/* Back Button */}
      <button
        onClick={() => navigate("/landing")}
        className="text-white bg-blue-800 hover:bg-blue-900 px-4 rounded shadow absolute top-4 right-4 h-8 w-auto"
      >
        ← Back
      </button>
    </div>
  );
}
