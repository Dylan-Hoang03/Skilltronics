import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Attempt {
  attemptID: number;
  courseID: number;
  courseTitle: string;
  score: number;
  attemptDate: string;
  isPassed: boolean;
  totalSeconds: number;
}

export default function ViewOwnScore() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    const fetchAttempts = async () => {
      try {
        const res = await fetch("http://localhost:5000/my-attempts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        const data = await res.json();
        console.log(data)

        if (!res.ok) {
          setError(data.error || "Failed to load attempts");
          return;
        }

        setAttempts(data.attempts || []);
      } catch (err) {
        console.error("Error fetching attempts:", err);
        setError("Network or server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-10 px-4">
      {/* Header / branding */}
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">eLearning Portal</h1>
      <button
          onClick={() => navigate("/landingnotadmin")}
          className="text-white bg-blue-800 hover:bg-blue-900 px-4  rounded shadow absolute top-4 right-4 h-8 w-auto "
        >
          ← Back
        </button>

      <h2 className="text-3xl font-bold text-white mb-6">Your Test Attempts</h2>

      {/* Results Table */}
      <div className="mt-4 w-[90%] max-w-4xl max-h-[50vh] overflow-auto bg-white rounded-lg shadow-md border">
        {loading && (
          <p className="text-center text-lg font-medium text-blue-800 p-4">Loading…</p>
        )}

        {error && (
          <p className="text-center text-red-600 font-medium p-4">{error}</p>
        )}

        {!loading && !error && attempts.length === 0 && (
          <p className="text-center text-lg text-gray-700 p-4">No attempts to show.</p>
        )}

        {!loading && !error && attempts.length > 0 && (
          <table className="w-full border-collapse">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                <th className="py-2 px-4 text-left">Attempt ID</th>
                <th className="py-2 px-4 text-left">Course</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Score</th>
                <th className="py-2 px-4 text-left">Passed?</th>
                <th className="py-2 px-4 text-left">Time Spent Learning</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.attemptID} className="odd:bg-gray-100 even:bg-gray-50">
                  <td className="py-2 px-4">{a.attemptID}</td>
                  <td className="py-2 px-4">{a.courseTitle}</td>
                  <td className="py-2 px-4">
                    {new Date(a.attemptDate).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">{a.score}</td>
                  <td className="py-2 px-4">{a.isPassed ? "Passed" : "Failed"}</td>
                  <td className="py-2 px-4">
                    {Number.isFinite(a.totalSeconds)
                      ? `${Math.floor(a.totalSeconds / 60)} min ${a.totalSeconds % 60} sec`
                      : "0 min 0 sec"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
