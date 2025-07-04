import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Assigncourse() {
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoursesAndEmails = async () => {
      try {
        const [courseRes, emailRes] = await Promise.all([
          fetch("http://localhost:5000/all-courses"),
          fetch("http://localhost:5000/all-users"),
        ]);

        const courseData = await courseRes.json();
        const emailData = await emailRes.json();

        if (Array.isArray(courseData.courses)) setAllCourses(courseData.courses);
        if (Array.isArray(emailData.emails)) setAllEmails(emailData.emails);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchCoursesAndEmails();
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseName(value);
    const matches = allCourses.filter((c) =>
      c.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCourses(matches);
    setShowDropdown(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmployeeEmail(value);
    const matches = allEmails.filter((email) =>
      email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmails(matches);
    setShowEmailDropdown(true);
  };

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

        {/* Course Name Input + Autocomplete */}
        <label className="block mb-4 font-medium relative">
          Enter the Course Name:
          <input
            type="text"
            value={courseName}
            onChange={handleCourseChange}
            onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
            className="block mt-2 p-2 border rounded w-full"
          />
          {showDropdown && filteredCourses.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow max-h-48 overflow-auto">
              {filteredCourses.map((course) => (
                <li
                  key={course}
                  onClick={() => {
                    setCourseName(course);
                    setShowDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {course}
                </li>
              ))}
            </ul>
          )}
        </label>

        {/* Email Input + Autocomplete */}
        <label className="block mb-4 font-medium relative">
          Enter the Employee Email:
          <input
            type="email"
            value={employeeEmail}
            onChange={handleEmailChange}
            onBlur={() => setTimeout(() => setShowEmailDropdown(false), 100)}
            className="block mt-2 p-2 border rounded w-full"
          />
          {showEmailDropdown && filteredEmails.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow max-h-48 overflow-auto">
              {filteredEmails.map((email) => (
                <li
                  key={email}
                  onClick={() => {
                    setEmployeeEmail(email);
                    setShowEmailDropdown(false);
                  }}
                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
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
