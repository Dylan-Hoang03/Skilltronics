import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  CourseID: number;
  Title: string;
}

export default function TakeLesson() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load courses");
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 to-white py-6 px-4 flex flex-col items-center">
      
      {/* Top navigation bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8">
        <h1 className="absolute top-4 left-4 text-2xl text-blue-800">eLearning Portal</h1>
        <button
          onClick={() => navigate("/landingnotadmin")}
          className="text-white bg-blue-800 hover:bg-blue-900 px-4  rounded shadow absolute top-4 right-4 h-8 w-auto "
        >
          ← Back
        </button>
      </div>

      {/* Course selection */}
      <div className="w-full max-w-2xl space-y-4">
        <h2 className="text-3xl font-bold text-white mb-4">Review Course Material</h2>

        {loading && (
          <p className="text-center text-lg font-medium text-blue-800">Loading…</p>
        )}
        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}

        {!loading &&
          !error &&
          courses.map((c) => (
            <button
              key={c.CourseID}
              className="w-full text-left px-6 py-4 rounded-lg transition shadow font-medium text-lg bg-white hover:bg-blue-100 border border-blue-500 text-blue-800"
              onClick={() => navigate(`/lesson/${c.CourseID}`)}
            >
              {c.Title}
            </button>
          ))}
      </div>
    </div>
  );
}
