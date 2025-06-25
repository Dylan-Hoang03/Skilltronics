import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  CourseID: number;
  Title: string;
}

export default function TakeLesson() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load courses");
        /* ‼️ If your backend sends { courses:[...] } wrap with .courses */
        const data: Course[] = await res.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);              // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="p-4">Loading…</p>;
  if (error)   return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Choose a Course to Learn</h1>

      {courses.map((c) => (
        <button
          key={c.CourseID}
          className="block w-full text-left bg-blue-200 hover:bg-blue-300 rounded p-3 mb-2"
          onClick={() => navigate(`/lesson/${c.CourseID}`)}
        >
          {c.Title}
        </button>
      ))}
    </div>
  );
}
