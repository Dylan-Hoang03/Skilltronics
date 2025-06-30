import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

interface Attempt {
  attemptID: number;
  courseID: number;
  courseTitle: string;
  score: number;
  attemptDate: string;
  isPassed: boolean;
  totalSeconds: number;
}

export default function CheckAnswer() {
  const [email, setEmail] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch("http://localhost:5000/all-users");
        const data = await res.json();
        if (Array.isArray(data.emails)) setAllEmails(data.emails);
      } catch (err) {
        console.error("Error fetching emails:", err);
      }
    };
    fetchEmails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const normalized = value.toLowerCase().trim();
    const matches = allEmails.filter((em) =>
      em.toLowerCase().includes(normalized)
    );
    setFilteredEmails(matches);
    setShowDropdown(true);
  };

  const handleSelect = (selected: string) => {
    setEmail(selected);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith("@spartronics.com")) {
      alert("Email must end with @spartronics.com");
      return;
    }

    try {
      setLoading(true);
      setAttempts([]);

      const res = await fetch(
        `http://localhost:5000/queryuser?email=${encodeURIComponent(
          normalizedEmail
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Query failed (no attempts found?)");
        setLoading(false);
        return;
      }

      setAttempts(data.attempts || []);
      console.log("Attempt data:", data.attempts);
      setLoading(false);
    } catch (err) {
      console.error("Query error:", err);
      alert("Network or server error while querying attempts.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-10 px-4">
      <button
        onClick={() => navigate("/landing")}
        className="text-white bg-blue-800 hover:bg-blue-900 px-4 rounded shadow absolute top-4 right-4 h-8 w-auto"
      >
        ← Back
      </button>

      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        eLearning Portal
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl relative"
      >
        <div className="mb-6 relative">
          <label className="block font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />

          {showDropdown && filteredEmails.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full max-w-2xl mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredEmails.map((em, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(em)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {em}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Search Attempts
        </button>
      </form>

      {/* Results Table */}
      <div className="mt-8 w-[90%] max-w-4xl max-h-[50vh] overflow-auto bg-white rounded-lg shadow-md border">
        {loading && (
          <p className="text-center text-lg font-medium text-blue-800 p-4">
            Loading…
          </p>
        )}

        {!loading && attempts.length === 0 && (
          <p className="text-center text-lg text-gray-700 p-4">
            No attempts to show.
          </p>
        )}

        {!loading && attempts.length > 0 && (
          <table className="w-full border-collapse">
            <thead className="bg-blue-600 text-white sticky top-0">
              <tr>
                <th className="py-2 px-4 text-left">Attempt&nbsp;ID</th>
                <th className="py-2 px-4 text-left">Course</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Score</th>
                <th className="py-2 px-4 text-left">Passed?</th>
                <th className="py-2 px-4 text-left">Time Spent</th>
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
                      ? `${Math.floor(a.totalSeconds / 60)} min ${
                          a.totalSeconds % 60
                        } sec`
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
