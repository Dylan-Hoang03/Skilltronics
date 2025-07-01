import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddQuestion() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseBlurb] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", "", ""]);
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D" | "E">("A");
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/all-courses");
        const data = await res.json();
        if (Array.isArray(data.courses)) {
          setAllCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

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

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseTitle(value);
    const matches = allCourses.filter((c) =>
      c.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCourses(matches);
    setShowDropdown(true);
  };

  const handleSelectCourse = (selected: string) => {
    setCourseTitle(selected);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (options.some((opt) => !opt.trim())) {
      alert("Please fill in all five answer choices.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/createquestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseTitle: courseTitle.trim(),
          courseBlurb: courseBlurb.trim(),
          questionText: questionText.trim(),
          options: options.map((opt) => opt.trim()),
          correct,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Server error");
      }

      alert("Question saved!");

      if (window.confirm("Add another question to this course?")) {
        clearForm();
      } else {
        navigate("/landing");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-12 px-4">
      <button
        onClick={() => navigate("/landing")}
        className="text-white bg-blue-800 hover:bg-blue-900 px-4 rounded shadow absolute top-4 right-4 h-8 w-auto"
      >
        ← Back
      </button>

      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        eLearning Portal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl space-y-6 relative"
      >
        {/* Course Title with Autocomplete */}
        <label className="block relative">
          <span className="font-medium">Course Title</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            value={courseTitle}
            onChange={handleCourseChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            required
          />
          {showDropdown && filteredCourses.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredCourses.map((c, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectCourse(c)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </label>

        {/* Question Text */}
        <label className="block">
          <span className="font-medium">Question</span>
          <textarea
            className="mt-2 p-2 border rounded w-full h-24 resize-none"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </label>

        {/* Answer Options */}
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
