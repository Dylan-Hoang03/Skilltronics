import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  CourseID: number;
  Title: string;
}

interface CourseWithStatus extends Course {
  canTakeTest: boolean;
    hasPassed: boolean;

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
                  hasPassed: progData.haspassed,
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-12 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Available Courses</h1>
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

      <div className="w-full max-w-2xl space-y-4">
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
    className={`w-full text-left px-6 py-4 rounded-lg transition shadow font-medium text-lg ${
      c.hasPassed
        ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300"
        : c.canTakeTest
        ? "bg-white hover:bg-blue-100 border border-blue-500 text-blue-800"
        : "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
    }`}
    onClick={() =>
      c.canTakeTest && !c.hasPassed && navigate(`/test/${c.CourseID}`)
    }
    disabled={!c.canTakeTest || c.hasPassed}
  >
    <div className="flex justify-between items-center">
      <span>
        {c.Title}
        {c.hasPassed && (
          <span className="ml-2 text-green-600 font-semibold">PASSED ✅</span>
        )}
      </span>

      {!c.hasPassed && !c.canTakeTest && (
        <span className="text-sm italic text-red-500">
          (Review lessons first)
        </span>
      )}
    </div>
  </button>
))
}
      </div>
    </div>
  );
}
