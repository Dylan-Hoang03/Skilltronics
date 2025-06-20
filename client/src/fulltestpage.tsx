import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


interface Question {
  QuestionID: number;
  QuestionText: string;
  options: { optionChoice: string; answerText: string }[];
}


export default function FullTestPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  console.log(" useEffect triggered. courseId =", courseId);

  const fetchQuestions = async () => {
    const t0 = performance.now();              
    const token = localStorage.getItem("token");
    console.log(" Token present? ", !!token);

    if (!token) {
      console.warn("  No token - skipping fetch");
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      const url = `http://localhost:5000/questions/${courseId}`;
      console.log(" [REQ] GET", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(" [RES] status =", res.status);

      res.headers.forEach((v, k) => console.debug(`📜 header ${k}:`, v));

      const raw = await res.text();             
      console.log("🧾 [RAW] first 200 chars:", raw.slice(0, 200));

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – ${raw}`);
      }

      const data = JSON.parse(raw);
      console.log(" [JSON] parsed", data.length, "questions");
      setQuestions(data);
    } catch (err: any) {
      console.error(" Fetch failed:", err);
      setError(err.message);
    } finally {
      const t1 = performance.now();
      console.log(` fetchQuestions finished in ${(t1 - t0).toFixed(1)} ms`);
      setLoading(false);
    }
  };

  fetchQuestions();
}, [courseId]);


  /* -------------------- HANDLERS -------------------- */
  const handleSelect = (qid: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

const handleSubmit = async () => {
  // 1. client-side completeness check
  const unanswered = questions.filter(q => !answers[q.QuestionID]);
  if (unanswered.length) {
    alert("Please answer every question before submitting.");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId,
        answers,                // e.g. { "12": "B", "13": "C" }
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Submission failed");

    alert(
      ` Submitted!\nScore: ${data.correct}/${data.total}  (${(
        (100 * data.correct) /
        data.total
      ).toFixed(1)}%)`
    );

    navigate("/landingnotadmin");
  } catch (err: any) {
    console.error("Submit error:", err);
    alert("Could not submit test: " + err.message);
  }
};


  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-4">Course #{courseId} Assessment</h1>

      {questions.map((q, idx) => (
        <div
          key={q.QuestionID}
          className="rounded-lg border border-gray-300 p-6 shadow-sm bg-white"
        >
          {/* question text */}
          <p className="font-semibold mb-3">
            {idx + 1}. {q.QuestionText}
          </p>

          {/* answer options */}
          <div className="grid gap-2">
            {q.options.map((choice) => (
              <label
                key={choice.optionChoice}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition border ${
                    answers[q.QuestionID] === choice.optionChoice
                      ? "bg-blue-50 border-blue-400"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${q.QuestionID}`}
                  value={choice.optionChoice}
                  checked={answers[q.QuestionID] === choice.optionChoice}
                  onChange={() => handleSelect(q.QuestionID, choice.optionChoice)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span>
                  <span className="font-medium mr-1">{choice.optionChoice}.</span>
                  {choice.answerText}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* submit button */}
      <button
        onClick={handleSubmit}
        className="w-full md:w-auto bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        disabled={questions.some((q) => !answers[q.QuestionID])}
      >
        Submit Test
      </button>
    </div>
  );
}
