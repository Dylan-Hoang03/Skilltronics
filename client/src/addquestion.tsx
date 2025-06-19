import { useState } from "react";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseBlurb, setCourseBlurb] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", "", ""]); 
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D" | "E">("A");

  const navigate = useNavigate();

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const clearForm = () => {
    setQuestionText("");
    setOptions(["", "", "", "", ""]);
    setCorrect("A");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (options.some((opt) => !opt.trim())) {
      alert("Please fill in all five answer choices.");
      return;
    }

    // --- POST to backend (placeholder URL) ---
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/createquestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseTitle : courseTitle.trim(),
          courseBlurb : courseBlurb.trim(),
          questionText : questionText.trim(),
          options:options.map((opt) => opt.trim()) ,      // ["ITs true", "Its false", ...]
          correct,      // "A"
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Server error");
      }

      alert("Question saved!");
      // Ask if user wants to add another question
      if (window.confirm("Add another question to this course?")) {
        clearForm();                  // stay on page, blank fields
      } else {
        navigate("/landing");         // or wherever
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <img src={logo} alt="Logo" className="absolute top-4 right-4 h-8 w-auto" />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">SKILLTRONICS</h1>

      <form onSubmit={handleSubmit} className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-3xl space-y-6">
        {/* Course title (only entered once per session) */}
        <label className="block">
          <span className="font-medium">Course Title</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            required
          />
        </label>

         <label className="block">
          <span className="font-medium">Course Description</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            value={courseBlurb}
            onChange={(e) => setCourseBlurb(e.target.value)}
            required
          />
        </label>

        {/* Question text */}
        <label className="block">
          <span className="font-medium">Question</span>
          <textarea
            className="mt-2 p-2 border rounded w-full h-24 resize-none"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </label>

        {/* Answer choices A–E */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["A", "B", "C", "D", "E"].map((label, idx) => (
            <label key={label} className="flex flex-col">
              <span className="font-medium mb-1">
                Option {label}
                <input
                  type="radio"
                  name="correct"
                  className="ml-2"
                  value={label}
                  checked={correct === label}
                  onChange={() => setCorrect(label as any)}
                />
                <span className="text-sm ml-1">Correct</span>
              </span>
              <input
                className="p-2 border rounded"
                value={options[idx]}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                required
              />
            </label>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Save Question
        </button>
      </form>
    </div>
  );
}
