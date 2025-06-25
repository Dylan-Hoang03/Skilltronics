import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

/** Adjust to whatever your API returns. */
interface Attempt {
  attemptID: number;
  courseID: number;
  courseTitle: string;
  score: number;
  attemptDate: string; // ISO
  isPassed: boolean;
}


export default function CheckAnswer() {
  const [email, setEmail] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith("@spartronics.com")) {
      alert("Email must end with @spartronics.com");
      return;
    }

    try {
      setLoading(true);
      setAttempts([]);          // clear old results

      /** ⬇️  GET /attempts?email=… (adjust route/method to match your back-end) */
     const res = await fetch(
  `http://localhost:5000/queryuser?email=${encodeURIComponent(normalizedEmail)}`
);

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Query failed (no attempts found?)");
        setLoading(false);
        return;
      }

      setAttempts(data.attempts || []); // expect { attempts: [...] }
      setLoading(false);
      // If you still want to go somewhere else after the query, call navigate()
      // navigate("/");
    } catch (err) {
      console.error("Query error:", err);
      alert("Network or server error while querying attempts.");
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      {/* Header / branding */}
      <img
        src={logo}
        alt="Logo"
        className="absolute top-4 right-4 h-8 w-auto"
      />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        SKILLTRONICS
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl"
      >
        <div className="grid grid-cols-2 gap-6 mb-6">
          <label className="block font-medium col-span-2">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 p-2 border rounded w-full"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Search Attempts
        </button>
      </form>

      {/* Results */}
      <div className="absolute bottom-10 w-[90%] max-w-4xl">
        {loading && (
          <p className="text-center text-lg font-medium text-blue-800">
            Loading…
          </p>
        )}

        {!loading && attempts.length === 0 && (
          <p className="text-center text-lg text-gray-700">
            No attempts to show.
          </p>
        )}

        {!loading && attempts.length > 0 && (
          <table className="w-full mt-6 border-collapse bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
  <tr>
    <th className="py-2 px-4 text-left">Attempt&nbsp;ID</th>
    <th className="py-2 px-4 text-left">Course</th>
    <th className="py-2 px-4 text-left">Date</th>
    <th className="py-2 px-4 text-left">Score</th>
    <th className="py-2 px-4 text-left">Passed?</th>
  </tr>
</thead>
<tbody>
  {attempts.map(a => (
    <tr key={a.attemptID} className="odd:bg-gray-100 even:bg-gray-50">
      <td className="py-2 px-4">{a.attemptID}</td>
      <td className="py-2 px-4">{a.courseTitle}</td>
      <td className="py-2 px-4">
        {new Date(a.attemptDate).toLocaleString()}
      </td>
      <td className="py-2 px-4">{a.score}</td>
      <td className="py-2 px-4">{a.isPassed ? "Passed" : "Failed"}</td>
    </tr>
  ))}
</tbody>

          </table>
        )}
      </div>
    </div>
  );
}
