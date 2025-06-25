import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  CourseID: number;
  Title: string;
}

interface CourseWithStatus extends Course {
  canTakeTest: boolean;
}

export default function Taketest() {
  const [courses, setCourses] = useState<CourseWithStatus[]>([]);
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

        const withStatus = await Promise.all(
          data.map(async (course) => {
            const progRes = await fetch(
              `http://localhost:5000/progress/status?courseID=${course.CourseID}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const progData = await progRes.json();
            return {
              ...course,
              canTakeTest: progData.canTakeTest ?? false,
            };
          })
        );

        setCourses(withStatus);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Choose a Course to Take</h1>

      {courses.map((c) => (
        <button
          key={c.CourseID}
          className={`block w-full text-left rounded p-3 mb-2 ${
            c.canTakeTest
              ? "bg-blue-200 hover:bg-blue-300"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          onClick={() => c.canTakeTest && navigate(`/test/${c.CourseID}`)}
          disabled={!c.canTakeTest}
        >
          {c.Title}
          {!c.canTakeTest && (
            <span className="ml-2 text-sm italic text-red-500">
              (Review lessons first)
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
