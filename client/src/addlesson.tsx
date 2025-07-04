import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Assigncourse() {
  const [courseName, setCourseName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");

  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);

  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      if (!res.ok) throw new Error(data.error || "Assignment failed.");

      const assignMore = window.confirm("Course assigned! Assign another?");
      if (assignMore) {
        setCourseName("");
        setEmployeeEmail("");
      } else {
        navigate("/landing");
      }
    } catch (err: any) {
      alert(err.message || "Assignment failed.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/landing")}
        className="text-white bg-blue-800 hover:bg-blue-900 px-4 rounded shadow absolute top-4 right-4 h-8 w-auto"
      >
        ← Back
      </button>

      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        eLearning Portal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-xl space-y-6 relative"
      >
        {/* Course Name Input */}
        <label className="block relative">
          <span className="font-medium">Course Name</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="e.g. EMS Orientation"
            value={courseName}
            onChange={(e) => {
              const value = e.target.value;
              setCourseName(value);
              const matches = allCourses.filter((c) =>
                c.toLowerCase().includes(value.toLowerCase())
              );
              setFilteredCourses(matches);
              setShowCourseDropdown(true);
            }}
            onFocus={() => setShowCourseDropdown(true)}
            onBlur={() => setTimeout(() => setShowCourseDropdown(false), 200)}
            required
          />
          {showCourseDropdown && filteredCourses.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredCourses.map((c, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setCourseName(c);
                    setShowCourseDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </label>

        {/* Email Input */}
        <label className="block relative">
          <span className="font-medium">Employee Email</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="e.g. jane.doe@example.com"
            value={employeeEmail}
            onChange={(e) => {
              const value = e.target.value;
              setEmployeeEmail(value);
              const matches = allEmails.filter((email) =>
                email.toLowerCase().includes(value.toLowerCase())
              );
              setFilteredEmails(matches);
              setShowEmailDropdown(true);
            }}
            onFocus={() => setShowEmailDropdown(true)}
            onBlur={() => setTimeout(() => setShowEmailDropdown(false), 200)}
            required
          />
          {showEmailDropdown && filteredEmails.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredEmails.map((email, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setEmployeeEmail(email);
                    setShowEmailDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {email}
                </li>
              ))}
            </ul>
          )}
        </label>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Assign Course
        </button>
      </form>
    </div>
  );
}
