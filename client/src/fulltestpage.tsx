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
    const fetchQuestions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/questions/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status} – ${raw}`);

        const data = JSON.parse(raw);
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId]);

  const handleSelect = (qid: number, choice: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: choice }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => !answers[q.QuestionID]);
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
        body: JSON.stringify({ courseId, answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      alert(
        `Submitted!\nScore: ${data.correct}/${data.total} (${(
          (100 * data.correct) /
          data.total
        ).toFixed(1)}%)`
      );

      navigate("/landingnotadmin");
    } catch (err: any) {
      alert("Could not submit test: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-lg text-blue-800">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 to-white py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-8">
        <h1 className="text-3xl font-bold text-blue-800">
          Course #{courseId} Assessment
        </h1>

        {questions.map((q, idx) => (
          <div
            key={q.QuestionID}
            className="rounded-lg border border-gray-300 p-5 shadow-sm bg-gray-50"
          >
            <p className="text-lg font-semibold mb-4 text-gray-800">
              {idx + 1}. {q.QuestionText}
            </p>

            <div className="grid gap-3">
              {q.options.map((choice) => (
                <label
                  key={choice.optionChoice}
                  className={`flex items-center gap-3 p-3 rounded-md border transition cursor-pointer ${
                    answers[q.QuestionID] === choice.optionChoice
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.QuestionID}`}
                    value={choice.optionChoice}
                    checked={answers[q.QuestionID] === choice.optionChoice}
                    onChange={() =>
                      handleSelect(q.QuestionID, choice.optionChoice)
                    }
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="text-gray-700">
                    <span className="font-medium mr-2">
                      {choice.optionChoice}.
                    </span>
                    {choice.answerText}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg text-lg font-semibold transition disabled:opacity-50"
            disabled={questions.some((q) => !answers[q.QuestionID])}
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
